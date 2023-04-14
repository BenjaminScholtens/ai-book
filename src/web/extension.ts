import * as vscode from "vscode"
import {
  MessageJSONSerializer,
  MessageJSONSerializerOptions,
} from "./MessageJSONSerializer"
import { ControllerFromRunner } from "./ControllerFromRunner"
import { MakeOpenAiRunner } from "./OpenAiRunner"

export function activate(context: vscode.ExtensionContext) {
  const notebookType = "llm-book"

  const notebookSerializer = vscode.workspace.registerNotebookSerializer(
    notebookType,
    MessageJSONSerializer,
    MessageJSONSerializerOptions,
  )

  const updateOpenAiKeyCommand = vscode.commands.registerCommand(
    "llm-book.updateOpenAIKey",
    async () => {
      const apiKey = await vscode.window.showInputBox({
        ignoreFocusOut: true,
        password: true,
        title: "Enter OpenAI API Key",
      })
      if (!apiKey) {
        vscode.window.showErrorMessage("Cannot proceed without API key")
        return
      }

      await context.secrets.store("ai-book.openAI.apiKey", apiKey)
      return apiKey
    },
  )

  const notebookController = vscode.notebooks.createNotebookController(
    "llm-book-openai",
    notebookType,
    "OpenAI",
    ControllerFromRunner(MakeOpenAiRunner(context)),
  )

  notebookController.supportedLanguages = ["system", "user", "assistant"]

  context.subscriptions.push(
    notebookSerializer,
    notebookController,
    updateOpenAiKeyCommand,
  )
}

export function deactivate() {}
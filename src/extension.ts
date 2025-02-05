import * as vscode from 'vscode';
import ollama from 'ollama';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vs-deepseek-ext" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('vs-deepseek-ext.start', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		const panel = vscode.window.createWebviewPanel(
			'deepChat',
			'Deep Seek Chat',
			vscode.ViewColumn.One,
			{ enableScripts: true }
		);

		panel.webview.html = getWebviewContent();

		panel.webview.onDidReceiveMessage(async (message) => {
			if (message.command === 'chat') {
				const userPrompt = message.text;
				let responseText = '';

				try {
					const streamResponse = await ollama.chat({
						model: 'deepseek-r1:1.5b',
						messages: [{ role: 'user', content: userPrompt }],
						stream: true
					});

					for await (const part of streamResponse) {
						responseText += part.message.content;
						panel.webview.postMessage({ command: 'chatResponse', text: responseText });
					}
				}
				catch (err) {
					panel.webview.postMessage({
            command: "chatResponse",
            text: err,
          });
				}
			}
		})
	});

	const disposable2 = vscode.commands.registerCommand('vs-deepseek-ext.hiMom', () => {
		vscode.window.showErrorMessage('Hi Mom!');
	})

	context.subscriptions.push(disposable);
	context.subscriptions.push(disposable2);
}

function getWebviewContent() {
	return /*html*/ `
	<!DOCTYPE html>
	<html lang="en">
		<head>
			<meta charset="UTF-8" />
			<style>
				body {
					font-family: sans-serif;
					margin: 1rem;
				}
				#prompt {
					width: 100%;
					box-sizing: border-box;
				}

				/* ✅ Style the "think" section */
				think {
					color: 'grey';
					font-style: italic;
					opacity: 0.7;
					display: block;
					margin-bottom: 0.5rem;
				}
				think ~ * {
					all: revert;
				}
				#response {
					border: 1px solid #ccc;
					margin-top: 1rem;
					padding: 0.5rem;
					color: white;
					font-style: normal;
					white-space: pre-line;
				}
			</style>
		</head>
		<body>
			<h2>Deep VS Code Extension</h2>
			<textarea id="prompt" rows="3" placeholder="Ask something..."></textarea>
			<button id="askBtn">Ask</button>
			<div id="response" ></div>
			<div id="copy" ></div>

			<script>
				document.addEventListener("DOMContentLoaded", function() {
					document.getElementById('prompt').focus();
				});
			</script>
			<script>
        class MyCard extends HTMLElement {
            constructor() {
                super();
                this.innerHTML = "<p>🧠 Thinking... <slot></slot></p>";
            }
        }

        customElements.define("think", MyCard);
   		</script>
			<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script> <!-- Include Marked.js -->
			<script src="https://cdn.jsdelivr.net/npm/markdown-it@14.1.0/dist/markdown-it.min.js"></script>
			<script>
				const vscode = acquireVsCodeApi();

				document.getElementById('askBtn').addEventListener('click', () => {
					const text = document.getElementById('prompt').value;
					vscode.postMessage({ command: 'chat', text});
				});

				window.addEventListener('message', event => {
					const { command, text } = event.data;
					if (command === 'chatResponse') {
						//const processedText = processResponse(text);

						document.getElementById('response').innerHTML = text;
						//document.getElementById('copy').innerText = text;
					}
				});


			</script>
		</body>
	</html>

	`;
}

// This method is called when your extension is deactivated
export function deactivate() {}

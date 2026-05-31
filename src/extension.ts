import * as fs from 'fs';
import * as path from 'path';
import type { ChildProcess } from 'child_process';
import * as vscode from 'vscode';
import createPlayer = require('play-sound');

const CONFIG_SECTION = 'sayaAkanLawan';
const CONFIG_ENABLED = 'enabled';
const DIAGNOSTIC_DEBOUNCE_MS = 1500;

const player = createPlayer();

let debounceTimer: NodeJS.Timeout | undefined;
let audioProcess: ChildProcess | undefined;

export function activate(context: vscode.ExtensionContext) {
	const audioPath = path.join(context.extensionPath, 'media', 'lawan.mp3');

	const scheduleDiagnosticCheck = () => {
		if (debounceTimer) {
			clearTimeout(debounceTimer);
		}

		debounceTimer = setTimeout(() => {
			debounceTimer = undefined;
			checkDiagnosticsAndPlay(audioPath);
		}, DIAGNOSTIC_DEBOUNCE_MS);
	};

	context.subscriptions.push(
		vscode.languages.onDidChangeDiagnostics(scheduleDiagnosticCheck),
		vscode.workspace.onDidChangeConfiguration((event) => {
			if (event.affectsConfiguration(`${CONFIG_SECTION}.${CONFIG_ENABLED}`)) {
				if (isExtensionEnabled()) {
					scheduleDiagnosticCheck();
				} else {
					stopAudio();
				}
			}
		}),
		{
			dispose: () => {
				if (debounceTimer) {
					clearTimeout(debounceTimer);
				}

				stopAudio();
			},
		},
	);

	scheduleDiagnosticCheck();
}

export function deactivate() {
	if (debounceTimer) {
		clearTimeout(debounceTimer);
	}

	stopAudio();
}

function checkDiagnosticsAndPlay(audioPath: string) {
	if (!isExtensionEnabled()) {
		stopAudio();
		return;
	}

	const hasErrors = hasDiagnosticError();

	if (!hasErrors) {
		stopAudio();
		return;
	}

	if (audioProcess) {
		return;
	}

	playLocalAudio(audioPath);
}

function isExtensionEnabled() {
	return vscode.workspace
		.getConfiguration(CONFIG_SECTION)
		.get<boolean>(CONFIG_ENABLED, true);
}

function hasDiagnosticError() {
	return vscode.languages.getDiagnostics().some(([, diagnostics]) =>
		diagnostics.some((diagnostic) => diagnostic.severity === vscode.DiagnosticSeverity.Error),
	);
}

function playLocalAudio(audioPath: string) {
	if (!fs.existsSync(audioPath)) {
		console.warn(`Audio file not found: ${audioPath}`);
		return;
	}

	try {
		const process = player.play(audioPath, (error) => {
			audioProcess = undefined;

			if (error) {
				console.error('Failed to play lawan.mp3:', error);
				return;
			}

			if (isExtensionEnabled() && hasDiagnosticError()) {
				playLocalAudio(audioPath);
			}
		}) as ChildProcess | null;

		if (!process) {
			audioProcess = undefined;
			console.error('Failed to start audio process.');
			return;
		}

		audioProcess = process;
		audioProcess.once('error', (error) => {
			audioProcess = undefined;
			console.error('Audio process error:', error);
		});
	} catch (error) {
		audioProcess = undefined;
		console.error('Failed to play lawan.mp3:', error);
	}
}

function stopAudio() {
	if (audioProcess && !audioProcess.killed) {
		audioProcess.kill();
	}

	audioProcess = undefined;
}

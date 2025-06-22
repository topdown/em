import { KeyCode, KeyboardAction, Status } from "../../Enums";
import { error } from "../../utils/Common";
import { SearchComponent } from "../SearchComponent";
import { UserEvent } from "../../Interfaces";
import { isModifierKey } from "../ViewUtils";
import { services } from "../../services/index";
import { ApplicationComponent } from "../ApplicationComponent";
import { clipboard } from "electron";

export type KeybindingType = {
    action: KeyboardAction,
    keybinding: (e: KeyboardEvent) => boolean,
};

function isCtrlOrCmd(e: KeyboardEvent): boolean {
    /**
     * Decides if a keyboard event contains the meta key for all platforms
     * Linux does not support the metaKey so it can be manually changed here
     * Windows/OSX is simply e.metaKey
     */
    if (e.metaKey) {
        return true;
    } else if (process.platform === "linux") {
        return e.ctrlKey;
    }
    return false;
}

export const KeybindingsForActions: KeybindingType[] = [
    // CLI commands
    {
        action: KeyboardAction.cliClearJobs,
        keybinding: (e: KeyboardEvent) => e.ctrlKey && e.keyCode === KeyCode.L,
    },
    {
        action: KeyboardAction.cliClearText,
        // Need to include !shiftKey otherwise it will clear instead of copying
        keybinding: (e: KeyboardEvent) => e.ctrlKey && e.keyCode === KeyCode.C && !e.shiftKey,
    },
    {
        action: KeyboardAction.cliAppendLastArgumentOfPreviousCommand,
        keybinding: (e: KeyboardEvent) => e.altKey && e.keyCode === KeyCode.Period,
    },
    {
        action: KeyboardAction.cliHistoryPrevious,
        keybinding: (e: KeyboardEvent) => {
            return (e.ctrlKey && e.keyCode === KeyCode.P) || (e.keyCode === KeyCode.Up);
        },
    },
    {
        action: KeyboardAction.cliHistoryNext,
        keybinding: (e: KeyboardEvent) => {
            return (e.ctrlKey && e.keyCode === KeyCode.N) || (e.keyCode === KeyCode.Down);
        },
    },
    // autocomplete commands
    {
        action: KeyboardAction.autocompleteInsertCompletion,
        keybinding: (e: KeyboardEvent) => e.keyCode === KeyCode.Tab,
    },
    {
        action: KeyboardAction.autocompletePreviousSuggestion,
        keybinding: (e: KeyboardEvent) => {
            return (e.ctrlKey && e.keyCode === KeyCode.P) || (e.keyCode === KeyCode.Up);
        },
    },
    {
        action: KeyboardAction.autocompleteNextSuggestion,
        keybinding: (e: KeyboardEvent) => {
            return (e.ctrlKey && e.keyCode === KeyCode.N) || (e.keyCode === KeyCode.Down);
        },
    },
    // tab commands
    {
        action: KeyboardAction.tabFocus,
        keybinding: (e: KeyboardEvent) => {
            return ((e.ctrlKey || isCtrlOrCmd(e)) && e.keyCode >= KeyCode.One && e.keyCode <= KeyCode.Nine);
        },
    },
    // session navigation commands
    {
        action: KeyboardAction.sessionFocusNext,
        keybinding: (e: KeyboardEvent) => {
            return isCtrlOrCmd(e) && e.altKey && e.keyCode === KeyCode.Right;
        },
    },
    {
        action: KeyboardAction.sessionFocusPrevious,
        keybinding: (e: KeyboardEvent) => {
            return isCtrlOrCmd(e) && e.altKey && e.keyCode === KeyCode.Left;
        },
    },
    // search commands
    {
        action: KeyboardAction.editFindClose,
        keybinding: (e: KeyboardEvent) => e.keyCode === KeyCode.Escape,
    },
    // =========================
    // New Tab actions
    {
        action: KeyboardAction.tabNew,
        keybinding: (e: KeyboardEvent) => isCtrlOrCmd(e) && !e.shiftKey && !e.altKey && e.keyCode === KeyCode.T,
    },
    {
        action: KeyboardAction.tabPrevious,
        keybinding: (e: KeyboardEvent) => isCtrlOrCmd(e) && !e.shiftKey && !e.altKey && (e.keyCode === KeyCode.LeftBracket || e.key === "["),
    },
    {
        action: KeyboardAction.tabNext,
        keybinding: (e: KeyboardEvent) => isCtrlOrCmd(e) && !e.shiftKey && !e.altKey && (e.keyCode === KeyCode.RightBracket || e.key === "]"),
    },
    {
        action: KeyboardAction.tabClose,
        keybinding: (e: KeyboardEvent) => isCtrlOrCmd(e) && !e.shiftKey && !e.altKey && e.keyCode === KeyCode.W,
    },
    {
        action: KeyboardAction.tabCloseOthers,
        keybinding: (e: KeyboardEvent) => isCtrlOrCmd(e) && !e.shiftKey && e.altKey && e.keyCode === KeyCode.W,
    },
    {
        action: KeyboardAction.tabMoveLeft,
        keybinding: (e: KeyboardEvent) => isCtrlOrCmd(e) && e.shiftKey && !e.altKey && (e.keyCode === KeyCode.LeftBracket || e.key === "["),
    },
    {
        action: KeyboardAction.tabMoveRight,
        keybinding: (e: KeyboardEvent) => isCtrlOrCmd(e) && e.shiftKey && !e.altKey && (e.keyCode === KeyCode.RightBracket || e.key === "]"),
    },
    // Session actions
    {
        action: KeyboardAction.sessionNew,
        keybinding: (e: KeyboardEvent) => isCtrlOrCmd(e) && !e.shiftKey && !e.altKey && e.keyCode === KeyCode.N,
    },
    {
        action: KeyboardAction.sessionClose,
        keybinding: (e: KeyboardEvent) => isCtrlOrCmd(e) && e.shiftKey && !e.altKey && e.keyCode === KeyCode.W,
    },
    {
        action: KeyboardAction.sessionCloseAll,
        keybinding: (e: KeyboardEvent) => isCtrlOrCmd(e) && e.shiftKey && e.altKey && e.keyCode === KeyCode.W,
    },
    {
        action: KeyboardAction.sessionSplitHorizontal,
        keybinding: (e: KeyboardEvent) => isCtrlOrCmd(e) && e.shiftKey && !e.altKey && e.keyCode === KeyCode.Underscore,
    },
    {
        action: KeyboardAction.sessionSplitVertical,
        keybinding: (e: KeyboardEvent) => isCtrlOrCmd(e) && !e.shiftKey && !e.altKey && e.keyCode === KeyCode.VerticalBar,
    },
    {
        action: KeyboardAction.otherSession,
        keybinding: (e: KeyboardEvent) => isCtrlOrCmd(e) && !e.shiftKey && !e.altKey && e.keyCode === KeyCode.D,
    },
];

export function isKeybindingForEvent(event: KeyboardEvent, action: KeyboardAction): boolean {
    /**
     * Finds the keybinding for the given action and returns the result of the keybinding function
     */
    let matchingKeyboardAction = KeybindingsForActions.find((keybinding) => {
        return keybinding.action === action;
    });
    if (!matchingKeyboardAction) {
        error("No matching keybinding for action: " + KeyboardAction[action]);
        return false;
    }
    return matchingKeyboardAction.keybinding(event);
}

// Menu Stuff
export type KeybindingMenuType = {
    action: KeyboardAction,
    accelerator: string,
};

const CmdOrCtrl = process.platform === "darwin" ? "Cmd" : "Ctrl";

export const KeybindingsForMenu: KeybindingMenuType[] = [
    {
        action: KeyboardAction.tabNew,
        accelerator: `${CmdOrCtrl}+T`,
    },
    {
        action: KeyboardAction.tabPrevious,
        accelerator: `${CmdOrCtrl}+[`,
    },
    {
        action: KeyboardAction.tabNext,
        accelerator: `${CmdOrCtrl}+]`,
    },
    {
        action: KeyboardAction.tabClose,
        accelerator: `${CmdOrCtrl}+W`,
    },
    {
        action: KeyboardAction.tabCloseOthers,
        accelerator: `${CmdOrCtrl}+Alt+W`,
    },
    {
        action: KeyboardAction.tabMoveLeft,
        accelerator: `${CmdOrCtrl}+Shift+[`,
    },
    {
        action: KeyboardAction.tabMoveRight,
        accelerator: `${CmdOrCtrl}+Shift+]`,
    },
    // Session commands
    {
        action: KeyboardAction.sessionNew,
        accelerator: `${CmdOrCtrl}+N`,
    },
    {
        action: KeyboardAction.sessionClose,
        accelerator: `${CmdOrCtrl}+Shift+W`,
    },
    {
        action: KeyboardAction.sessionCloseAll,
        accelerator: `${CmdOrCtrl}+Alt+Shift+W`,
    },
    {
        action: KeyboardAction.sessionSplitHorizontal,
        accelerator: `${CmdOrCtrl}+Shift+-`,
    },
    {
        action: KeyboardAction.sessionSplitVertical,
        accelerator: `${CmdOrCtrl}+\\`,
    },
    {
        action: KeyboardAction.sessionFocusNext,
        accelerator: `${CmdOrCtrl}+Alt+Right`,
    },
    {
        action: KeyboardAction.sessionFocusPrevious,
        accelerator: `${CmdOrCtrl}+Alt+Left`,
    },
    {
        action: KeyboardAction.otherSession,
        accelerator: `${CmdOrCtrl}+D`,
    },
    // edit/clipboard commands
    {
        action: KeyboardAction.clipboardCopy,
        accelerator: process.platform === "darwin" ? "Cmd+C" : "Ctrl+Shift+C",
    },
    {
        action: KeyboardAction.clipboardPaste,
        accelerator: process.platform === "darwin" ? "Cmd+V" : "Ctrl+Shift+V",
    },
    {
        action: KeyboardAction.editFind,
        accelerator: `${CmdOrCtrl}+F`,
    },
    {
        action: KeyboardAction.editFindClose,
        accelerator: "Esc",
    },
    {
        action: KeyboardAction.increaseFontSize,
        accelerator: `${CmdOrCtrl}+Plus`,
    },
    {
        action: KeyboardAction.decreaseFontSize,
        accelerator: `${CmdOrCtrl}+-`,
    },
    {
        action: KeyboardAction.resetFontSize,
        accelerator: `${CmdOrCtrl}+0`,
    },
    // view commands
    {
        action: KeyboardAction.viewToggleFullScreen,
        accelerator: "Ctrl+Shift+F",
    },
    {
        action: KeyboardAction.toggleDeveloperTools,
        accelerator: `${CmdOrCtrl}+Alt+I`,
    },
    // Upterm commands
    {
        action: KeyboardAction.uptermQuit,
        accelerator: `${CmdOrCtrl}+Q`,
    },
];


export function getAcceleratorForAction(action: KeyboardAction): string {
    /**
     * Returns the accelerator for a given keyboard action
     */
    // Find the matching menu item by keyboardAction (should only ever return one item)
    let matchingMenuItem = KeybindingsForMenu.filter((menuAction) => {
        return menuAction.action === action;
    })[0];
    return matchingMenuItem.accelerator;
}

export function isMenuShortcut(event: KeyboardEvent): boolean {
    const accelerator = toAccelerator(event);
    return !!KeybindingsForMenu.find(action => action.accelerator === accelerator);
}

function toAccelerator(event: KeyboardEvent): string {
    let parts: string[] = [];

    if (event.ctrlKey) {
        parts.push("Ctrl");
    }

    if (event.shiftKey) {
        parts.push("Shift");
    }

    if (event.metaKey) {
        parts.push("Cmd");
    }

    if (event.altKey) {
        parts.push("Alt");
    }

    // Cmd+Alt+I generates event.key Dead, but its code is KeyI.
    const key = event.key === "Dead" ? event.code.slice(3) : event.key.toUpperCase();

    parts.push(key);

    return parts.join("+");
}

export function handleUserEvent(application: ApplicationComponent, search: SearchComponent, event: UserEvent) {
    const sessionComponent = application.focusedTabComponent.focusedSessionComponent;
    if (!sessionComponent) {
        return;
    }

    // Allow the browser/Monaco to handle standard copy, cut, paste shortcuts.
    if (event instanceof KeyboardEvent) {
        const isPaste =
            (event.metaKey || event.ctrlKey) && event.keyCode === KeyCode.V;
        const isCopyCut =
            (event.metaKey || event.ctrlKey) &&
            (event.keyCode === KeyCode.C || event.keyCode === KeyCode.X);

        if (isCopyCut) {
            // Let browser handle copy/cut
            sessionComponent.promptComponent.focus();
            return;
        }

        if (isPaste) {
            const text = clipboard.readText();
            if (!text) {
                return;
            }

            if (sessionComponent.status === Status.InProgress) {
                application.focusedSession.lastJob!.write(text);
            } else {
                sessionComponent.promptComponent.insertValueInPlace(text);
            }
            event.preventDefault();
            return;
        }
    }

    // -------------------------
    // Handle keyboard shortcuts only for keyboard events
    if (event instanceof KeyboardEvent) {
        const kbEvent = event as KeyboardEvent;

        // Global Tab actions
        if (isKeybindingForEvent(kbEvent, KeyboardAction.tabNew)) {
            application.addTab();
            kbEvent.stopPropagation();
            kbEvent.preventDefault();
            return;
        }

        if (isKeybindingForEvent(kbEvent, KeyboardAction.tabPrevious)) {
            application.focusPreviousTab();
            kbEvent.stopPropagation();
            kbEvent.preventDefault();
            return;
        }

        if (isKeybindingForEvent(kbEvent, KeyboardAction.tabNext)) {
            application.focusNextTab();
            kbEvent.stopPropagation();
            kbEvent.preventDefault();
            return;
        }

        if (isKeybindingForEvent(kbEvent, KeyboardAction.tabClose)) {
            application.closeFocusedTab();
            kbEvent.stopPropagation();
            kbEvent.preventDefault();
            return;
        }

        if (isKeybindingForEvent(kbEvent, KeyboardAction.tabCloseOthers)) {
            application.closeOtherTabs();
            kbEvent.stopPropagation();
            kbEvent.preventDefault();
            return;
        }

        if (isKeybindingForEvent(kbEvent, KeyboardAction.tabMoveLeft)) {
            application.moveTabLeft();
            kbEvent.stopPropagation();
            kbEvent.preventDefault();
            return;
        }

        if (isKeybindingForEvent(kbEvent, KeyboardAction.tabMoveRight)) {
            application.moveTabRight();
            kbEvent.stopPropagation();
            kbEvent.preventDefault();
            return;
        }

        // Session actions
        if (isKeybindingForEvent(kbEvent, KeyboardAction.sessionNew)) {
            application.createNewSession();
            kbEvent.stopPropagation();
            kbEvent.preventDefault();
            return;
        }

        if (isKeybindingForEvent(kbEvent, KeyboardAction.sessionClose)) {
            application.closeFocusedSession();
            kbEvent.stopPropagation();
            kbEvent.preventDefault();
            return;
        }

        if (isKeybindingForEvent(kbEvent, KeyboardAction.sessionCloseAll)) {
            application.closeAllSessionsInTab();
            kbEvent.stopPropagation();
            kbEvent.preventDefault();
            return;
        }

        if (isKeybindingForEvent(kbEvent, KeyboardAction.sessionSplitHorizontal)) {
            application.splitSessionHorizontally();
            kbEvent.stopPropagation();
            kbEvent.preventDefault();
            return;
        }

        if (isKeybindingForEvent(kbEvent, KeyboardAction.sessionSplitVertical)) {
            application.splitSessionVertically();
            kbEvent.stopPropagation();
            kbEvent.preventDefault();
            return;
        }

        if (isKeybindingForEvent(kbEvent, KeyboardAction.otherSession)) {
            application.otherSession();
            kbEvent.stopPropagation();
            kbEvent.preventDefault();
            return;
        }

        if (isKeybindingForEvent(kbEvent, KeyboardAction.clipboardPaste)) {
            const text = clipboard.readText();
            const isJobRunning = sessionComponent.status === Status.InProgress;
            if (isJobRunning) {
                application.focusedSession.lastJob!.write(text);
            } else {
                sessionComponent.promptComponent.insertValueInPlace(text);
            }

            kbEvent.stopPropagation();
            kbEvent.preventDefault();
            return;
        }
    }

    const isJobRunning = sessionComponent.status === Status.InProgress;
    const promptComponent = sessionComponent.promptComponent;

    // Clipboard paste (Cmd/Ctrl+V or context menu Paste)
    if (event instanceof ClipboardEvent) {
        if (search.isFocused) {
            return;
        }

        if (isJobRunning) {
            // When a process is running we send pasted text directly to the PTY
            const clipboardData = event.clipboardData;
            if (clipboardData) {
                application.focusedSession.lastJob!.write(
                    clipboardData.getData("text/plain"),
                );
            }

            event.stopPropagation();
            event.preventDefault();
            return;
        }
        // Otherwise follow the browser default so Monaco receives the paste.
        return;
    }

    if (isModifierKey(event) || isMenuShortcut(event)) {
        return;
    }

    // Change focused tab
    if (isKeybindingForEvent(event, KeyboardAction.tabFocus)) {
        const position = parseInt(event.key, 10);
        application.focusTab(position - 1);

        event.stopPropagation();
        event.preventDefault();
        return;
    }

    // Session navigation
    if (isKeybindingForEvent(event, KeyboardAction.sessionFocusNext)) {
        application.focusNextSession();

        event.stopPropagation();
        event.preventDefault();
        return;
    }

    if (isKeybindingForEvent(event, KeyboardAction.sessionFocusPrevious)) {
        application.focusPreviousSession();

        event.stopPropagation();
        event.preventDefault();
        return;
    }

    // Console clear
    if (!isJobRunning && isKeybindingForEvent(event, KeyboardAction.cliClearJobs)) {
        application.focusedSession.clearJobs();

        event.stopPropagation();
        event.preventDefault();
        return;
    }

    if (search.isFocused) {
        // Search close
        if (isKeybindingForEvent(event, KeyboardAction.editFindClose)) {
            search.clearSelection();
            search.blur();

            event.stopPropagation();
            event.preventDefault();
            return;
        }

        return;
    }

    if (isJobRunning && application.focusedSession.lastJob!.isRunningPty()) {
        application.focusedSession.lastJob!.write(event);

        event.stopPropagation();
        event.preventDefault();
        return;
    }

    if (isJobRunning) {
        return;
    }

    promptComponent.focus();

    // CLI execute command
    if (event.keyCode === KeyCode.CarriageReturn) {
        promptComponent.onReturnKeyPress();

        event.stopPropagation();
        event.preventDefault();
        return;
    }

    // Append last argument to prompt
    if (isKeybindingForEvent(event, KeyboardAction.cliAppendLastArgumentOfPreviousCommand)) {
        promptComponent.appendLastLArgumentOfPreviousCommand();

        event.stopPropagation();
        event.preventDefault();
        return;
    }

    // CLI clear
    if (isKeybindingForEvent(event, KeyboardAction.cliClearText)) {
        promptComponent.clear();

        event.stopPropagation();
        event.preventDefault();
        return;
    }

    if (event.ctrlKey && event.keyCode === KeyCode.R && !promptComponent.isInHistorySearchMode) {
        promptComponent.setHistorySearchMode();

        event.stopPropagation();
        event.preventDefault();
        return;
    }

    if (event.keyCode === KeyCode.Tab) {
        promptComponent.acceptSelectedSuggestion();

        event.stopPropagation();
        event.preventDefault();
        return;
    }

    if (event.keyCode === KeyCode.Escape && promptComponent.isInHistorySearchMode) {
        promptComponent.setNormalMode();
        return;
    }
}

import { KeyboardAction } from "../../Enums";
import { shell } from "electron";
import { getAcceleratorForAction } from "../keyevents/Keybindings";
import { ApplicationComponent } from "../ApplicationComponent";
import { services } from "../../services";

export function buildMenuTemplate(
    app: Electron.App,
    browserWindow: Electron.BrowserWindow,
    application: ApplicationComponent,
): Electron.MenuItemConstructorOptions[] {
    return [
        {
            label: "Upterm",
            submenu: [
                { role: "about" },
                { type: "separator" },
                { role: "hide" },
                { role: "hideOthers" },
                { role: "unhide" },
                { type: "separator" },
                {
                    label: "Quit",
                    accelerator: getAcceleratorForAction(KeyboardAction.uptermQuit),
                    click: () => {
                        app.quit();
                    },
                },
            ],
        },
        {
            label: "Edit",
            submenu: [
                {
                    label: "Copy",
                    accelerator: getAcceleratorForAction(KeyboardAction.clipboardCopy),
                    role: "copy",
                },
                {
                    label: "Paste",
                    accelerator: getAcceleratorForAction(KeyboardAction.clipboardPaste),
                    role: "paste",
                },
                {
                    label: "Find",
                    accelerator: getAcceleratorForAction(KeyboardAction.editFind),
                    click: () => {
                        (document.querySelector("input[type=search]") as HTMLInputElement).select();
                    },
                },
                {
                    type: "separator",
                },
                {
                    label: "Increase Font Size",
                    accelerator: getAcceleratorForAction(KeyboardAction.increaseFontSize),
                    click: () => {
                        services.font.increaseSize();
                    },
                },
                {
                    label: "Decrease Font Size",
                    accelerator: getAcceleratorForAction(KeyboardAction.decreaseFontSize),
                    click: () => {
                        services.font.decreaseSize();
                    },
                },
                {
                    label: "Reset Font Size",
                    accelerator: getAcceleratorForAction(KeyboardAction.resetFontSize),
                    click: () => {
                        services.font.resetSize();
                    },
                },
            ],
        },
        {
            label: "View",
            submenu: [
                {
                    label: "Toggle Full Screen",
                    accelerator: getAcceleratorForAction(KeyboardAction.viewToggleFullScreen),
                    click: () => {
                        browserWindow.setFullScreen(!browserWindow.isFullScreen());
                    },
                },
                {
                    label: "Toggle Developer Tools",
                    accelerator: getAcceleratorForAction(KeyboardAction.toggleDeveloperTools),
                    click: () => {
                        browserWindow.webContents.toggleDevTools();
                    },
                },
            ],
        },
        {
            label: "Session",
            submenu: [
                {
                    label: "New Session",
                    accelerator: getAcceleratorForAction(KeyboardAction.sessionNew),
                    click: () => {
                        application.createNewSession();
                    },
                },
                {
                    type: "separator",
                },
                {
                    label: "Split Horizontally",
                    accelerator: getAcceleratorForAction(KeyboardAction.sessionSplitHorizontal),
                    click: () => {
                        application.splitSessionHorizontally();
                    },
                },
                {
                    label: "Split Vertically",
                    accelerator: getAcceleratorForAction(KeyboardAction.sessionSplitVertical),
                    click: () => {
                        application.splitSessionVertically();
                    },
                },
                {
                    type: "separator",
                },
                {
                    label: "Next Session",
                    accelerator: getAcceleratorForAction(KeyboardAction.sessionFocusNext),
                    click: () => {
                        application.focusNextSession();
                    },
                },
                {
                    label: "Previous Session",
                    accelerator: getAcceleratorForAction(KeyboardAction.sessionFocusPrevious),
                    click: () => {
                        application.focusPreviousSession();
                    },
                },
                {
                    type: "separator",
                },
                {
                    label: "Other Session",
                    accelerator: getAcceleratorForAction(KeyboardAction.otherSession),
                    click: () => {
                        application.otherSession();
                    },
                },
                {
                    type: "separator",
                },
                {
                    label: "Close Current Session",
                    accelerator: getAcceleratorForAction(KeyboardAction.sessionClose),
                    click: () => {
                        application.closeFocusedSession();
                    },
                },
                {
                    label: "Close All Sessions in Tab",
                    accelerator: getAcceleratorForAction(KeyboardAction.sessionCloseAll),
                    click: () => {
                        application.closeAllSessionsInTab();
                    },
                },
            ],
        },
        {
            label: "Tab",
            submenu: [
                {
                    label: "New Tab",
                    accelerator: getAcceleratorForAction(KeyboardAction.tabNew),
                    click: () => {
                        application.addTab();
                    },
                },
                {
                    type: "separator",
                },
                {
                    label: "Previous Tab",
                    accelerator: getAcceleratorForAction(KeyboardAction.tabPrevious),
                    click: () => {
                        application.focusPreviousTab();
                    },
                },
                {
                    label: "Next Tab",
                    accelerator: getAcceleratorForAction(KeyboardAction.tabNext),
                    click: () => {
                        application.focusNextTab();
                    },
                },
                {
                    type: "separator",
                },
                {
                    label: "Move Tab Left",
                    accelerator: getAcceleratorForAction(KeyboardAction.tabMoveLeft),
                    click: () => {
                        application.moveTabLeft();
                    },
                },
                {
                    label: "Move Tab Right",
                    accelerator: getAcceleratorForAction(KeyboardAction.tabMoveRight),
                    click: () => {
                        application.moveTabRight();
                    },
                },
                {
                    type: "separator",
                },
                {
                    label: "Close Current Tab",
                    accelerator: getAcceleratorForAction(KeyboardAction.tabClose),
                    click: () => {
                        application.closeFocusedTab();
                    },
                },
                {
                    label: "Close Other Tabs",
                    accelerator: getAcceleratorForAction(KeyboardAction.tabCloseOthers),
                    click: () => {
                        application.closeOtherTabs();
                    },
                },
            ],
        },
        {
            role: "window",
            submenu: [
                { role: "minimize" },
                { role: "close" },
            ],
        },
        {
            label: "Help",
            submenu: [
                {
                    label: "GitHub Repository",
                    click: () => {
                        shell.openExternal("http://l.rw.rw/upterm_repository");
                    },
                },
                {
                    label: "Leave Feedback",
                    click: () => {
                        shell.openExternal("http://l.rw.rw/upterm_leave_feedback");
                    },
                },
            ],
        },
    ];
}

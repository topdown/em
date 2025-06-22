import { BrowserWindow, Menu, MenuItemConstructorOptions, shell, App } from "electron";
import { KeyboardAction } from "../Enums";

export function attachMenu(app: App, browserWindow: BrowserWindow) {
    const send = (action: KeyboardAction) => {
        browserWindow.webContents.send("menu-action", action);
    };

    const CmdOrCtrl = process.platform === "darwin" ? "Cmd" : "Ctrl";

    const template: MenuItemConstructorOptions[] = [
        {
            label: "Em",
            submenu: [
                { role: "about" },
                { type: "separator" },
                { role: "hide" },
                { role: "hideOthers" },
                { role: "unhide" },
                { type: "separator" },
                {
                    label: "Quit",
                    accelerator: `${CmdOrCtrl}+Q`,
                    click: () => app.quit(),
                },
            ],
        },
        {
            label: "Edit",
            submenu: [
                {
                    label: "Copy",
                    accelerator: process.platform === "darwin" ? "Cmd+C" : "Ctrl+Shift+C",
                    role: "copy",
                },
                {
                    label: "Paste",
                    accelerator: process.platform === "darwin" ? "Cmd+V" : "Ctrl+Shift+V",
                    role: "paste",
                },
                {
                    label: "Find",
                    accelerator: `${CmdOrCtrl}+F`,
                    click: () => send(KeyboardAction.editFind),
                },
                { type: "separator" },
                {
                    label: "Increase Font Size",
                    accelerator: `${CmdOrCtrl}+Plus`,
                    click: () => send(KeyboardAction.increaseFontSize),
                },
                {
                    label: "Decrease Font Size",
                    accelerator: `${CmdOrCtrl}+-`,
                    click: () => send(KeyboardAction.decreaseFontSize),
                },
                {
                    label: "Reset Font Size",
                    accelerator: `${CmdOrCtrl}+0`,
                    click: () => send(KeyboardAction.resetFontSize),
                },
            ],
        },
        {
            label: "View",
            submenu: [
                {
                    label: "Toggle Full Screen",
                    accelerator: "Ctrl+Shift+F",
                    click: () => {
                        browserWindow.setFullScreen(!browserWindow.isFullScreen());
                    },
                },
                {
                    label: "Toggle Developer Tools",
                    accelerator: `${CmdOrCtrl}+Alt+I`,
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
                    accelerator: `${CmdOrCtrl}+N`,
                    click: () => send(KeyboardAction.sessionNew),
                },
                { type: "separator" },
                {
                    label: "Split Horizontally",
                    accelerator: `${CmdOrCtrl}+Shift+-`,
                    click: () => send(KeyboardAction.sessionSplitHorizontal),
                },
                {
                    label: "Split Vertically",
                    accelerator: `${CmdOrCtrl}+\\`,
                    click: () => send(KeyboardAction.sessionSplitVertical),
                },
                { type: "separator" },
                {
                    label: "Next Session",
                    accelerator: `${CmdOrCtrl}+Alt+Right`,
                    click: () => send(KeyboardAction.sessionFocusNext),
                },
                {
                    label: "Previous Session",
                    accelerator: `${CmdOrCtrl}+Alt+Left`,
                    click: () => send(KeyboardAction.sessionFocusPrevious),
                },
                { type: "separator" },
                {
                    label: "Other Session",
                    accelerator: `${CmdOrCtrl}+D`,
                    click: () => send(KeyboardAction.otherSession),
                },
                { type: "separator" },
                {
                    label: "Close Current Session",
                    accelerator: `${CmdOrCtrl}+Shift+W`,
                    click: () => send(KeyboardAction.sessionClose),
                },
                {
                    label: "Close All Sessions in Tab",
                    accelerator: `${CmdOrCtrl}+Alt+Shift+W`,
                    click: () => send(KeyboardAction.sessionCloseAll),
                },
            ],
        },
        {
            label: "Tab",
            submenu: [
                {
                    label: "New Tab",
                    accelerator: `${CmdOrCtrl}+T`,
                    click: () => send(KeyboardAction.tabNew),
                },
                { type: "separator" },
                {
                    label: "Previous Tab",
                    accelerator: `${CmdOrCtrl}+[`,
                    click: () => send(KeyboardAction.tabPrevious),
                },
                {
                    label: "Next Tab",
                    accelerator: `${CmdOrCtrl}+]`,
                    click: () => send(KeyboardAction.tabNext),
                },
                { type: "separator" },
                {
                    label: "Move Tab Left",
                    accelerator: `${CmdOrCtrl}+Shift+[`,
                    click: () => send(KeyboardAction.tabMoveLeft),
                },
                {
                    label: "Move Tab Right",
                    accelerator: `${CmdOrCtrl}+Shift+]`,
                    click: () => send(KeyboardAction.tabMoveRight),
                },
                { type: "separator" },
                {
                    label: "Close Current Tab",
                    accelerator: `${CmdOrCtrl}+W`,
                    click: () => send(KeyboardAction.tabClose),
                },
                {
                    label: "Close Other Tabs",
                    accelerator: `${CmdOrCtrl}+Alt+W`,
                    click: () => send(KeyboardAction.tabCloseOthers),
                },
            ],
        },
        {
            role: "window",
            submenu: [
                { role: "minimize" },
                { role: "close" },
                { type: "separator" },
                { role: "reload", label: "Reload" },
                { role: "forceReload", label: "Reload (Force)" },
                { type: "separator" },
                { role: "toggleDevTools", label: "Toggle Developer Tools" },
            ],
        },
        {
            label: "Help",
            submenu: [
                {
                    label: "GitHub Repository",
                    click: () => shell.openExternal("https://github.com/topdown/em"),
                },
                {
                    label: "Keyboard Shortcuts",
                    accelerator: `${CmdOrCtrl}+?`,
                    click: () => browserWindow.webContents.send("menu-action", "showShortcuts"),
                },
                {
                    label: "Leave Feedback",
                    click: () => shell.openExternal("https://github.com/topdown/em/issues"),
                },
            ],
        },
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
} 
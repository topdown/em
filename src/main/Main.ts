import { app, ipcMain, nativeImage, BrowserWindow, screen } from "electron";
import { readFileSync } from "fs";
import { windowBoundsFilePath } from "../utils/Common";
import { attachMenu } from "./MenuBuilder";

app.on("ready", () => {
    const bounds = windowBounds();

    let options: Electron.BrowserWindowConstructorOptions = {
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: process.env.NODE_ENV === "development" ? false : true,
            allowRunningInsecureContent: false,
            backgroundThrottling: false,
        },
        titleBarStyle: "hidden",
        resizable: true,
        minWidth: 500,
        minHeight: 300,
        width: bounds.width,
        height: bounds.height,
        x: bounds.x,
        y: bounds.y,
        show: false,
    };
    const browserWindow = new BrowserWindow(options);

    // Attach custom application menu.
    attachMenu(app, browserWindow);

    const { Menu } = require("electron");
    ipcMain.handle("prompt-context-menu", (event) => {
        const template = [
            { role: "undo" },
            { role: "redo" },
            { type: "separator" },
            { role: "cut" },
            { role: "copy" },
            { role: "paste" },
            { type: "separator" },
            { role: "selectAll" },
        ];
        const menu = Menu.buildFromTemplate(template);
        menu.popup({ window: BrowserWindow.fromWebContents(event.sender) as any });
    });

    if (app.dock) {
        app.dock.setIcon(nativeImage.createFromPath("build/icon.png"));
    } else {
        browserWindow.setIcon(nativeImage.createFromPath("build/icon.png"));
    }

    browserWindow.loadURL("file://" + __dirname + "/../views/index.html");

    browserWindow.webContents.on("did-finish-load", () => {
        browserWindow.show();
        browserWindow.focus();
    });

    app.on("open-file", (_event, file) => browserWindow.webContents.send("change-working-directory", file));
});

app.on("window-all-closed", () => app.quit());

ipcMain.on("quit", app.quit);

function windowBounds(): Electron.Rectangle {
    try {
        return JSON.parse(readFileSync(windowBoundsFilePath).toString());
    } catch (error) {
        const workAreaSize = screen.getPrimaryDisplay().workAreaSize;

        return {
            width: workAreaSize.width,
            height: workAreaSize.height,
            x: 0,
            y: 0,
        };
    }
}

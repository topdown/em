import { handleUserEvent } from "./keyevents/Keybindings";
import { handleMouseEvent } from "./mouseevents/MouseEvents";

process.env.PATH = "/usr/local/bin:" + process.env.PATH;
process.env.NODE_ENV = process.env.NODE_ENV || "production";
process.env.LANG = process.env.LANG || "en_US.UTF-8";
process.env.COLORTERM = "truecolor";
process.env.TERM = "xterm-256color";

import { loadAliasesFromConfig } from "../shell/Aliases";
import * as React from "react";
import { createRoot } from "react-dom/client";
import { ApplicationComponent } from "./ApplicationComponent";
import { loadAllPlugins } from "../PluginManager";
import { loadEnvironment } from "../shell/Environment";
import { UserEvent, MouseEvent } from "../Interfaces";
import { ipcRenderer } from "electron";
import { buildMenuTemplate } from "./menu/Menu";

document.addEventListener(
  "dragover",
  function (event) {
    event.preventDefault();
    return false;
  },
  false
);

// Global reference to the application component
let applicationInstance: ApplicationComponent | null = null;

const AppWrapper: React.FC = () => {
  const applicationRef = React.useRef<ApplicationComponent>(null);

  React.useEffect(() => {
    if (applicationRef.current) {
      applicationInstance = applicationRef.current;

      // Menu setup will be handled by the main process
      // Note: Removed IPC call to avoid cloning errors with React components

      const userEventHandler = (event: UserEvent) => {
        if (applicationInstance && applicationInstance.focusedTabComponent) {
          handleUserEvent(applicationInstance, window.search, event);
        }
      };

      const mouseEventHandler = (event: MouseEvent) => {
        if (applicationInstance) {
          handleMouseEvent(applicationInstance, event);
        }
      };

      document.body.addEventListener("keydown", userEventHandler, true);
      document.body.addEventListener("paste", userEventHandler, true);
      document.body.addEventListener("drop", mouseEventHandler, true);

      require("../plugins/JobFinishedNotifications");
      require("../plugins/UpdateLastPresentWorkingDirectory");
      require("../plugins/SaveHistory");
      require("../plugins/SaveWindowBounds");
      require("../plugins/AliasSuggestions");

      return () => {
        document.body.removeEventListener("keydown", userEventHandler, true);
        document.body.removeEventListener("paste", userEventHandler, true);
        document.body.removeEventListener("drop", mouseEventHandler, true);
      };
    }
  }, []);

  return <ApplicationComponent ref={applicationRef} />;
};

async function main() {
  // Should be required before mounting Application.
  require("../monaco/PromptTheme");
  require("../monaco/ShellLanguage");
  require("../monaco/ShellHistoryLanguage");

  // FIXME: Remove loadAllPlugins after switching to Webpack (because all the files will be loaded at start anyway).
  await Promise.all([
    loadAllPlugins(),
    loadEnvironment(),
    loadAliasesFromConfig(),
  ]);

  const root = createRoot(document.getElementById("react-entry-point")!);
  root.render(<AppWrapper />);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main, false);
} else {
  main();
}

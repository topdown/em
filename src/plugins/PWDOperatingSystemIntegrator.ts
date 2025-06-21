import { Session } from "../shell/Session";
import { PluginManager } from "../PluginManager";
import { ipcRenderer } from "electron";

PluginManager.registerEnvironmentObserver({
    presentWorkingDirectoryWillChange: () => { /* do nothing */ },

    presentWorkingDirectoryDidChange: (_session: Session, directory: string) => {
        // Send to main process to add recent document
        ipcRenderer.send('add-recent-document', directory);
    },
});

import { services } from "../services/index";
import { ipcRenderer } from "electron";
import { Status } from "../Enums";

services.jobs.onFinish.subscribe((job: any) => {
    // Check if window is focused via document API instead of remote
    if (!document.hasFocus()) {
        // Send notification requests to main process
        ipcRenderer.send('job-finished-notification', {
            status: job.status,
            command: job.prompt.value,
            success: job.status === Status.Success
        });

        const title = job.status === Status.Success ? "Completed" : "Failed";

        // Use web notification API
        if (Notification.permission === "granted") {
            new Notification(title, { body: job.prompt.value });
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    new Notification(title, { body: job.prompt.value });
                }
            });
        }
    }
});

// Clear badge when window gains focus
window.addEventListener("focus", () => {
    ipcRenderer.send('clear-badge');
});

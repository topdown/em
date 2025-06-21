import { ipcRenderer } from "electron";
import { Observable, Subject, fromEvent, NEVER, merge } from "rxjs";
import { map } from "rxjs/operators";

export class WindowService {
    readonly onResize: Observable<{}>;
    readonly onClose = new Subject<void>();
    readonly onBoundsChange: Observable<Electron.Rectangle>;

    constructor() {
        // Check if we're in an electron environment
        if (typeof window !== 'undefined' && (window as any).require) {
            try {
                // Use IPC to communicate with main process for window operations
                this.onResize = fromEvent(window, "resize");

                this.onBoundsChange = fromEvent(window, "resize").pipe(
                    map(() => ({ x: 0, y: 0, width: window.innerWidth, height: window.innerHeight }))
                );

                window.onbeforeunload = () => {
                    this.onClose.next();
                    // Send message to main process about window closing
                    ipcRenderer.send('window-closing');
                };
            } catch (error) {
                // Fallback if electron APIs aren't available
                this.onResize = NEVER;
                this.onBoundsChange = NEVER;
            }
        } else {
            // Not in electron environment (e.g., tests)
            this.onResize = NEVER;
            this.onBoundsChange = NEVER;
        }
    }
}

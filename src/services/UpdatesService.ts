// Updates service functionality disabled - was using deprecated remote API
import * as https from "https";

export class UpdatesService {
    isAvailable = false;
    private currentVersion: string;
    private INTERVAL = 1000 * 60 * 60 * 12;

    constructor() {
        if (process.env.NODE_ENV === "test") {
            return;
        }

        // Get version from package.json instead of remote API
        this.currentVersion = "v" + require("../../../package.json").version;
        this.checkUpdate();
        setInterval(() => this.checkUpdate(), this.INTERVAL);
    }

    private checkUpdate() {
        if (this.isAvailable || !navigator.onLine) {
            return;
        }

        https.get(
            {
                host: "api.github.com",
                path: "/repos/railsware/upterm/releases/latest",
                headers: {
                    "User-Agent": "Upterm",
                },
            },
            (response) => {
                let body = "";
                response.on("data", data => body += data);
                response.on("end", () => {
                    const parsed = JSON.parse(body);
                    this.isAvailable = parsed.tag_name !== this.currentVersion;
                });
            },
        );
    }
}

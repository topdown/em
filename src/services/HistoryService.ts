import { readFileSync } from "fs";
import { historyFilePath } from "../utils/Common";
import * as _ from "lodash";

import { parse as csvParse } from "csv-parse/sync";
import { SessionID } from "../shell/Session";
import { Subject } from "rxjs";

interface HistoryRecordWithoutID {
    command: string;
    expandedCommand: string;
    timestamp: number;
    directory: string;
    sessionID: SessionID;
}

export interface HistoryRecord extends HistoryRecordWithoutID {
    id: number;
}

const readHistoryFileData = (): HistoryRecord[] => {
    try {
        return csvParse(readFileSync(historyFilePath).toString()).map((array: string[]) => ({
            id: Number.parseInt(array[0], 10),
            command: array[1],
            expandedCommand: array[2],
            timestamp: Number.parseInt(array[3], 10),
            directory: array[4],
            sessionID: Number.parseInt(array[5], 10),
        }));
    } catch (e) {
        return [];
    }
};

export class HistoryService {
    readonly onNewRecord = new Subject<HistoryRecord>();
    private maxRecordsCount: number = 5000;
    private storage: HistoryRecord[] = [];

    constructor() {
        this.storage = readHistoryFileData();
    }

    get all(): HistoryRecord[] {
        return this.storage;
    }

    get latest(): HistoryRecord | undefined {
        return _.last(this.storage);
    }

    add(recordWithoutID: HistoryRecordWithoutID) {
        const record = { id: this.nextID, ...recordWithoutID };
        this.storage.push(record);

        if (this.storage.length > this.maxRecordsCount) {
            this.storage.shift();
        }

        this.onNewRecord.next(record);
        return record;
    }

    get(id: number): HistoryRecord {
        return this.all.find(record => record.id === id)!;
    }

    private get nextID(): number {
        if (this.latest) {
            return this.latest.id + 1;
        } else {
            return 1;
        }
    }
}

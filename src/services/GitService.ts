import { Observable, BehaviorSubject, timer, merge } from "rxjs";
import { concatMap, filter, distinctUntilChanged, multicast, refCount } from "rxjs/operators";

import { currentBranchName, GitDirectoryPath, repositoryState, RepositoryState } from "../utils/Git";
import { services } from "./index";

const INTERVAL = 5000;

async function getState(directory: string): Promise<GitState> {
    const state = await repositoryState(directory);

    if (state === RepositoryState.NotRepository) {
        return { kind: "not-repository" };
    } else {
        return {
            kind: "repository",
            branch: await currentBranchName(<GitDirectoryPath>directory),
            status: state,
        };
    }
}

function createObservable(directory: string) {
    return merge(
        timer(0, INTERVAL),
        services.jobs.onFinish.pipe(
            filter((job: any) => job.session.directory === directory)
        )
    ).pipe(
        concatMap(() => getState(directory)),
        // Don't emit if a value didn't change.
        distinctUntilChanged((x: any, y: any) => JSON.stringify(x) === JSON.stringify(y)),
        // Remember the last value to emit immediately to new subscriptions.
        multicast(new BehaviorSubject<GitState>({ kind: "not-repository" })),
        // Automatically stop checking git status when there are no subscriptions anymore.
        refCount()
    );
}

export class GitService {
    private observables: Map<string, Observable<GitState>> = new Map();

    observableFor(directory: string): Observable<GitState> {
        if (!this.observables.has(directory)) {
            this.observables.set(directory, createObservable(directory));
        }

        return this.observables.get(directory)!;
    }
}

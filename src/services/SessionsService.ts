import { Session, SessionID } from "../shell/Session";
import { Observable, Subject, fromEvent } from "rxjs";
import { services } from "./index";


export class SessionsService {
    readonly onClose = new Subject<SessionID>();
    private readonly sessions: Map<SessionID, Session> = new Map;

    create() {
        const session = new Session();
        this.sessions.set(session.id, session);

        fromEvent(session, "job-started").subscribe(
            () => services.jobs.onStart.next(session.lastJob!),
        );

        fromEvent(session, "job-finished").subscribe(
            () => services.jobs.onFinish.next(session.lastJob!),
        );

        return session.id;
    }

    get(id: SessionID) {
        return this.sessions.get(id)!;
    }

    close(ids: SessionID | SessionID[]) {
        if (Array.isArray(ids)) {
            ids.forEach(id => this.close(id));
            return;
        }

        const id = ids;
        const session = this.get(id);

        session.jobs.forEach(job => {
            job.removeAllListeners();
            job.interrupt();
        });

        session.removeAllListeners();

        this.sessions.delete(id);
        this.onClose.next(id);
    }

    closeAll() {
        this.sessions.forEach((_session, id) => this.close(id));
    }
}

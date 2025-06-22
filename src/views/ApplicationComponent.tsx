import { type as osType } from "os";
import * as classNames from "classnames";
import { TabHeaderComponent, Props } from "./TabHeaderComponent";
import * as React from "react";
import { ipcRenderer } from "electron";
import * as css from "./css/styles";
import { SearchComponent } from "./SearchComponent";
import { TabComponent } from "./TabComponent";
import { SessionID } from "../shell/Session";
import { services } from "../services";
import { SplitType } from "../Enums";
import * as _ from "lodash";
import { KeyboardAction } from "../Enums";
import { KeybindingsForMenu } from "./keyevents/Keybindings";
import { ShortcutsOverlayComponent } from "./ShortcutsOverlayComponent";

type ApplicationState = {
  tabs: Array<{
    id: number;
    sessionIDs: SessionID[];
    focusedSessionID: SessionID;
    splitType: SplitType;
  }>;
  focusedTabIndex: number;
  showShortcuts: boolean;
};

export class ApplicationComponent extends React.Component<
  {},
  ApplicationState
> {
  tabComponents: TabComponent[];

  constructor(props: {}) {
    super(props);

    const sessionID = services.sessions.create();
    this.state = {
      tabs: [
        {
          id: Date.now(),
          sessionIDs: [sessionID],
          focusedSessionID: sessionID,
          splitType: SplitType.None,
        },
      ],
      focusedTabIndex: 0,
      showShortcuts: false,
    };

    services.window.onResize.subscribe(() => this.resizeAllSessions());
    services.window.onClose.subscribe(() => services.sessions.closeAll());
    services.sessions.onClose.subscribe((id: SessionID) =>
      this.removeSessionFromState(id)
    );
    services.font.onChange.subscribe(() => {
      this.forceUpdate();
      this.resizeAllSessions();
    });

    ipcRenderer.on(
      "change-working-directory",
      (_event: any, directory: string) =>
        (this.focusedSession.directory = directory)
    );
  }

  componentDidMount() {
    ipcRenderer.on("menu-action", (_event, action: any) => {
      switch (action) {
        /* Tab commands */
        case KeyboardAction.tabNew:
          this.addTab();
          break;
        case KeyboardAction.tabPrevious:
          this.focusPreviousTab();
          break;
        case KeyboardAction.tabNext:
          this.focusNextTab();
          break;
        case KeyboardAction.tabClose:
          this.closeFocusedTab();
          break;
        case KeyboardAction.tabCloseOthers:
          this.closeOtherTabs();
          break;
        case KeyboardAction.tabMoveLeft:
          this.moveTabLeft();
          break;
        case KeyboardAction.tabMoveRight:
          this.moveTabRight();
          break;

        /* Session commands */
        case KeyboardAction.sessionNew:
          this.createNewSession();
          break;
        case KeyboardAction.sessionClose:
          this.closeFocusedSession();
          break;
        case KeyboardAction.sessionCloseAll:
          this.closeAllSessionsInTab();
          break;
        case KeyboardAction.sessionSplitHorizontal:
          this.splitSessionHorizontally();
          break;
        case KeyboardAction.sessionSplitVertical:
          this.splitSessionVertically();
          break;
        case KeyboardAction.sessionFocusNext:
          this.focusNextSession();
          break;
        case KeyboardAction.sessionFocusPrevious:
          this.focusPreviousSession();
          break;
        case KeyboardAction.otherSession:
          this.otherSession();
          break;

        /* Font size */
        case KeyboardAction.increaseFontSize:
          services.font.increaseSize();
          break;
        case KeyboardAction.decreaseFontSize:
          services.font.decreaseSize();
          break;
        case KeyboardAction.resetFontSize:
          services.font.resetSize();
          break;

        /* Show shortcuts */
        case "showShortcuts":
          this.showShortcutsOverlay();
          break;

        /* Find */
        case KeyboardAction.editFind:
          const input = document.querySelector(
            "input[type=search]"
          ) as HTMLInputElement | null;
          if (input) {
            input.select();
          }
          break;

        /* Edit Find Close handled in SearchComponent etc; no-op here */
        default:
          break;
      }
    });
  }

  render() {
    let tabs: React.ReactElement<Props>[] | undefined;

    if (this.state.tabs.length > 1) {
      tabs = this.state.tabs.map((tab, index: number) => (
        <TabHeaderComponent
          isFocused={index === this.state.focusedTabIndex}
          key={tab.id}
          position={index + 1}
          sessionCount={tab.sessionIDs.length}
          splitType={tab.splitType}
          activate={() => this.setState({ focusedTabIndex: index })}
          closeHandler={(event: React.MouseEvent<HTMLSpanElement>) => {
            services.sessions.close(this.state.tabs[index].sessionIDs);
            event.stopPropagation();
            event.preventDefault();
          }}
        />
      ));
    }

    this.tabComponents = [];

    return (
      <div
        className="application"
        style={css.application() as React.CSSProperties}
      >
        <div className={classNames("title-bar", { reversed: this.isMacOS() })}>
          <SearchComponent />
          <ul className="tabs">{tabs}</ul>
        </div>
        {this.state.showShortcuts && (
          <ShortcutsOverlayComponent
            onClose={() => this.setState({ showShortcuts: false })}
          />
        )}
        {this.state.tabs.map((tabProps, index) => (
          <TabComponent
            sessionIDs={tabProps.sessionIDs}
            focusedSessionID={tabProps.focusedSessionID}
            splitType={tabProps.splitType}
            isFocused={index === this.state.focusedTabIndex}
            key={tabProps.id}
            onSessionFocus={(id: SessionID) => {
              const state = this.cloneState();
              state.tabs[state.focusedTabIndex].focusedSessionID = id;
              this.setState(state);
            }}
            ref={(tabComponent) => {
              this.tabComponents[index] = tabComponent!;
            }}
          />
        ))}
      </div>
    );
  }

  /**
   * is Mac OS
   */

  isMacOS() {
    return "Darwin" === osType();
  }

  /**
   * Tab methods.
   */

  get focusedTabComponent() {
    return this.tabComponents[this.state.focusedTabIndex];
  }

  addTab(): void {
    if (this.state.tabs.length < 9) {
      const id = services.sessions.create();

      const state = this.cloneState();
      state.tabs.push({
        id: Date.now(),
        sessionIDs: [id],
        focusedSessionID: id,
        splitType: SplitType.None,
      });
      state.focusedTabIndex = state.tabs.length - 1;

      this.setState(state);
    } else {
      // Beep functionality removed - was using deprecated remote API
    }
  }

  focusPreviousTab() {
    if (this.state.focusedTabIndex !== 0) {
      this.focusTab(this.state.focusedTabIndex - 1);
    }
  }

  focusNextTab() {
    if (this.state.focusedTabIndex !== this.state.tabs.length - 1) {
      this.focusTab(this.state.focusedTabIndex + 1);
    }
  }

  focusTab(index: number): void {
    if (index === 8) {
      index = this.state.tabs.length - 1;
    }

    if (this.state.tabs.length > index) {
      this.setState({ focusedTabIndex: index });
    } else {
      // Beep functionality removed - was using deprecated remote API
    }
  }

  closeFocusedTab() {
    const sessionIDs = this.state.tabs[this.state.focusedTabIndex].sessionIDs;
    services.sessions.close(sessionIDs);
  }

  moveTabLeft(): void {
    const currentIndex = this.state.focusedTabIndex;
    if (currentIndex > 0) {
      const state = this.cloneState();
      const tab = state.tabs[currentIndex];
      state.tabs.splice(currentIndex, 1);
      state.tabs.splice(currentIndex - 1, 0, tab);
      state.focusedTabIndex = currentIndex - 1;
      this.setState(state);
    }
  }

  moveTabRight(): void {
    const currentIndex = this.state.focusedTabIndex;
    if (currentIndex < this.state.tabs.length - 1) {
      const state = this.cloneState();
      const tab = state.tabs[currentIndex];
      state.tabs.splice(currentIndex, 1);
      state.tabs.splice(currentIndex + 1, 0, tab);
      state.focusedTabIndex = currentIndex + 1;
      this.setState(state);
    }
  }

  closeOtherTabs(): void {
    const focusedTab = this.state.tabs[this.state.focusedTabIndex];
    const otherTabSessionIDs = this.state.tabs
      .filter((_, index) => index !== this.state.focusedTabIndex)
      .map((tab) => tab.sessionIDs)
      .flat();

    if (otherTabSessionIDs.length > 0) {
      services.sessions.close(otherTabSessionIDs);
    }
  }

  /**
   * Session methods.
   */

  get focusedSession() {
    return services.sessions.get(
      this.state.tabs[this.state.focusedTabIndex].focusedSessionID
    );
  }

  createNewSession(): void {
    const state = this.cloneState();
    const id = services.sessions.create();
    const tabState = state.tabs[state.focusedTabIndex];

    tabState.sessionIDs.push(id);
    tabState.focusedSessionID = id;

    if (tabState.sessionIDs.length === 2) {
      tabState.splitType = SplitType.Vertical; // Default to vertical split
    }

    this.setState(state, () => this.resizeTabSessions(state.focusedTabIndex));
  }

  closeFocusedSession() {
    services.sessions.close(this.focusedSession.id);
  }

  closeAllSessionsInTab(): void {
    const sessionIDs = this.state.tabs[this.state.focusedTabIndex].sessionIDs;
    services.sessions.close(sessionIDs);
  }

  splitSessionHorizontally(): void {
    const state = this.cloneState();
    const tabState = state.tabs[state.focusedTabIndex];

    if (tabState.sessionIDs.length < 4) {
      // Allow up to 4 sessions
      const id = services.sessions.create();
      tabState.sessionIDs.push(id);
      tabState.focusedSessionID = id;
      tabState.splitType = SplitType.Horizontal;

      this.setState(state, () => this.resizeTabSessions(state.focusedTabIndex));
    }
  }

  splitSessionVertically(): void {
    const state = this.cloneState();
    const tabState = state.tabs[state.focusedTabIndex];

    if (tabState.sessionIDs.length < 4) {
      // Allow up to 4 sessions
      const id = services.sessions.create();
      tabState.sessionIDs.push(id);
      tabState.focusedSessionID = id;
      tabState.splitType = SplitType.Vertical;

      this.setState(state, () => this.resizeTabSessions(state.focusedTabIndex));
    }
  }

  focusNextSession(): void {
    const state = this.cloneState();
    const tabState = state.tabs[state.focusedTabIndex];

    if (tabState.sessionIDs.length > 1) {
      const currentIndex = tabState.sessionIDs.findIndex(
        (id) => id === tabState.focusedSessionID
      );
      const nextIndex = (currentIndex + 1) % tabState.sessionIDs.length;
      tabState.focusedSessionID = tabState.sessionIDs[nextIndex];

      this.setState(state);
    }
  }

  focusPreviousSession(): void {
    const state = this.cloneState();
    const tabState = state.tabs[state.focusedTabIndex];

    if (tabState.sessionIDs.length > 1) {
      const currentIndex = tabState.sessionIDs.findIndex(
        (id) => id === tabState.focusedSessionID
      );
      const previousIndex =
        currentIndex === 0 ? tabState.sessionIDs.length - 1 : currentIndex - 1;
      tabState.focusedSessionID = tabState.sessionIDs[previousIndex];

      this.setState(state);
    }
  }

  otherSession(): void {
    const state = this.cloneState();
    const tabState = state.tabs[state.focusedTabIndex];

    if (tabState.sessionIDs.length < 2) {
      const id = services.sessions.create();
      tabState.sessionIDs.push(id);
      tabState.focusedSessionID = id;
      tabState.splitType = SplitType.Vertical; // Default to vertical split

      this.setState(state, () => this.resizeTabSessions(state.focusedTabIndex));
    } else {
      tabState.focusedSessionID = tabState.sessionIDs.find(
        (id) => id !== tabState.focusedSessionID
      )!;
      this.setState(state);
    }
  }

  private resizeTabSessions(tabIndex: number): void {
    const tabComponent = this.tabComponents[tabIndex];
    if (tabComponent && tabComponent.sessionComponents) {
      tabComponent.sessionComponents.forEach((sessionComponent) =>
        sessionComponent.resizeSession()
      );
    }
  }

  private resizeAllSessions() {
    this.tabComponents.forEach((tabComponent) => {
      if (tabComponent && tabComponent.sessionComponents) {
        tabComponent.sessionComponents.forEach((sessionComponent) =>
          sessionComponent.resizeSession()
        );
      }
    });
  }

  private removeSessionFromState(id: SessionID) {
    const state = this.cloneState();
    const tabIndex = state.tabs.findIndex((tabState) =>
      tabState.sessionIDs.includes(id)
    );
    const tabState = state.tabs[tabIndex];

    if (tabState.sessionIDs.length === 1) {
      this.removeTabFromState(tabIndex);
    } else {
      const sessionIndex = tabState.sessionIDs.findIndex(
        (sessionId) => sessionId === id
      );
      tabState.sessionIDs.splice(sessionIndex, 1);

      // Update focused session if the removed session was focused
      if (tabState.focusedSessionID === id) {
        tabState.focusedSessionID = tabState.sessionIDs[0];
      }

      // Reset split type if only one session remains
      if (tabState.sessionIDs.length === 1) {
        tabState.splitType = SplitType.None;
      }

      this.setState(state, () => this.resizeTabSessions(tabIndex));
    }
  }

  private removeTabFromState(index: number): void {
    const state = this.cloneState();

    state.tabs.splice(index, 1);
    state.focusedTabIndex = Math.max(0, index - 1);

    if (state.tabs.length === 0) {
      ipcRenderer.send("quit");
    } else {
      this.setState(state);
    }
  }

  /**
   * Return a deep clone of the state in order not to
   * accidentally mutate it.
   */
  private cloneState(): ApplicationState {
    return _.cloneDeep(this.state);
  }

  private showShortcutsOverlay() {
    this.setState({ showShortcuts: true });
  }
}

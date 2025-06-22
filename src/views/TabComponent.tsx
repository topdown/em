import { SessionComponent } from "./SessionComponent";
import * as React from "react";
import { SessionID } from "../shell/Session";
import { SplitType } from "../Enums";

type Props = {
  sessionIDs: SessionID[];
  focusedSessionID: SessionID;
  splitType: SplitType;
  isFocused: boolean;
  onSessionFocus: (id: SessionID) => void;
};

export class TabComponent extends React.Component<Props, {}> {
  sessionComponents: SessionComponent[];
  focusedSessionComponent: SessionComponent | undefined;

  render() {
    this.sessionComponents = [];
    const sessionComponents = this.props.sessionIDs.map((id, index) => {
      const isFocused =
        this.props.isFocused && id === this.props.focusedSessionID;

      return (
        <SessionComponent
          sessionID={id}
          key={id}
          ref={(sessionComponent) => {
            // Unmount.
            if (!sessionComponent) {
              return;
            }

            if (isFocused) {
              this.focusedSessionComponent = sessionComponent!;
            }
            this.sessionComponents[index] = sessionComponent!;
          }}
          isFocused={isFocused}
          focus={() => {
            this.props.onSessionFocus(id);
            this.forceUpdate();
          }}
        ></SessionComponent>
      );
    });

    const sessionCount = this.props.sessionIDs.length;
    const splitType = this.props.splitType;

    // Determine layout classes based on split type and session count
    let layoutClass = "";
    if (sessionCount === 1) {
      layoutClass = "single-session";
    } else if (sessionCount === 2) {
      layoutClass =
        splitType === SplitType.Horizontal
          ? "split-horizontal"
          : "split-vertical";
    } else if (sessionCount === 3) {
      layoutClass = "split-grid-three";
    } else if (sessionCount >= 4) {
      layoutClass = "split-grid-four";
    }

    return (
      <div className="tab" data-focused={this.props.isFocused}>
        <div
          className={`sessions ${layoutClass}`}
          data-split-type={splitType}
          data-session-count={sessionCount}
        >
          {sessionComponents}
        </div>
      </div>
    );
  }
}

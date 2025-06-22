/* tslint:disable:no-unused-variable */
import * as React from "react";
import { fontAwesome } from "./css/FontAwesome";
import { SplitType } from "../Enums";

export interface Props {
  isFocused: boolean;
  activate: () => void;
  position: number;
  sessionCount: number;
  splitType: SplitType;
  closeHandler: React.EventHandler<React.MouseEvent<HTMLSpanElement>>;
}

export class TabHeaderComponent extends React.Component<Props, {}> {
  render() {
    const { sessionCount, splitType } = this.props;

    // Create a visual indicator for split type
    let splitIndicator = "";
    if (sessionCount > 1) {
      switch (splitType) {
        case SplitType.Horizontal:
          splitIndicator = "═";
          break;
        case SplitType.Vertical:
          splitIndicator = "║";
          break;
        default:
          splitIndicator = "⚏";
      }
    }

    return (
      <li
        className="tab-header"
        data-focused={this.props.isFocused}
        data-session-count={sessionCount}
        data-split-type={splitType}
        onClick={this.props.activate}
      >
        <span className="close-button" onClick={this.props.closeHandler}>
          {fontAwesome.times}
        </span>

        <span className="tab-label">
          <span className="tab-position">⌘{this.props.position}</span>
          {sessionCount > 1 && (
            <span className="session-info">
              <span className="split-indicator">{splitIndicator}</span>
              <span className="session-count">{sessionCount}</span>
            </span>
          )}
        </span>
      </li>
    );
  }
}

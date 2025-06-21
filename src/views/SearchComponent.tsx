import * as React from "react";
import { ipcRenderer } from "electron";
import { fontAwesome } from "./css/FontAwesome";

export class SearchComponent extends React.Component<{}, {}> {
  private inputRef = React.createRef<HTMLInputElement>();
  private webContents: Electron.WebContents;

  constructor(props: any) {
    super(props);
    // FIXME: find a better design.
    window.search = this;
  }

  render() {
    return (
      <div className="search">
        <span className="search-icon">{fontAwesome.search}</span>
        <input
          ref={this.inputRef}
          className="search-input"
          onInput={(event: any) => this.handleInput(event)}
          type="search"
        />
      </div>
    );
  }

  get isFocused(): boolean {
    return document.activeElement === this.input;
  }

  clearSelection(): void {
    if (this.webContents) {
      this.webContents.stopFindInPage("clearSelection");
    }
    if (this.input) {
      this.input.value = "";
    }
  }

  blur() {
    this.input?.blur();
  }

  private handleInput(event: React.KeyboardEvent<HTMLInputElement>) {
    const text = (event.target as HTMLInputElement).value;

    if (text) {
      if (this.webContents) {
        this.webContents.findInPage(text);
        this.webContents.on("found-in-page", () => this.input?.focus());
      }
    } else {
      this.clearSelection();
      setTimeout(() => this.input?.select(), 0);
    }
  }

  private get input(): HTMLInputElement | null {
    return this.inputRef.current;
  }
}

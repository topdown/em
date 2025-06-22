import * as React from "react";
import { KeybindingsForMenu } from "./keyevents/Keybindings";
import { KeyboardAction } from "../Enums";

type Props = {
  onClose: () => void;
};

export const ShortcutsOverlayComponent: React.FC<Props> = ({ onClose }) => {
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.6)",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#1e1e1e",
          padding: 20,
          borderRadius: 8,
          maxHeight: "80vh",
          maxWidth: "80vw",
          overflow: "auto",
          boxShadow: "0 0 20px rgba(0,0,0,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginTop: 0, textAlign: "center" }}>
          Keyboard Shortcuts
        </h2>
        <table
          style={{
            borderCollapse: "collapse",
            width: "100%",
          }}
        >
          <tbody>
            {KeybindingsForMenu.map((item) => (
              <tr key={item.action}>
                <td
                  style={{
                    padding: "4px 8px",
                    borderBottom: "1px solid #333",
                    textAlign: "right",
                    whiteSpace: "nowrap",
                  }}
                >
                  {KeyboardAction[item.action]}
                </td>
                <td
                  style={{
                    padding: "4px 8px",
                    borderBottom: "1px solid #333",
                    width: "100%",
                  }}
                ></td>
                <td
                  style={{
                    padding: "4px 8px",
                    borderBottom: "1px solid #333",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.accelerator}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ textAlign: "center", marginTop: 12 }}>
          Press <b>Esc</b> or click outside to close.
        </p>
      </div>
    </div>
  );
};

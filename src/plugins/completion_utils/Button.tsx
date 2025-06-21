import * as React from "react";
import { colors } from "../../views/css/colors";

const buttonStyles = (color: string) => ({
  borderColor: color,
  borderStyle: "solid",
  borderRadius: "4px",
  borderWidth: "1px",
  padding: "2px",
  color: color,
  WebkitUserSelect: "none",
  fontSize: "10px",
  margin: "4px",
  cursor: "pointer",
});

type ButtonProps = {
  onClick: () => void;
  children: string;
  color?: string;
};

export const Button = ({
  onClick,
  children,
  color = colors.blue,
}: ButtonProps) => (
  <span style={buttonStyles(color) as React.CSSProperties} onClick={onClick}>
    {children}
  </span>
);

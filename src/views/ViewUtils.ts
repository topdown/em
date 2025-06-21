import { KeyCode } from "../Enums";

export function isModifierKey(event: KeyboardEvent) {
    return [KeyCode.Shift, KeyCode.Ctrl, KeyCode.Meta, KeyCode.Alt, KeyCode.CapsLock, KeyCode.AltGraph].includes(event.keyCode);
}

export function setCaretPosition(node: Node, position: number) {
    const selection = window.getSelection();
    if (!selection) return;

    const range = document.createRange();

    if (node.childNodes.length) {
        range.setStart(node.childNodes[0], position);
    } else {
        range.setStart(node, 0);
    }
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
}

/**
 * @link http://stackoverflow.com/questions/4811822/get-a-ranges-start-and-end-offsets-relative-to-its-parent-container/4812022#4812022
 */
export function getCaretPosition(element: Node): number {
    if (!element.ownerDocument?.defaultView) return 0;

    const selection = element.ownerDocument.defaultView.getSelection();
    if (!selection) return 0;

    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(element);

        return preCaretRange.toString().length;
    } else {
        return 0;
    }
}

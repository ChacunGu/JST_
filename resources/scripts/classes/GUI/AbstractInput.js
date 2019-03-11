/**
 * AbstractInput
 * Class which represents an abstract input.
 */
class AbstractInput {
    constructor() {
        this.editableNode = null;
        this.cursorPosition = 0;

        // avoid instantiation (abstract class)
        if (new.target === AbstractInput)
            throw new Error("Cannot construct AbstractInput instances directly.");
    }

    /**
     * _clear
     * Clears the input's content.
     */
    _clear() {
        this.editableNode.innerHTML = "";
    }
    
    /**
     * focus
     * Puts focus on the input.
     * Source : https://www.sitepoint.com/community/t/set-caret-position-in-contenteditable-div/6574/4
     * @param {int} pos : new cursor position
     */
    focus(pos=null) {
        this.editableNode.focus();
        if (this.editableNode.innerHTML.length > 0) {
            var char = pos != null ? pos : this.editableNode.innerHTML.length, sel;
            if (document.selection) {
                sel = document.selection.createRange();
                sel.moveStart('character', char);
                sel.select();
            } else {
                sel = window.getSelection();
                try {
                    sel.collapse(this.editableNode.firstChild, char);
                } catch (e) {
                    console.log(e);
                }
            }
        }
    }

    /**
     * getContent
     * Returns input's content.
     */
    getContent() {
        return this.editableNode.innerHTML;
    }
    
    /**
     * write
     * Writes the given value at the end of the current user input.
     * @param {String} value : value to append
     */
    write(value) {
        if (value == " ") 
            value = "\u00A0";
        this.editableNode.append(document.createTextNode(value));
        this.cursorPosition = this.editableNode.innerHTML.length;
    }

    /**
     * setValue
     * Sets the terminal's input value
     * @param {String} value : value to set
     */
    setValue(value) {
        this.editableNode.innerHTML = value;
    }

    /**
     * setCursorPosition
     * Sets the input's cursor postion.
     * @param {int} pos : new cursor position in text
     */
    setCursorPosition(pos) {
        this.cursorPosition = pos;
    }

    /**
     * getCursorPosition
     * Returns input's cursor position.
     */
    getCursorPosition() {
        return this.cursorPosition;
    }

    /**
     * togglePasswordMode
     * Toggles password mode.
     */
    togglePasswordMode() {
        this.passwordMode = !this.passwordMode;
        if (this.passwordMode)
            this.editableNode.classList.add("passwordInput");
        else
            this.editableNode.classList.remove("passwordInput");
    }
}
/**
 * AbstractInput
 * Class which represents an abstract input.
 */
class AbstractInput {
    constructor() {
        this.editableNode = null;
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
     * From Tim Down's answer : https://stackoverflow.com/questions/4233265/contenteditable-set-caret-at-the-end-of-the-text-cross-browser
     */
    focus() {
        this.editableNode.focus();
        if (typeof window.getSelection != "undefined" && typeof document.createRange != "undefined") {
            let range = document.createRange();
            range.selectNodeContents(this.editableNode);
            range.collapse(false);
            let sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        } else if (typeof document.body.createTextRange != "undefined") {
            let textRange = document.body.createTextRange();
            textRange.moveToElementText(this.editableNode);
            textRange.collapse(false);
            textRange.select();
        }
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
    }

    /**
     * setValue
     * Sets the terminal's input value
     * @param {String} value : value to set
     */
    setValue(value) {
        this.editableNode.innerHTML = value;
    }
}
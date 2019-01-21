/**
 * Input
 * Class which represents a terminal's input. Provides methods to display, clear and submit
 * the user's inputs.
 */
class Input {
    constructor(terminal, user, hostname, path) {
        this.inputNode = this._create(terminal, user, hostname, path);
        this.editableNode = document.getElementById(Input.EDITABLE_NODE_ID);
    }

    /**
     * _create
     * Creates a terminal's input and initializes its events.
     * @param {DOM node} terminal : terminal's DOM node
     * @param {String} user : current kernel user
     * @param {String} hostname : current kernel hostname
     * @param {String} path : current kernel path
     */
    _create(terminal, header) {
        let insideSpan = document.createElement("span");
        insideSpan.id = Input.EDITABLE_NODE_ID;
        insideSpan.contentEditable = "true";
        
        // Event for Enter key pressed
        let _this = this;
        insideSpan.addEventListener("keydown", event => {
            if (event.keyCode === 13) {
                event.preventDefault();
                _this._submit();
                _this._clear();
                return false;
            }
        });
        
        this.headerNode = document.createElement("span");
        this.headerNode.id = Input.HEADER_ID;
        this.updateHeader(header);
        
        let inputNode = document.createElement("div");
        inputNode.id = Input.NODE_ID;
        inputNode.appendChild(this.headerNode);
        inputNode.appendChild(insideSpan);
        terminal.append(inputNode);
        return inputNode;
    }

    /**
     * _clear
     * Clears the input's content.
     */
    _clear() {
        this.editableNode.innerHTML = "";
    }

    /**
     * _submit
     * Fires a custom event to warn the kernel a command is submitted by the user.
     */
    _submit() {
        window.dispatchEvent(new CustomEvent("submit", {detail: this.editableNode.innerHTML}));
    }

    /**
     * updateHeader
     * Updates the input's header.
     * @param {String} header : new terminal's input header
     */
    updateHeader(header) {
        this.headerNode.innerHTML = "";
        this.headerNode.append(document.createTextNode(header));
        this.headerNode.append(document.createElement("br"));
        this.headerNode.append(document.createTextNode("$"));
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
}

Input.NODE_ID = "input";
Input.EDITABLE_NODE_ID = "inputEditable";
Input.HEADER_ID = "inputHeader";
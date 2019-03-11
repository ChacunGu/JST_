/**
 * TerminalInput
 * Class which represents a terminal's input. Provides methods to display, clear and submit
 * the user's inputs.
 */
class TerminalInput extends AbstractInput {
    constructor(terminal, user, hostname, path) {
        super();
        this.inputNode = this._create(terminal, user, hostname, path);
        this.editableNode = document.getElementById(TerminalInput.EDITABLE_NODE_ID);
        this.tappedTabKey = false;
        this.timeoutTabKey = null;
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
        insideSpan.id = TerminalInput.EDITABLE_NODE_ID;
        insideSpan.contentEditable = "true";
        insideSpan.spellcheck = false;
        
        this._initEvents(insideSpan);
        
        this.headerNode = document.createElement("span");
        this.headerNode.id = TerminalInput.HEADER_ID;
        this.updateHeader(header);
        
        let inputNode = document.createElement("div");
        inputNode.id = TerminalInput.NODE_ID;
        inputNode.appendChild(this.headerNode);
        inputNode.appendChild(insideSpan);
        terminal.append(inputNode);
        return inputNode;
    }

    /**
     * _initEvents
     * Initializes terminal's input events.
     * @param {DOM node} insideSpan : content editable node
     */
    _initEvents(insideSpan) {
        let _this = this;
        insideSpan.addEventListener("keydown", event => {
            if (event.keyCode === 13) { // Enter key pressed
                event.preventDefault();
                _this._submit();
                _this._clear();
                return false;
            } else if (event.keyCode === 38) { // Up arrow
                event.preventDefault();
                window.dispatchEvent(new Event("historyup"));
                return false;
            } else if (event.keyCode === 40) { // Down arrow
                event.preventDefault();
                window.dispatchEvent(new Event("historydown"));
                return false;
            } else if (event.keyCode === 27) { // Escape
                event.preventDefault();
                this._clear();
                return false;
            } else if (event.keyCode === 9) { // TAB
                event.preventDefault();

                if (this.tappedTabKey) { // double tap
                    clearTimeout(this.timeoutTabKey);
                    this._fireAutocompletionEvent(true);
                } else { // single tap
                    this.tappedTabKey = true;
                    this.timeoutTabKey = setTimeout(() => this._fireAutocompletionEvent(false), 250);
                }
                return false;
            }
        });
    }

    /**
     * _fireAutocompletionEvent
     * Fires autocompletion event and resets tappedTabKey flag.
     * @param {bool} doubleTap : true if tab key has been pressed two time false otherwise
     */
    _fireAutocompletionEvent(doubleTap) {
        let cursorPos = document.getSelection().getRangeAt(0).startOffset;
        window.dispatchEvent(new CustomEvent("autocomplete", {detail: [this.editableNode.innerHTML,
                                                                    cursorPos,
                                                                    doubleTap]}));
        this.tappedTabKey = false;
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
        this.headerNode.append(document.createTextNode(Terminal.SYMBOL));
    }
}

TerminalInput.NODE_ID = "terminalinput";
TerminalInput.EDITABLE_NODE_ID = "terminalinputEditable";
TerminalInput.HEADER_ID = "inputHeader";
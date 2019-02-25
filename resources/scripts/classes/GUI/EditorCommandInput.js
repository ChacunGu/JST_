/**
 * EditorCommandInput
 * Class which represents an editor's command input.
 */
class EditorCommandInput extends AbstractInput {
    constructor(container) {
        super();
        this.editableNode = this._create(container);
    }

    /**
     * _create
     * Creates an editor's command input and initializes its events.
     * @param {DOM node} container : container DOM node
     */
    _create(container) {
        let inputNode = document.createElement("span");
        inputNode.id = EditorCommandInput.EDITABLE_NODE_ID;
        inputNode.contentEditable = "true";
        inputNode.spellcheck = false;
        
        this._initEvents(inputNode);
        
        container.append(inputNode);
        return inputNode;
    }

    /**
     * _initEvents
     * Initializes editor's command input events.
     * @param {DOM node} insideSpan : content editable node
     */
    _initEvents(insideSpan) {
        let _this = this;
        insideSpan.addEventListener("keydown", event => {
            if (event.keyCode === 13) { // Enter key pressed
                event.preventDefault();
                _this._submitCommand();
                return false;
            }
        });
    }
    
    /**
     * _submitCommand
     * Fires a custom event to warn the editor a command is submitted by the user.
     */
    _submitCommand() {
        window.dispatchEvent(new CustomEvent("submitCommand", 
                                             {detail: this.editableNode.innerHTML.slice(1, 
                                                            this.editableNode.innerHTML.length)}));
    }
}

EditorCommandInput.EDITABLE_NODE_ID = "editorCommandInputEditable";
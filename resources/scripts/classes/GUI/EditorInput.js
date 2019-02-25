/**
 * EditorInput
 * Class which represents an editor's input.
 */
class EditorInput extends AbstractInput {
    constructor(editor) {
        super();
        this.inputNode = this._create(editor);
        this.editableNode = document.getElementById(EditorInput.EDITABLE_NODE_ID);
    }

    /**
     * _create
     * Creates an editor's input and initializes its events.
     * @param {DOM node} editor : editor's DOM node
     */
    _create(editor) {
        let inputNode = document.createElement("span");
        inputNode.id = EditorInput.EDITABLE_NODE_ID;
        inputNode.contentEditable = "true";
        inputNode.spellcheck = false;
        
        this._initEvents(inputNode);
        
        editor.append(inputNode);
        return inputNode;
    }

    /**
     * _initEvents
     * Initializes editor's input events.
     * @param {DOM node} insideSpan : content editable node
     */
    _initEvents(insideSpan) {
        let _this = this;
        insideSpan.addEventListener("keydown", event => {
            // TODO
        });
    }
}

EditorInput.EDITABLE_NODE_ID = "editorinputEditable";
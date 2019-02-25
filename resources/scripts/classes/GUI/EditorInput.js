/**
 * EditorInput
 * Class which represents an editor's input.
 */
class EditorInput extends AbstractInput {
    constructor(container) {
        super();
        this.editableNode = this._create(container);
    }

    /**
     * _create
     * Creates an editor's input and initializes its events.
     * @param {DOM node} container : container's DOM node
     */
    _create(container) {
        let inputNode = document.createElement("span");
        inputNode.id = EditorInput.EDITABLE_NODE_ID;
        inputNode.contentEditable = "true";
        inputNode.spellcheck = false;

        container.append(inputNode);

        return inputNode;
    }
}

EditorInput.EDITABLE_NODE_ID = "editorinputEditable";
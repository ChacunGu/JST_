/**
 * Editor
 * Class which represents a text editor.
 */
class Editor {
    constructor() {
        this.editorNode = document.getElementById(Editor.NODE_ID);
        this.input = new EditorInput(this.editorNode);
        this.hide();
    }

    /**
     * open
     * Opens given file.
     * @param {File} file : file to edit
     * @param {bool} isCreating : true if the file has to be created when saved false otherwise (updating)
     * @param {Directory} parentDirectory : file's parent directory
     */
    open(file, isCreating=false, parentDirectory=null) {
        this.input.setValue(file.getContent());
    }

    /**
     * clear
     * Clears the editor's content.
     */
    clear() {
        
    }

    /**
     * display
     * Displays the editor.
     */
    display() {
        this.editorNode.style.visibility = "visible";
    }

    /**
     * hide
     * Hides the editor.
     */
    hide() {
        this.editorNode.style.visibility = "hidden";
    }

    /**
     * isVisible
     * Returns true if the terminal is visible false otherwise.
     */
    isVisible() {
        return this.editorNode.style.visibility == "visible";
    }
}

Editor.NODE_ID = "editor";
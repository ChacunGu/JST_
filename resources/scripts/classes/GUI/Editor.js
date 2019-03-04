/**
 * Editor
 * Class which represents a text editor.
 */
class Editor {
    constructor() {
        this.editorNode = document.getElementById(Editor.NODE_ID);
        this.input = null;
        this.commandInput = null;
        this._create(this.editorNode);
        this._initEvents();
        this.filenameBoxNode = document.getElementById(Editor.BOTTOM_FILENAME_BOX);

        this.hide();

        this.modificationSaved = true;
        this.createFile = true;
        this.file = null;
        this.parentDirectory = null;
        
        this.mode = Editor.MODE_GENERAL;
        this.changeMode(this.mode);
    }

    /**
     * _create
     * Creates an editor's input and initializes its events.
     * @param {DOM node} editor : editor's DOM node
     */
    _create(editor) {
        let topContainer = document.createElement("div");
        topContainer.id = Editor.TOP_CONTAINER_ID;
        let bottomContainer = document.createElement("div");
        bottomContainer.id = Editor.BOTTOM_CONTAINER_ID;

        let leftSideNode = document.createElement("div");
        leftSideNode.id = Editor.LEFT_SIDE_NODE_ID;

        topContainer.append(leftSideNode);
        this.input = new EditorInput(topContainer);

        let filenameBoxNode = document.createElement("div");
        filenameBoxNode.id = Editor.BOTTOM_FILENAME_BOX;

        this.commandInput = new EditorCommandInput(bottomContainer);

        bottomContainer.append(filenameBoxNode);
        
        editor.append(bottomContainer);
        editor.append(topContainer);
    }
    
    /**
     * _initEvents
     * Initializes the editor's event listeners.
     */
    _initEvents() {
        window.addEventListener("submitCommand", event => this._processInput(event.detail));
        this.input.editableNode.onkeypress = () => {
            this.modificationSaved = false;
        };
    }

    /**
     * _processInput
     * Processes a given user input.
     * @param {String} userInput : command the user submitted
     */
    _processInput(userInput) {
        this.commandInput._clear();
        switch(userInput) {
            case "q!":
                this._exit();     
                break;
            case "q":
                if (!this.modificationSaved) {
                    this.changeMode(Editor.MODE_GENERAL);
                    this.commandInput.setValue("<span class='editorWarningMsg'>No write since last change (add ! to override)</span>");
                } else
                    this._exit();     
                break;
            case "w":
                this.modificationSaved = true;
                this._save();
                break;
            case "wq":
                this.modificationSaved = true;
                this._save();
                this._exit();
                break;
            default:
                this.changeMode(Editor.MODE_GENERAL);
                this.commandInput.setValue("<span class='editorWarningMsg'>Not an editor command: " + userInput + "</span>");
        }
    }

    /**
     * _save
     * Saves edited file.
     */
    _save() {
        let content = this.input.getContent().split("</div>").join("")
                                             .split("<div>").join("<br>");
        this.file.setContent(content);

        // create new file
        if (this.createFile)
            this.parentDirectory.addChild(this.file);
    }

    /**
     * _exit
     * Exits editor.
     */
    _exit() {
        window.dispatchEvent(new Event("hideEditor"));
    }

    /**
     * changeMode
     * Changes the current mode for the given one.
     * @param {String} newMode : new mode to set
     */
    changeMode(newMode) {
        this.mode = newMode;
        document.activeElement.blur();
        this.commandInput._clear();
        this.focusInput();

        if (this.mode == Editor.MODE_INSERT)
            this.commandInput.setValue("--INSERT--");
    }

    /**
     * setFilenameBoxContent
     * Sets filename box's content with the given one.
     * @param {String} content : content to set
     */
    setFilenameBoxContent(content) {
        this.filenameBoxNode.innerHTML = content;
    }

    /**
     * getMode
     * Returns the current editor's mode.
     */
    getMode() {
        return this.mode;
    }

    /**
     * getInput
     * Returns editor's input.
     */
    getInput() {
        return this.input;
    }

    /**
     * getCommandInput
     * Returns editor's command input.
     */
    getCommandInput() {
        return this.commandInput;
    }

    /**
     * open
     * Opens given file.
     * @param {File} file : file to edit
     * @param {Directory} parentDirectory : file's parent directory
     * @param {bool} isCreating : true if the file has to be created when saved false otherwise (updating)
     */
    open(file, parentDirectory, isCreating=false) {
        this.file = file;
        this.parentDirectory = parentDirectory;
        this.createFile = isCreating;
        this.modificationSaved = true;
        this.input.setValue(this.file.getContent());
        this.setCursorPosition(0);
        this.mode = Editor.MODE_GENERAL;
        this.changeMode(this.mode);

        let filename = this.file.getName();
        let filePath = this.file.getPath();
        filePath = filePath != filename ? filePath : this.parentDirectory.getPath() + "/" + filename;
        
        this.commandInput.setValue("\"" + filename + "\"" + (isCreating ? " [New File]" : ""));
        this.setFilenameBoxContent(filePath);
    }

    /**
     * clear
     * Clears the editor's content.
     */
    clear() {
        this.input.clear();
    }

    /**
     * focus
     * Puts focus on the editor's input.
     */
    focusInput() {
        if (this.mode == Editor.MODE_COMMAND)
            this.commandInput.focus(this.input.getCursorPosition());
        else if (this.mode == Editor.MODE_INSERT)
            this.input.focus(this.input.getCursorPosition());
    }

    /**
     * verifyCommandInputValidity 
     * Checks command input's content to verify its validity (beginning with ':').
     */
    verifyCommandInputValidity() {
        if (this.mode == Editor.MODE_COMMAND) {
            if (this.commandInput.getContent()[0] != ":")
                this.changeMode(Editor.MODE_GENERAL);
        }
    }

    /**
     * setCursorPosition
     * Sets the editor input's cursor postion.
     * @param {int} pos : new cursor position in text
     */
    setCursorPosition(pos) {
        this.input.setCursorPosition(pos);
    }

    /**
     * display
     * Displays the editor.
     */
    display() {
        this.editorNode.style.visibility = "visible";
        this.focusInput();
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
Editor.TOP_CONTAINER_ID = "editorTopContainer";
Editor.BOTTOM_CONTAINER_ID = "editorBottomContainer";
Editor.LEFT_SIDE_NODE_ID = "editorLeftSideNode";
Editor.BOTTOM_FILENAME_BOX = "editorFilenameBox";

Editor.MODE_GENERAL = "GENERAL";
Editor.MODE_COMMAND = "COMMAND";
Editor.MODE_INSERT = "INSERT";

Editor.KEY_TOGGLE_MODE_GENERAL = 27; // escape
Editor.KEY_TOGGLE_MODE_COMMAND = 190; // :
Editor.KEY_TOGGLE_MODE_INSERT = 73; // i

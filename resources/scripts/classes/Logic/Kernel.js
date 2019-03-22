/**
 * Kernel
 * Class which represents a basic adapted Linux Kernel. Provides methods to handle user's inputs
 * and perform basics tasks (keeping trace of the user, hostname, current path, etc.).
 */
class Kernel {
    constructor() {
        this.groups = null;
        this.users = null;
        let rootUser = null;
        this.user = null;
        this.hiddenHistory = [];
        this.history = [];
        this.historySelectedCmdIndex = -1;
        this.currentDirectory = null;
        this.currentCommand = null;

        this._init();
        this._initEvents();
        this.terminal = new Terminal(this.getHeader());
        this.editor = new Editor(this);
    }

    /**
     * _init
     * Initializes kernel state.
     */
    _init() {
        this.groups = [Kernel.ROOT_GROUP];
        this.users = [Kernel.ROOT_USER];
        
        let rootUser = Kernel.ROOT_USER;
        rootUser.changePassword("", "root");
        
        this.user = rootUser;

        this.hiddenHistory = [];
        this.history = [];
        this.historySelectedCmdIndex = -1;
        
        this._initRoot();
        this._initEtc();
        this._initHome();
        this._initCommands();

        this._updateEtc();

        this.currentDirectory = this.homeDirectory;
        this.currentCommand = null;
    }
    
    /**
     * _initEvents
     * Initializes the Kernel's event listeners.
     */
    _initEvents() {
        window.addEventListener("submit", event => this._processInput(event.detail));
        window.addEventListener("historyup", () => this._browseHistory(true));
        window.addEventListener("historydown", () => this._browseHistory(false));
        window.addEventListener("autocomplete", event => this._autocomplete(event.detail[0], event.detail[1], event.detail[2]));
        window.addEventListener("hideEditor", () => this._hideEditor());
    }

    /**
     * _initRoot
     * Initialize the root directory and all its children.
     */
    _initRoot() {
        this.root = new Directory("");

        new Directory("bin", this.user, this.root); // put all commands here
        new Directory("boot", this.user, this.root);
        new Directory("dev", this.user, this.root);
        new Directory("etc", this.user, this.root);
        new Directory("home", this.user, this.root);
        new Directory("tmp", this.user, this.root);
        new Directory("var", this.user, this.root);
        new Directory("root", this.user, this.root).permission.setRights("700");
    }

    /**
     * _initEtc
     * Initialize the etc directory
     */
    _initEtc() {
        let etc = this.root.find("etc");
        etc.addChild(new File("passwd"));
        let shadow = new File("shadow");
        shadow.setRights("700");
        etc.addChild(shadow);
        etc.addChild(new File("group"));
    }

    /**
     * _updateEtc
     * Update the files inside /etc
     * contain the users, passwords and groups
     */
    _updateEtc() {
        let etc = this.root.find("etc");
        let home = this.root.find("home");

        let passwdFile = etc.find("passwd");
        let passwdText = "";
        
        for (let i = 0 ; i < this.users.length ; i++) {
            let name = this.users[i].getName();
            passwdText += name;
            passwdText += ":*:";
            passwdText += home.find(name) ? 
                            home.find(name).getPath() : 
                            this.root.find("root").getPath();
            if (i < this.users.length-1) {
                passwdText += "\n";
            }
        }
        passwdFile.setContent(passwdText);

        let shadowFile = etc.find("shadow");
        let shadowText = "";

        for (let i = 0 ; i < this.users.length ; i++) {
            shadowText += this.users[i].getName();
            shadowText += ":$5$";
            shadowText += this.users[i].getPassword();
            if (i < this.users.length-1) {
                shadowText += "\n";
            }
        }
        shadowFile.setContent(shadowText);

        let groupFile = etc.find("group");
        let groupText = "";

        for (let i = 0 ; i < this.groups.length ; i++) {
            groupText += this.groups[i].getName();
            groupText += ":";
            let users = this.groups[i].getUsers();
            for (let j = 0 ; j < users.length ; j++) {
                groupText += users[j].getName();
                if (j < users.length-1) {
                    groupText += ",";
                }
            }
            if (i < this.groups.length-1) {
                groupText += "\n";
            }
        }
        groupFile.setContent(groupText);
    }

    /**
     * _initHome
     * Initializes the home directory and its children.
     */
    _initHome() {
        this.homeDirectory = this.root.find("home");
        let story = new File("README", this.getUser());
        story.setRights("700");
        story.content = `
# JST_

JST_ stands for JavaScript Terminal.

Consists of a plain JavaScript and HTLM5 implementation of a Linux terminal.

## Context

Neuchâtel, 2018-2019.

Developped for the 3rd year's course "Conception OS" of the "Développement Logiciel et Multimédia" Bachelor in HE-Arc (https://www.he-arc.ch/ingenierie).

## Team

- Donzé Célien (https://github.com/Lorkii)

- Chacun Guillaume (https://github.com/ChacunGu)
        `;
        this.homeDirectory.addChild(story);
    }

    /**
     * _initCommands
     * Creates the commands file and references them.
     */
    _initCommands() {
        // create binary files for commands
        let bin = this.root.find("bin");
        bin.addChild(new CommandClear(this));
        bin.addChild(new CommandHistory(this));
        bin.addChild(new CommandLS(this));
        bin.addChild(new CommandCD(this));
        bin.addChild(new CommandPWD(this));
        bin.addChild(new CommandEcho(this));
        bin.addChild(new CommandMan(this));
        bin.addChild(new CommandDate(this));
        bin.addChild(new CommandTouch(this));
        bin.addChild(new CommandRM(this));
        bin.addChild(new CommandMKDIR(this));
        bin.addChild(new CommandCP(this));
        bin.addChild(new CommandMV(this));
        bin.addChild(new CommandLN(this));
        bin.addChild(new CommandRMDIR(this));
        bin.addChild(new CommandEdit(this));
        bin.addChild(new CommandCat(this));
        bin.addChild(new CommandHead(this));
        bin.addChild(new CommandTail(this));
        bin.addChild(new CommandChmod(this));
        bin.addChild(new CommandChown(this));
        bin.addChild(new CommandSU(this));
        bin.addChild(new CommandUseradd(this));
        bin.addChild(new CommandPassWD(this));
        bin.addChild(new CommandGroupadd(this));
        bin.addChild(new CommandUsermod(this));
        bin.addChild(new ImportK(this));
        bin.addChild(new ExportK(this));
    }

    /**
     * _processInput
     * Processes a given user input.
     * 
     * @param {String} userInput : command the user submitted
     */
    _processInput(userInput) {
        if (this.currentCommand != null) { // multi part command (input from command's prompt) : su
            this._handleFollowUpInput(userInput);
        } else {
            if (userInput.length > 0) {
                let inputs = this._splitArgs(userInput);
                let commandName = inputs.shift();
                let args = this._processArgs(inputs);
                if (commandName != "exportk" && commandName != "importk")
                    this._addToHistory(userInput);
    
                try {
                    let command = this.root.find("bin").find(commandName);
                    if (this.getUser().canExecute(command)) {
                        this.currentCommand = commandName;
                        let commandResult = command.execute(args.options, args.params);
                        if (commandResult != undefined) {
                            this.displayBlock(commandResult.getContent(), 
                                              commandResult.getAddBreakline(), 
                                              commandResult.getCustomHeader(),
                                              commandResult.getNewInputNeeded(),
                                              userInput);
    
                            // handle prompt mode (for commands like su)
                            if (commandResult.getNewInputNeeded()) {
                                this.terminal.togglePromptMode();
                                this.terminal.togglePasswordMode();
                                return;
                            }
                        }
                    } else {
                        this.displayBlock("Error : Permission denied");
                    }
                } catch (e) {
                    if (e instanceof TypeError) {
                        this.displayBlock("Unknown command");
                    } else {
                        console.log(e);
                    }
                }
            } else
                this.terminal.addBlock(this.getHeader(), "", "");
            this.currentCommand = null;
        }
    }

    /**
     * _processArgs
     * Returns raw command's options and parameters splitted by spaces and quotes.
     * @param {Array} args : array of arguments to process
     */
    _splitArgs(args) {
        let splittedArgs = args.split(" ");
        let foundQuote = false;
        let foundApostrophe = false;
        let counterArgsSinceQuote = 0;
        let counterArgsSinceApostrophe = 0;
        let preparedArgs = [];
        for (let i=0; i<splittedArgs.length; i++) {
            if ((splittedArgs[i][0] == "\"" && splittedArgs[i][splittedArgs[i].length-1] == "\"" && !foundQuote) ||
                (splittedArgs[i][0] == "'" && splittedArgs[i][splittedArgs[i].length-1] == "'" && !foundApostrophe))
                preparedArgs.push(splittedArgs[i]);
            else {
                if (splittedArgs[i][0] == "\"")
                    foundQuote = true;
                if (splittedArgs[i][0] == "'")
                    foundApostrophe = true;

                if (splittedArgs[i][splittedArgs[i].length-1] == "\"" && foundQuote) {
                    preparedArgs[preparedArgs.length-1] += " " + splittedArgs[i];
                    for (let j=0; j<counterArgsSinceQuote-1; j++) {
                        preparedArgs[preparedArgs.length-2] += " " + preparedArgs[preparedArgs.length-1];
                        preparedArgs.pop();
                    }
                    
                    foundQuote = false;
                    counterArgsSinceQuote = 0;
                } else if (splittedArgs[i][splittedArgs[i].length-1] == "'" && foundApostrophe) {
                    preparedArgs[preparedArgs.length-1] += " " + splittedArgs[i];
                    for (let j=0; j<counterArgsSinceApostrophe-1; j++) {
                        preparedArgs[preparedArgs.length-2] += " " + preparedArgs[preparedArgs.length-1];
                        preparedArgs.pop();
                    }
                    
                    foundApostrophe = false;
                    counterArgsSinceApostrophe = 0;
                } else {
                    if (foundQuote)
                        counterArgsSinceQuote++;
                    if (foundApostrophe)
                        counterArgsSinceApostrophe++;
                    preparedArgs.push(splittedArgs[i]);
                }
            }
        }
        return preparedArgs;
    }

    /**
     * _processArgs
     * Returns command's options and parameters in a dictionnary.
     * @param {Array} args : array of arguments to process
     */
    _processArgs(args) {
        let options = [];
        let params = [];
        args.forEach((elem) => {
            if (elem[0] == "-") {
                elem = elem.substr(1);
                elem.split("").forEach((arg) => options.push(arg));
            } else
                params.push(elem);
        });
        return {options: options, params: params};
    }

    /**
     * _handleFollowUpInput
     * Handles user input from a command's follow up prompt (ie: su)
     * 
     * @param {String} userInput : command the user submitted
     */
    _handleFollowUpInput(userInput) {
        let command = this.root.find("bin").find(this.currentCommand);
        let commandResult = command.executeFollowUp(userInput);

        // display command's feedback message
        if (commandResult != undefined && commandResult.getContent().length > 0) {
            this.terminal.addSimpleText(commandResult.getContent());
        }
        
        // add breakline
        if (commandResult == undefined || commandResult.getAddBreakline()) {
            this.terminal.addBR();
        }
        
        // end command's execution
        if (commandResult == undefined || !commandResult.getNewInputNeeded()) {
            this.terminal.togglePromptMode();
            this.terminal.togglePasswordMode();
            this.currentCommand = null;
        }
    }

    /**
     * _addToHistory
     * Appends command to history.
     * @param {String} command : command to append to history
     */
    _addToHistory(command) {
        this.history.push(command);
    }

    /**
     * _getLastCommand
     * Returns last executed command.
     */
    _getLastCommand() {
        return this.history[this.history.length-1];
    }

    /**
     * _browseHistory
     * Browse commands history and sets terminal's input value.
     * @param {bool} isBrowsingUpward : true if browsing older commands (up) false otherwise
     */
    _browseHistory(isBrowsingUpward) {
        let canBrowseHistory = false;

        // browse history
        if (isBrowsingUpward) {
            if (this.historySelectedCmdIndex < this.history.length-1) {
                this.historySelectedCmdIndex++;
                canBrowseHistory = true;
            }
        } else {
            if (this.historySelectedCmdIndex >= 0) {
                this.historySelectedCmdIndex--;
                canBrowseHistory = true;
            }
        }
        // set terminal's input value
        if (canBrowseHistory) {
            this.terminal.setInputContent(this.historySelectedCmdIndex >= 0 ?
                                          this.history[this.history.length - 1 - this.historySelectedCmdIndex] :
                                          "");
            this.focusTerminalInput();
        }
    }

    /**
     * _correctEditedPath
     * Surrounds edited param by quotes if it contains spaces.
     * 
     * @param {String} value : current terminal's input value
     * @param {int} cursorPosition : cursor's position in the input value
     */
    _correctEditedPath(value, cursorPosition) {
        let nbQuotes = value.split("\"").length - 1;
        let nbApostrophe = value.split("'").length - 1;

        if (nbQuotes%2 == 1 && nbApostrophe%2 == 1)
            return null;
        else if (nbQuotes%2 == 1)
            return value.slice(0, cursorPosition) + "\"" + value.slice(cursorPosition);
        else if (nbApostrophe%2 == 1)
            return value.slice(0, cursorPosition) + "'" + value.slice(cursorPosition);
        else
            return value;
    }

    /**
     * _findComplexEditedPath
     * Search currently edited path in the terminal's input value. 
     * Returns the path and its first character position in the input value.
     * 
     * @param {String} value : current terminal's input value
     * @param {int} cursorPosition : cursor's position in the input value
     * @param {Array} params : parameters extracted from terminal's input value
     */
    _findComplexEditedPath(value, cursorPosition, params) {
        let elemAtCursorPos = cursorPosition < value.length ? value[cursorPosition] : "";
        let searchedElem = null;
        let searchedArg = "";
        let argIndex = null;
        let argIndexStart = null;

        // identify edited path's delimeter
        if (elemAtCursorPos == "\"") {
            searchedElem = "\"";
            searchedArg = "\"";
        } else if (elemAtCursorPos == "'") {
            searchedElem = "'";
            searchedArg = "'";
        } else if (elemAtCursorPos == "" || elemAtCursorPos == " ") {
            searchedElem = " ";
            searchedArg = "";
        } else
            return {path: null};

        // retrieve edited path from terminal's input value
        for (let i=cursorPosition-1; i>=0; i--) {
            searchedArg = value[i] + searchedArg;
            if (value[i] == searchedElem) {
                argIndexStart = i+1;
                if (searchedElem == " ") {
                    searchedArg = searchedArg.slice(1);
                }
                break;
            }
        }

        // search and retrieve edited arguments from terminal's input value
        for (let i=0; i<params.length; i++) {
            if (searchedArg == params[i]) {
                argIndex = i;
                break;
            }
        }

        // if path is found
        if (argIndex != null)
            return {path: this.preparePath(params[argIndex]), argIndex: argIndex, argIndexStart: argIndexStart};
        return {path: null};
    }

    /**
     * _retrieveMatchingDirectoryChildren
     * Retrieves directory's children elements with name matching given pattern.
     * 
     * @param {Directory} directory : searched elements parent directory
     * @param {String} pattern : searched pattern
     */
    _retrieveMatchingDirectoryChildren(directory, pattern) {
        let children = directory.getChildren();
        let matchingElements = [];

        // search matching elements
        for (let i=0; i<children.length; i++) {
            if (children[i].getName().startsWith(pattern))
                matchingElements.push(children[i]);
        }

        return matchingElements;
    }

    /**
     * _formatCompletedPath
     * Formats and returns the new input value after autocompletion.
     * 
     * @param {String} currentInputValue : current terminal's input value
     * @param {int} argIndexStart : edited path's first character position in the input value
     * @param {int} argIndexEnd : edited path's last character position in the input value
     * @param {String} currentDirectoryPath : autocompleted path's resulting directory
     * @param {Array} matchingElements : array of elements in the targeted directory with names containing searched pattern
     */
    _formatCompletedPath(currentInputValue, argIndexStart, argIndexEnd, currentDirectoryPath, matchingElements) {
        let completedPath = currentDirectoryPath + 
                            (currentDirectoryPath[currentDirectoryPath.length-1] != "/" && currentDirectoryPath.length > 0 ? "/" : "") + 
                            matchingElements[0].getName() + 
                            (matchingElements[0] instanceof Directory ? "/" : "");

        // retrieve command part written before and after completed path
        let newInputValue = [currentInputValue.slice(0, argIndexStart),
                            currentInputValue.slice(argIndexEnd)];
        
        // handle paths not initially surrounded by quotes but containing spaces
        if (completedPath.split(" ").length > 1) {
            if (!(newInputValue[0][newInputValue[0].length-1] == "\"" && newInputValue[1][0] == "\"") && 
                !(newInputValue[0][newInputValue[0].length-1] == "'" && newInputValue[1][0] == "'")) {
                completedPath = "\"" + completedPath + "\"";
                argIndexStart--;
            }
        }

        // insert completed path in the command
        newInputValue = newInputValue[0] + completedPath + newInputValue[1];

        return {newInputValue: newInputValue, argIndexStart: argIndexStart, completedPathLength: completedPath.length};
    }

    /**
     * _autocomplete
     * Completes the user's input if possible.
     * 
     * @param {String} currentInputValue : current terminal's input value
     * @param {int} cursorPosition : cursor's position in the input value
     * @param {bool} doubleTap : true if the user double pressed the tab key false otherwise
     */
    _autocomplete(currentInputValue, cursorPosition, doubleTap=false) {
        currentInputValue = this._correctEditedPath(currentInputValue, cursorPosition);

        if (currentInputValue != null) {
            // input pre processing
            let inputs = this._splitArgs(currentInputValue);
            let args = this._processArgs(inputs);
            
            let argIndexStart = null;
            let argIndexEnd = cursorPosition;
            let path = null;
            
            // retrieve path
            if (args.params.length == 1) // only one element in terminal's input value
                path = this.preparePath(args.params[0]);
            else { // multiple elements in terminal's input value
                let res = this._findComplexEditedPath(currentInputValue, cursorPosition, args.params);
                path = res.path;
                argIndexStart = res.argIndexStart;
            }
            
            if (path != null) {
                // separate filename from its path
                let pathInfo = Kernel.retrieveElementNameAndPath(path);
                let currentDirectoryPath = pathInfo.dir;
                let currentDirectory = this.findElementFromPath(currentDirectoryPath);
                let searchedElementName = pathInfo.elem;

                if (currentDirectory != null) { // if path does exist
                    if (currentDirectory instanceof Directory) { // if path points to a directory
                        let matchingElements = this._retrieveMatchingDirectoryChildren(currentDirectory, searchedElementName);

                        if (matchingElements.length == 1) { // only one matching element found
                            // format path
                            let res = this._formatCompletedPath(currentInputValue, argIndexStart, argIndexEnd, currentDirectoryPath, matchingElements);
                            let newInputValue = res.newInputValue;
                            argIndexStart = res.argIndexStart;
                            let completedPathLength = res.completedPathLength;

                            // change input's value and set focus
                            this.terminal.setInputContent(newInputValue);
                            this.terminal.setCursorPosition(argIndexStart + completedPathLength);
                            this.terminal.focusInput();
                        } else if (matchingElements.length > 1) { // multiple matching elements found
                            if (doubleTap) { // display matching elements
                                let paths = "";
                                for (let i=0; i<matchingElements.length; i++)
                                    paths += matchingElements[i].getName() + "<br/>";
                                    this.terminal.addBlock(this.getHeader(), currentInputValue, paths, false);
                            }
                        }
                    }
                }
            }
        }
    }

    /**
     * _displayEditor
     * Displays the text editor and hides the terminal.
     */
    _displayEditor() {
        this.editor.display();
        this.terminal.hide();
    }

    /**
     * _hideEditor
     * Hides the text editor and displays the terminal.
     */
    _hideEditor() {
        this.editor.hide();
        this.terminal.display();
    }

    /**
     * getEditor
     * Returns the kernel's text editor.
     */
    getEditor() {
        return this.editor;
    }

    /**
     * getTerminal
     * Returns the kernel's terminal.
     */
    getTerminal() {
        return this.terminal;
    }

    /**
     * openEditor
     * Opens given file in an editor.
     * @param {File} file : file to edit
     * @param {Directory} parentDirectory : file's parent directory
     * @param {bool} isCreating : true if the file has to be created when saved false otherwise (updating)
     */
    openEditor(file, parentDirectory, isCreating=false) {
        this._displayEditor();
        this.editor.open(file, parentDirectory, isCreating);
    }

    /**
     * resetHistorySelectedCmdIndex
     * Resets history selected command index.
     */
    resetHistorySelectedCmdIndex() {
        this.historySelectedCmdIndex = -1;
    }

    /**
     * getHistory
     * Returns commands history.
     */
    getHistory() {
        return this.history;
    }

    /**
     * displayBlock
     * Creates and displays a new block with the last command and its given value.
     * @param {String} value : last command's result
     * @param {bool} addBreakLine : true if a break line should be added after the given content false otherwise
     * @param {String} customHeader : custom command's header
     * @param {bool} isNewInputNeeded : true if a following input should be displayed after this block false otherwise.
     * @param {String} commandName : last command's name
     */
    displayBlock(value, addBreakLine=true, customHeader="", isNewInputNeeded=false, commandName=null) {
        this.terminal.addBlock(customHeader.length > 0 ? customHeader : this.getHeader(), 
                                commandName==null ? this._getLastCommand() : commandName, 
                                value, addBreakLine, isNewInputNeeded);
    }

    /**
     * getHeader
     * Returns a string containing some global informations like the current user, the hostname and 
     * the current path.
     */
    getHeader() {
        return this.user.getName() + "@" + this.user.getGroupName() + ": " + this.currentDirectory.getPath();
    }

    /**
     * Returns root directory.
     */
    getRootDirectory() {
        return this.root;
    }

    /**
     * Returns home directory.
     */
    getHomeDirectory() {
        return this.homeDirectory;
    }

    /**
     * Returns current directory.
     */
    getCurrentDirectory() {
        return this.currentDirectory;
    }

    /**
     * setCurrentDirectory
     * Changes current directory.
     * @param {Directory} newCurrentDirectory : new current directory
     */
    setCurrentDirectory(newCurrentDirectory) {
        this.currentDirectory = newCurrentDirectory;
        this.terminal.updateHeader(this.getHeader());
    }

    /**
     * getUser
     * retrieves the current user for the kernel
     */
    getUser() {
        return this.user;
    }

    /**
     * clearTerminal
     * Clears terminal.
     */
    clearTerminal() {
        this.terminal.clear();
    }

    /**
     * focusTerminalInput
     * Focuses terminal's input.
     */
    focusTerminalInput() {
        this.terminal.focusInput();
    }

    /**
     * findElementFromPath
     * finds a directory if exist from a string Path
     * if not returns null
     * @param {String} path 
     * @param {bool} followingSymbolicLink : true if we follow the symbolic files pointer false if we return them
     */
    findElementFromPath(path, followingSymbolicLink=true) {
        // verify path existance
        let listFilenames = path.split("/");
        let startingDirectory = null;

        if (path[0] == "/") { // absolute path
            listFilenames.shift();
            startingDirectory = this.getRootDirectory();                
        } else if (path[0] == "~") { // home
            listFilenames.shift();
            startingDirectory = this.getHomeDirectory();
        } else { // relative path
            startingDirectory = this.getCurrentDirectory();
        }

        try {
            let element = startingDirectory;
            for (let i=0; i<listFilenames.length && (i==0 || element!=null); i++) {
                if (listFilenames[i].length > 0)
                    element = element.find(listFilenames[i], followingSymbolicLink);
            }

            return element;
        } catch (e) {
            return null;
        }
    }

    /**
     * preparePath
     * Prepares and returns given path.
     * @param {String} path : raw path
     */
    preparePath(path) {
        // remove possible quote marks
        let preparedPath = Kernel.removePossibleInputQuotes(path);

        return preparedPath;
    }

    /**
     * addUser
     * adds a user to the user's array of the kernel
     * @param {User} user 
     */
    addUser(user) {
        if (user instanceof User) {
            this.users.push(user);
        }    
    }

    /**
     * addGroup
     * adds a group to the list of groups of the kernel
     * @param {Group} group 
     */
    addGroup(group) {
        if (group instanceof Group) {
            this.groups.push(group);
        }
    }

    /**
     * addUserToGroup
     * add a user to a group
     * @param {User} user 
     * @param {Group} group 
     */
    addUserToGroup(user, group) {
        if (!user.isInList(group.getUsers())) {
            user.addToGroup(group);
        }
        this._updateEtc();
    }

    /**
     * changePasswordSHA
     * changes the user's password
     * @param {User} user 
     * @param {String} oldPassword 
     * @param {String} newPassword 
     */
    changePasswordSHA(user, oldPassword, newPassword) {
        user.changePasswordSHA(oldPassword, newPassword);
        this._updateEtc();
    }

    /**
     * setPasswordSHA
     * Sets the user's password without any verification.
     * @param {User} user 
     * @param {String} newPassword 
     */
    setPasswordSHA(user, newPassword) {
        user.setPasswordSHA(newPassword);
        this._updateEtc();
    }

    /**
     * createUser
     * create a new user
     * set the group to be at least his name
     * @param {String} name 
     * @param {Group} group 
     */
    createUser(name, group=null) {
        if (group == null) {
            group = new Group(name);
        }
        if (!group.isInList(this.groups)) {
            this.addGroup(group);
        }
        let newUser = new User(name, group);
        this.addUser(newUser);

        new Directory(newUser.getName(), newUser, this.homeDirectory);
        
        this._updateEtc();
        
        return newUser;
    }

    /**
     * createGroup
     * create a new group and adds it to the list
     * @param {String} name 
     */
    createGroup(name) {
        let newGroup = null;
        if (this.findGroup(name) == null) {
            newGroup = new Group(name);
        }
        this.addGroup(newGroup);

        this._updateEtc();

        return newGroup;
    }

    /**
     * findUser
     * Returns a user by name if exists
     * @param {String} name 
     */
    findUser(name) {
        for (let i=0 ; i < this.users.length ; i++) {
            if (this.users[i].getName() == name) {
                return this.users[i];
            }
        }
        return null;
    }

    /**
     * findGroup
     * Returns a group by name if exists
     * @param {String} name 
     */
    findGroup(name) {
        for (let i=0 ; i < this.groups.length ; i++) {
            if (this.groups[i].getName() == name) {
                return this.groups[i];
            }
        }
        return null;
    }

    /**
     * setUser
     * Changes current user to given one.
     * 
     * @param {User} user : new user
     */
    setUser(user) {
        this.user = user;
        this.terminal.updateHeader(this.getHeader());
    }

    /**
     * import
     * Import kernel state.
     * 
     * @param {Array} history : kernel state command history
     * @param {Array} hiddenHistory : kernel state hidden history
     */
    import(history, hiddenHistory) {
        for (let i=0; i<history.length; i++) {
            let inputs = this._splitArgs(history[i]);
            let commandName = inputs.shift();
            let args = this._processArgs(inputs);
            try {
                let command = this.root.find("bin").find(commandName);
                hiddenHistory = command.executeForKernelRestoration(args.options, args.params, hiddenHistory);
            } catch(e) {}
        }

        this.history = history;
        this.hiddenHistory = hiddenHistory;
        this.root.find("bin").find("clear").execute();
    }

    /**
     * getKernelStateAsJSON
     * Returns kernel's state as json.
     */
    getKernelStateAsJSON() {
        return JSON.stringify({history: this.history, hiddenHistory: this.hiddenHistory});
    }

    /**
     * exportToFileStorage
     * Export current kernel state to file storage.
     * 
     * @param {String} json : kernel state in json
     */
    exportToFileStorage(json) {
        localStorage.setItem("data", json);
    }

    /********************************************************************************/
    /* Static Part */
    /********************************************************************************/

    /**
     * retrieveElementNameAndPath
     * Retrives the final element's name and its parent directory path from the given path.
     * @param {String} raw_path : raw path
     */
    static retrieveElementNameAndPath(raw_path) {
        let lastSlashIndex = raw_path.lastIndexOf("/");
        let currentDirectoryPath = lastSlashIndex > 0 ? raw_path.slice(0, lastSlashIndex) : 
                                   lastSlashIndex == 0 ? "/" : "";
        let searchedElementName = raw_path.slice(raw_path.lastIndexOf("/")+1, raw_path.length);
        return {dir: currentDirectoryPath, elem: searchedElementName};
    }

    /**
     * removePossibleInputQuotes
     * Removes possible quotes surrounding given input.
     * @param {String} input : text possibly surrouded by quotes
     */
    static removePossibleInputQuotes(input) {
        return (input.length > 2 && input[0] == "\"" && input[input.length-1] == "\"") ||
                (input.length > 2 && input[0] == "'" && input[input.length-1] == "'") ? 
                    (input.length == 3 ? input[1] : input.slice(1, input.length-1)) : 
                    input;
    }

    /**
     * displayDate
     * displays a date in format DD MMM YYYY HH:MM
     * @param {Date} date 
     */
    static displayDate(date) {
        let month=new Array();
        month[0]="Jan";
        month[1]="Feb";
        month[2]="Mar";
        month[3]="Apr";
        month[4]="May";
        month[5]="Jun";
        month[6]="Jul";
        month[7]="Aug";
        month[8]="Sep";
        month[9]="Oct";
        month[10]="Nov";
        month[11]="Dec";
        var hours = date.getHours();
        var minutes = date.getMinutes();
        minutes = minutes < 10 ? '0' + minutes : minutes;
        var strTime = hours + ':' + minutes;
        return date.getDate() + " " + month[date.getMonth()] + " " + date.getFullYear() + " " + strTime;
    }

   /**
    *  Secure Hash Algorithm (SHA256)
    *  Source: http://www.webtoolkit.info/
    *
    *  Original code by Angel Marin, Paul Johnston.
    * 
    * @param {String} s 
    */
    static SHA256(s){
        return Tools.SHA256(s);
    }
}

Kernel.DEFAULT_USER = "guillaume.chacun";
Kernel.DEFAULT_HOSTNAME = "JST";
Kernel.DEFAULT_PATH = "~";

Kernel.ROOT_GROUP = new Group("root");
Kernel.ROOT_USER = new User("root", Kernel.ROOT_GROUP);
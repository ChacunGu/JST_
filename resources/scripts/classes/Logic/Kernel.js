/**
 * Kernel
 * Class which represents a basic adapted Linux Kernel. Provides methods to handle user's inputs
 * and perform basics tasks (keeping trace of the user, hostname, current path, etc.).
 */
class Kernel {
    constructor() {
        this.user = Kernel.DEFAULT_USER;
        this.hostname = Kernel.DEFAULT_HOSTNAME;
        this.history = [];
        this.historySelectedCmdIndex = -1;
        
        this._initRoot();
        this._initHome();
        this._initEvents();
        this._initCommands();
        
        this.currentDirectory = this.homeDirectory;
        this.terminal = new Terminal(this.getHeader());
        this.editor = new Editor();
    }
    
    /**
     * _initEvents
     * Initializes the Kernel's event listeners.
     */
    _initEvents() {
        window.addEventListener("submit", event => this._processInput(event.detail));
        window.addEventListener("historyup", event => this._browseHistory(true));
        window.addEventListener("historydown", event => this._browseHistory(false));
        window.addEventListener("autocomplete", event => this._autocomplete(event.detail[0], event.detail[1], event.detail[2]));
    }

    /**
     * _initRoot
     * Initialize the root directory and all its children.
     */
    _initRoot() {
        this.root = new Directory("");
        new Directory("bin", this.root); // put all commands here
        new Directory("boot", this.root);
        new Directory("dev", this.root);
        new Directory("etc", this.root);
        new Directory("home", this.root);
        new Directory("tmp", this.root);
        new Directory("var", this.root);
        new Directory("root", this.root);
    }

    /**
     * _initHome
     * Initializes the home directory and its children.
     */
    _initHome() {
        this.homeDirectory = this.root.find("home");
        let userDirectory = new Directory(Kernel.DEFAULT_USER, this.homeDirectory);
        let story = new File("story.txt");
        story.content = `   Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                            Morbi ac dolor vel nunc eleifend tincidunt.
                            Donec nec augue at lacus bibendum pellentesque non sit amet quam.
                            Nulla bibendum ligula a bibendum aliquet.
                            Cras sed urna euismod, porta dui quis, sollicitudin justo.
                            Maecenas ac augue at est posuere varius.
                            Phasellus sed est vitae magna molestie volutpat.
                            Curabitur pellentesque elit vitae dictum mattis.
                            Vivamus eleifend nunc id turpis sodales, eget tempor velit gravida.
                            Nam condimentum diam ut lacus semper aliquam.
                            Curabitur rutrum risus in tellus accumsan, non mollis tortor finibus.
                            Nam eleifend augue non velit dapibus dictum.
                            Sed sagittis felis sit amet sollicitudin mollis.
                            Aliquam vitae ante tempor, eleifend turpis quis, ultricies velit.
                            Integer eget orci vitae libero auctor suscipit eu sed ligula.
                            Etiam eu est non urna commodo interdum.`;
        this.homeDirectory.addChild(story);
    }

    /**
     * _initCommands
     * Creates the commands file and references them.
     */
    _initCommands() {
        this.commands = {};

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
    }

    /**
     * _processInput
     * Processes a given user input.
     * @param {String} userInput : command the user submitted
     */
    _processInput(userInput) {
        if (userInput.length > 0) {
            let inputs = this._splitArgs(userInput);
            let commandName = inputs.shift();
            let args = this._processArgs(inputs);
            this._addToHistory(userInput);

            try {
                let commandResult = this.root.find("bin").find(commandName).execute(args.options, args.params);
                if (commandResult != undefined)
                    this.displayBlock(commandResult.getContent(), 
                                        commandResult.getAddBreakline(), 
                                        commandResult.getCustomHeader());
            } catch (e) {
                console.log(e);
                if (e instanceof TypeError) {
                    this.displayBlock("Unknown command");
                } else {
                    console.log(e);
                }
            }
        } else
            this.terminal.addBlock(this.getHeader(), "", "");
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
     * _addToHistory
     * Appends command to history.
     * @param {String} command : command to append to history
     */
    _addToHistory(command) {
        this.history.push(command);
        if (this.history.length > Kernel.MAX_HISTORY_LENGTH)
            this.history.shift();
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
     * _autocomplete
     * complete the user's input if exists
     * @param {String} currentInputValue : current terminal's input value
     * @param {int} cursorPosition : cursor's position in the input value
     * @param {bool} doubleTap : true if the user double pressed the tab key false otherwise
     */
    _autocomplete(currentInputValue, cursorPosition, doubleTap=false) {
        
        // input pre processing
        let inputs = this._splitArgs(currentInputValue);
        let args = this._processArgs(inputs);
        
        // retrieve path
        let path = null;
        if (args.params.length == 1)
            path = this.preparePath(args.params[0]);
        else {
            // TODO : find specified path
            console.log("user input :\t\t", "'" + currentInputValue + "'", 
                        "\ncursor position :\t", cursorPosition, 
                        "\nchar at cursor pos :\t", cursorPosition < currentInputValue.length ? currentInputValue[cursorPosition] : "",
                        "\nargs :\t", args);
        }
        
        
        if (path != null) {
            // separate filename from its path
            let pathInfo = Kernel.retrieveElementNameAndPath(path);
            let currentDirectoryPath = pathInfo.dir;
            let currentDirectory = this.findElementFromPath(currentDirectoryPath);
            let searchedElementName = pathInfo.elem;

            console.log(searchedElementName, currentDirectory);

            if (currentDirectory != null) { // if path does exist
                if (currentDirectory instanceof Directory) { // if path points to a directory
                    let children = currentDirectory.getChildren();
                    let matchingElements = [];

                    // search matching elements
                    for (let i=0; i<children.length; i++) {
                        if (children[i].getName().startsWith(searchedElementName))
                            matchingElements.push(children[i]);
                    }

                    if (matchingElements.length == 1) { // only one matching element found
                        // change input's value
                        // TODO : adapt for autocompletion in the middle of the user input
                        console.log(currentDirectoryPath);
                        this.terminal.setInputContent(currentDirectoryPath + 
                                                      (currentDirectoryPath[currentDirectoryPath.length-1] != "/" 
                                                       && currentDirectoryPath.length > 0 ? "/" : "") + 
                                                      matchingElements[0].getName() + 
                                                      "/");
                        this.terminal.focusInput();
                    } else if (matchingElements.length > 1) { // multiple matching elements found
                        if (doubleTap) {
                            // TODO : adapt for autocompletion in the middle of the user input
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
     * openEditor
     * Opens given file in an editor.
     * @param {File} file : file to edit
     * @param {bool} isCreating : true if the file has to be created when saved false otherwise (updating)
     * @param {Directory} parentDirectory : file's parent directory
     */
    openEditor(file, isCreating=false, parentDirectory=null) {
        this._displayEditor();
        this.editor.open(file, isCreating, parentDirectory);
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
     * @param {boolean} addBreakLine : true if a break line should be added after the given content false otherwise
     * @param {String} customHeader : custom command's header
     */
    displayBlock(value, addBreakLine=true, customHeader="") {
        this.terminal.addBlock(customHeader.length > 0 ? customHeader : this.getHeader(), 
                                this._getLastCommand(), value, addBreakLine);
    }

    /**
     * getHeader
     * Returns a string containing some global informations like the current user, the hostname and 
     * the current path.
     */
    getHeader() {
        return this.user + "@" + this.hostname + ": " + this.currentDirectory.getPath();
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

        let element = startingDirectory;
        for (let i=0; i<listFilenames.length && (i==0 || element!=null); i++) {
            if (listFilenames[i].length > 0)
                element = element.find(listFilenames[i], followingSymbolicLink);
        }

        return element;
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
}

Kernel.DEFAULT_USER = "guillaume.chacun";
Kernel.DEFAULT_HOSTNAME = "JST";
Kernel.DEFAULT_PATH = "~";
Kernel.MAX_HISTORY_LENGTH = 100;
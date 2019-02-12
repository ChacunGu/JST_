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
    }
    
    /**
     * _initEvents
     * Initializes the Kernel's event listeners.
     */
    _initEvents() {
        window.addEventListener("submit", event => this._processInput(event.detail));
        window.addEventListener("historyup", event => this._browseHistory(true));
        window.addEventListener("historydown", event => this._browseHistory(false));
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
        new Directory(Kernel.DEFAULT_USER, this.homeDirectory);
    }

    /**
     * _initCommands
     * Creates the commands file and references them.
     */
    _initCommands() {
        this.commands = {};

        // create binary files
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
    }

    /**
     * _processInput
     * Processes a given user input.
     * @param {String} userInput : command the user submitted
     */
    _processInput(userInput) {
        if (userInput.length > 0) {
            let inputs = userInput.split(" ");
            let commandName = inputs.shift();
            let args = this._processArgs(inputs);
            this._addToHistory(userInput);

            try {
                this.root.find("bin").find(commandName).execute(args.options, args.params);
            } catch (e) {
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
     * Returns command's options and parameters in a dictionnary.
     * 
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
     */
    displayBlock(value) {
        this.terminal.addBlock(this.getHeader(), this._getLastCommand(), value);
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
     * findDirectoryFromPath
     * finds a directory if exist from a string Path
     * if not returns null
     * @param {String} path 
     */
    findDirectoryFromPath(path) {
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

        let directory = startingDirectory;
        for (let i=0; i<listFilenames.length && (i==0 || directory!=null); i++) {
            if (listFilenames[i].length > 0)
                directory = directory.find(listFilenames[i])
        }

        return directory;
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
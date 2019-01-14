/**
 * Kernel
 * Class which represents a basic adapted Linux Kernel. Provides methods to handle user's inputs
 * and perform basics tasks (keeping trace of the user, hostname, current path, etc.).
 */
class Kernel {
    constructor() {
        this.user = Kernel.DEFAULT_USER;
        this.hostname = Kernel.DEFAULT_HOSTNAME;
        this.path = Kernel.DEFAULT_PATH;

        this.terminal = new Terminal(this.user, this.hostname, this.path);
        this.history = [];
        
        this._initRoot();
        this._initEvents();
        this._initCommands();
    }
    
    /**
     * _initEvents
     * Initializes the Kernel's event listeners.
     */
    _initEvents() {
        window.addEventListener("submit", event => this._processInput(event.detail));
    }

    /**
     * _initRoot
     * initialize the root directory and all its children
     */
    _initRoot() {
        this.root = new Directory("");
        this.root.addChild(new Directory("bin")); // put all commands here
        this.root.addChild(new Directory("boot"));
        this.root.addChild(new Directory("dev"));
        this.root.addChild(new Directory("etc"));
        this.root.addChild(new Directory("home"));
        this.root.addChild(new Directory("tmp"));
        this.root.addChild(new Directory("var"));
        this.root.addChild(new Directory("root"));

        this.currentDirectory = this.root;
    }

    /**
     * _initCommands
     * Creates the commands file and references them.
     */
    _initCommands() {
        this.commands = {};

        // create binary files
        this.root.find("bin").addChild(new CommandClear(this));

        // reference commands
        this.commands["clear"] = this.root.find("bin").find("clear");
    }

    /**
     * _processInput
     * Processes a given user input.
     * @param {String} userInput : command the user submitted
     */
    _processInput(userInput) {
        let inputs = userInput.split(" ");
        let commandName = inputs.shift();
        let args = this._processArgs(inputs);
        this._addToHistory(userInput);

        try {
            this.commands[commandName].execute(args.options, args.params);
        } catch (e) {
            if (e instanceof TypeError)
                this._displayBlock("Unknown command");
            else
                console.log(e);
        }
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
     * _displayBlock
     * Creates and displays a new block with the last command and its given value.
     * @param {String} value : last command's result
     */
    _displayBlock(value) {
        this.terminal.addBlock(this.getHeader(), this._getLastCommand(), value);
    }

    /**
     * getHeader
     * Returns a string containing some global informations like the current user, the hostname and 
     * the current path.
     */
    getHeader() {
        return this.user + "@" + this.hostname + " " + this.path;
    }
}

Kernel.DEFAULT_USER = "guillaume.chacun";
Kernel.DEFAULT_HOSTNAME = "JST";
Kernel.DEFAULT_PATH = "~";
Kernel.MAX_HISTORY_LENGTH = 100;
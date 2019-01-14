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

        this._initRoot();
        this._initEvents();
    }
    
    /**
     * _initEvents
     * Initializes the Kernel's event listeners.
     */
    _initEvents() {
        window.addEventListener("submit", event => this._processInput(event.detail));
    }

    _initRoot() {
        this.root = new Directory("");
        this.root.addChild(new Directory("bin"));
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
     * _processInput
     * Processes a given user input.
     * @param {String} userInput : command the user submitted
     */
    _processInput(userInput) {
        // temporary behaviour :
        this.terminal.addBlock(this.getHeader(), userInput, "Unknown command");
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
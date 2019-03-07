/**
 * Kernel
 * Class which represents a basic adapted Linux Kernel. Provides methods to handle user's inputs
 * and perform basics tasks (keeping trace of the user, hostname, current path, etc.).
 */
class Kernel {
    constructor() {
        this.groups = [Kernel.ROOT_USER];
        this.users = [Kernel.ROOT_GROUP];
        
        let rootUser = Kernel.ROOT_USER;
        rootUser.changePassword("", "root");
        
        this.user = rootUser;

        this.history = [];
        this.historySelectedCmdIndex = -1;
        
        this._initRoot();
        this._initHome();
        this._initEvents();
        this._initCommands();
        
        let usersGroup = new Group("users");
        this.createUser("user1", usersGroup);
        this.createUser("user2", usersGroup);
        this.createUser("user3", usersGroup);

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
     * _initHome
     * Initializes the home directory and its children.
     */
    _initHome() {
        this.homeDirectory = this.root.find("home");
        let userDirectory = new Directory(this.getUser().getName(), this.getUser(), this.homeDirectory);
        let story = new File("story.txt", this.getUser());
        story.setRights("700");
        story.content = `Lorem ipsum dolor sit amet, consectetur adipiscing elit.
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

        let store = new File("store.txt", this.getUser());
        store.content = `Liste des magasins : CDF, NE, BE`;
        this.homeDirectory.addChild(store);
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
                let command = this.root.find("bin").find(commandName);
                if (this.getUser().canExecute(command)) {
                    let commandResult = command.execute(args.options, args.params);
                    if (commandResult != undefined)
                        this.displayBlock(  commandResult.getContent(), 
                                            commandResult.getAddBreakline(), 
                                            commandResult.getCustomHeader());
                } else {
                    this.displayBlock("Error : Permission denied");
                }
                
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

        let nbQuotes = 0;
        for (let i=0; i<currentInputValue.length; i++) {
            if (currentInputValue[i] == "\"")
                nbQuotes++;
        }

        if (nbQuotes%2 == 1)
            currentInputValue += "\"";
        
        // input pre processing
        let inputs = this._splitArgs(currentInputValue);
        let args = this._processArgs(inputs);
        
        // retrieve path
        let argIndex = null;
        let argIndexStart = null;
        let argIndexEnd = null;
        let path = null;
        if (args.params.length == 1)
            path = this.preparePath(args.params[0]);
        else {
            // TODO : find specified path
            let elemAtCursorPos = cursorPosition < currentInputValue.length ? currentInputValue[cursorPosition] : "";
            // console.log("user input :\t\t", "'" + currentInputValue + "'", 
            //             "\ncursor position :\t", cursorPosition, 
            //             "\nchar at cursor pos :\t", cursorPosition < currentInputValue.length ? currentInputValue[cursorPosition] : "",
            //             "\nargs :\t", args);

            let searchedArg = "";
            let searchedElem = null;
            argIndexEnd = cursorPosition;

            if (elemAtCursorPos == "\"") {
                searchedElem = "\"";
                searchedArg = "\"";
            } else if (elemAtCursorPos == "'") {
                searchedElem = "'";
                searchedArg = "'";
            } else if (elemAtCursorPos == "") {
                searchedElem = " ";
                searchedArg = "";
            } else
                return;

            // retrieve selected argument
            for (let i=cursorPosition-1; i>=0; i--) {
                searchedArg = currentInputValue[i] + searchedArg;
                if (currentInputValue[i] == searchedElem) {
                    argIndexStart = i+1;
                    if (searchedElem == " ") {
                        searchedArg = searchedArg.slice(1);
                    }
                    break;
                }
            }

            // search and retrieve for selected arguments in arg.params
            for (let i=0; i<args.params.length; i++) {
                if (searchedArg == args.params[i]) {
                    argIndex = i;
                    break;
                }
            }

            if (argIndex == null)
                return;

            path = this.preparePath(args.params[argIndex]);
        }
        
        
        if (path != null) {
            // separate filename from its path
            let pathInfo = Kernel.retrieveElementNameAndPath(path);
            let currentDirectoryPath = pathInfo.dir;
            let currentDirectory = this.findElementFromPath(currentDirectoryPath);
            let searchedElementName = pathInfo.elem;

            // console.log(searchedElementName, currentDirectory);

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

                        // console.log(currentDirectoryPath);
                        
                        let completedPath = currentDirectoryPath + 
                                            (currentDirectoryPath[currentDirectoryPath.length-1] != "/" && currentDirectoryPath.length > 0 ? "/" : "") + 
                                            matchingElements[0].getName() + 
                                            (matchingElements[0] instanceof Directory ? "/" : "");

                        let newInputValue = currentInputValue.split(currentInputValue.slice(argIndexStart, argIndexEnd));
                        newInputValue = newInputValue[0] + completedPath + newInputValue[1];

                        this.terminal.setInputContent(newInputValue);
                        this.terminal.setCursorPosition(argIndexStart + completedPath.length);
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
        } catch {
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

        return newUser;
    }

    /**
     * findUser
     * returns a user by name if exists
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
    
        var chrsz   = 8;
        var hexcase = 0;
    
        function safe_add (x, y) {
            var lsw = (x & 0xFFFF) + (y & 0xFFFF);
            var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
            return (msw << 16) | (lsw & 0xFFFF);
        }
    
        function S (X, n) { return ( X >>> n ) | (X << (32 - n)); }
        function R (X, n) { return ( X >>> n ); }
        function Ch(x, y, z) { return ((x & y) ^ ((~x) & z)); }
        function Maj(x, y, z) { return ((x & y) ^ (x & z) ^ (y & z)); }
        function Sigma0256(x) { return (S(x, 2) ^ S(x, 13) ^ S(x, 22)); }
        function Sigma1256(x) { return (S(x, 6) ^ S(x, 11) ^ S(x, 25)); }
        function Gamma0256(x) { return (S(x, 7) ^ S(x, 18) ^ R(x, 3)); }
        function Gamma1256(x) { return (S(x, 17) ^ S(x, 19) ^ R(x, 10)); }
    
        function core_sha256 (m, l) {
            var K = new Array(0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5, 0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5, 0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3, 0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174, 0xE49B69C1, 0xEFBE4786, 0xFC19DC6, 0x240CA1CC, 0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA, 0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7, 0xC6E00BF3, 0xD5A79147, 0x6CA6351, 0x14292967, 0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13, 0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85, 0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3, 0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070, 0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5, 0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3, 0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208, 0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2);
            var HASH = new Array(0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19);
            var W = new Array(64);
            var a, b, c, d, e, f, g, h, i, j;
            var T1, T2;
    
            m[l >> 5] |= 0x80 << (24 - l % 32);
            m[((l + 64 >> 9) << 4) + 15] = l;
    
            for ( var i = 0; i<m.length; i+=16 ) {
                a = HASH[0];
                b = HASH[1];
                c = HASH[2];
                d = HASH[3];
                e = HASH[4];
                f = HASH[5];
                g = HASH[6];
                h = HASH[7];
    
                for ( var j = 0; j<64; j++) {
                    if (j < 16) W[j] = m[j + i];
                    else W[j] = safe_add(safe_add(safe_add(Gamma1256(W[j - 2]), W[j - 7]), Gamma0256(W[j - 15])), W[j - 16]);
    
                    T1 = safe_add(safe_add(safe_add(safe_add(h, Sigma1256(e)), Ch(e, f, g)), K[j]), W[j]);
                    T2 = safe_add(Sigma0256(a), Maj(a, b, c));
    
                    h = g;
                    g = f;
                    f = e;
                    e = safe_add(d, T1);
                    d = c;
                    c = b;
                    b = a;
                    a = safe_add(T1, T2);
                }
    
                HASH[0] = safe_add(a, HASH[0]);
                HASH[1] = safe_add(b, HASH[1]);
                HASH[2] = safe_add(c, HASH[2]);
                HASH[3] = safe_add(d, HASH[3]);
                HASH[4] = safe_add(e, HASH[4]);
                HASH[5] = safe_add(f, HASH[5]);
                HASH[6] = safe_add(g, HASH[6]);
                HASH[7] = safe_add(h, HASH[7]);
            }
            return HASH;
        }
    
        function str2binb (str) {
            var bin = Array();
            var mask = (1 << chrsz) - 1;
            for(var i = 0; i < str.length * chrsz; i += chrsz) {
                bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (24 - i%32);
            }
            return bin;
        }
    
        function Utf8Encode(string) {
            string = string.replace(/\r\n/g,"\n");
            var utftext = "";
    
            for (var n = 0; n < string.length; n++) {
    
                var c = string.charCodeAt(n);
    
                if (c < 128) {
                    utftext += String.fromCharCode(c);
                }
                else if((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
                else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
    
            }
    
            return utftext;
        }
    
        function binb2hex (binarray) {
            var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
            var str = "";
            for(var i = 0; i < binarray.length * 4; i++) {
                str += hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8+4)) & 0xF) +
                hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8  )) & 0xF);
            }
            return str;
        }
    
        s = Utf8Encode(s);
        return binb2hex(core_sha256(str2binb(s), s.length * chrsz));
    }
}

Kernel.DEFAULT_USER = "guillaume.chacun";
Kernel.DEFAULT_HOSTNAME = "JST";
Kernel.DEFAULT_PATH = "~";
Kernel.MAX_HISTORY_LENGTH = 100;

Kernel.ROOT_GROUP = new Group("root");
Kernel.ROOT_USER = new User("root", Kernel.ROOT_GROUP);
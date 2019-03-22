/**
 *  class CommandEdit
 *  Edits a file's content.
 */
class CommandEdit extends AbstractCommand {
    constructor(kernel) {
        super(kernel, "edit");

        this.maxNumberParams = 1;
        this.minNumberParams = 1;
    }
    
    /**
     * execute
     * Executes the command with given options and parameters.
     * @param {Array} options : command's option(s)
     * @param {Array} params : command's parameter(s)
     */
    execute(options=[], params=[], openEditor=true) { 
        // handle invalid options / parameters
        if (this._verifyExecuteArgs(options, params)) {
            
            // handle options
            for (let i=0; i<options.length; i++) {
                switch(options[i]) {
                    case "?":
                        return new CommandResult(true, this.help());
                    default: // invalid option
                        return new CommandResult(false, this._getErrorOptions(options[i]));
                }
            }

            // handle parameters
            let filename = this.kernel.preparePath(params[0]);            

            // separate filename from its path
            let pathInfo = Kernel.retrieveElementNameAndPath(filename);
            let parentDirectory = this.kernel.findElementFromPath(pathInfo.dir);
            filename = pathInfo.elem;

            // handle invalid filename
            if (AbstractFile.containsSpecialCharacters(filename)) // invalid special characters in filename
                return new CommandResult(false, this._getErrorSpecialChar());

            // file edition
            let file = parentDirectory.find(filename);            
            if(file != null) { // if the file already exists
                if (file instanceof File) {// open terminal on this file
                    if (!this.kernel.getUser().canWrite(file)) {
                        return new CommandResult(false, "Error : Permission denied");
                    }
                    if (openEditor)
                        this.kernel.openEditor(file, parentDirectory, false);
                } else {
                    return new CommandResult(false, filename + ": Not a file");
                }
            } else { // open terminal on a new file and give the parent
                if (!this.kernel.getUser().canWrite(file)) {
                    return new CommandResult(false, "Error : Permission denied");
                }
                if (openEditor)
                    this.kernel.openEditor(new File(filename), parentDirectory, true);
            }
            return new CommandResult();
        }
    }

    /**
     * executeForKernelRestoration
     * Execute command for kernel restoration.
     * @param {Object} hiddenHistory : kernel's hidden history
     * @param {Array} options : command's option(s)
     * @param {Array} params : command's parameters
     */
    executeForKernelRestoration(options=[], params=[], hiddenHistory=null) {
        if (this.execute(options, params, false).isSuccessful()) {
            let hiddenState = hiddenHistory.shift();
            if (hiddenState.commandSuccess) {
                try {
                    let res = this.kernel.getRootDirectory().find("bin").find("touch").execute([], [hiddenState.path]);
                    this.kernel.findElementFromPath(hiddenState.path).setContent(hiddenState.content);
                } catch(e) {console.log(e);}
            }
            hiddenHistory.push(hiddenState);
        }

        return hiddenHistory;
    }

    /**
     * help
     * Returns the command's help.
     */
    help() {
        return "Edit a file's content<br/>usage: edit file";
    }
}
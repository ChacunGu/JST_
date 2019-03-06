/**
 *  class CommandTouch
 *  Create new file.
 */
class CommandTouch extends AbstractCommand {
    constructor(kernel) {
        super(kernel, "touch");

        this.maxNumberParams = 1;
        this.minNumberParams = 1;
    }
    
    /**
     * execute
     * Executes the command with given options and parameters.
     * @param {Array} options : command's option(s)
     * @param {Array} params : command's parameter(s)
     */
    execute(options=[], params=[]) {
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

            // file creation / update
            let file = parentDirectory.find(filename);            
            if(file != null) { // if the file already exists
                if (file instanceof File) { // update existing file
                    if (this.kernel.getUser().canWrite(file)) {
                        file.update();
                    } else {
                        return new CommandResult(false, filename + " : Do not have rights to write");    
                    }
                }
                else
                    return new CommandResult(false, filename + ": Not a file");
            } else {
                if (this.kernel.getUser().canWrite(parentDirectory)) {
                    parentDirectory.addChild(new File(filename, this.kernel.getUser())); // create new file
                } else {
                    return new CommandResult(false, "Error : Permission denied");    
                }
            }
            return new CommandResult();
        }
    }

    /**
     * help
     * Returns the command's help.
     */
    help() {
        return "Create a new file or modify the modification date of an existing file<br/>usage: touch file";
    }
}
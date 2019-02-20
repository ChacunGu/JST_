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
                        this.kernel.displayBlock(this.help());
                        return
                    default: // invalid option
                        this.kernel.displayBlock(this._getErrorOptions(options[i]));
                        return;
                }
            }

            // handle parameters
            let filename = this.kernel.preparePath(params[0]);            

            // separate filename from its path
            let lastSlashIndex = filename.lastIndexOf("/");
            let parentDirectoryPath = filename.slice(0, lastSlashIndex >= 0 ? lastSlashIndex : 0);
            let parentDirectory = this.kernel.findElementFromPath(parentDirectoryPath);
            filename = filename.slice(filename.lastIndexOf("/")+1, filename.length);

            // handle invalid filename
            if (AbstractFile.containsSpecialCharacters(filename)) { // invalid special characters in filename
                this.kernel.displayBlock(this._getErrorSpecialChar());
                return;
            }

            // file creation / update
            let file = parentDirectory.find(filename);            
            if(file != null) { // if the file already exists
                if (file instanceof File) // update existing file
                    file.update();
                else {
                    this.kernel.displayBlock(filename + ": Not a file");
                    return;
                }
            } else
                parentDirectory.addChild(new File(filename)); // create new file
            this.kernel.displayBlock("");
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
/**
 *  class CommandTouch
 *  show the path of th current directory
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
            let filename = params[0];
            
            // remove possible quote marks
            filename = this.kernel.removePossibleInputQuotes(filename);
            
            // get new file's parent directory
            let directory = null;
            if (filename.includes("/")) { // specified path 
                let directoryPath = filename.slice(0, filename.lastIndexOf("/"));
                directory = this.kernel.findDirectoryFromPath(directoryPath);
                filename = filename.slice(filename.lastIndexOf("/")+1, filename.length);

                if (directory != null) {
                    if (!directory instanceof Directory) {
                        this.kernel.displayBlock(directoryPath + ": Not a directory.");
                        return;
                    }
                } else {
                    this.kernel.displayBlock(directoryPath + ": No such file or directory.");
                    return;
                }
            } else // implicit path
                directory = this.kernel.getCurrentDirectory();
            
            // handle invalid filename
            if (AbstractFile.containsSpecialCharacters(filename)) { // invalid special characters in filename
                this.kernel.displayBlock(this._getErrorSpecialChar());
                return;
            }

            // file creation / update
            let file = directory.find(filename);
            if(file != null) { // if the file already exists
                if (file instanceof File)
                    file.update();
                else {
                    this.kernel.displayBlock(paramDir + ": Not a File");
                    return;
                }
            } else
                directory.addChild(new File(filename));
            this.kernel.displayBlock("");
        }
    }

    /**
     * help
     * Returns the command's help.
     */
    help() {
        return "Create a new file in the current repository or modify the modification date of an existing file<br/>usage: touch [fileName]";
    }
}
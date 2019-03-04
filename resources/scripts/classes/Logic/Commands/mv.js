/**
 *  class CommandMV
 *  show the path of th current directory
 */
class CommandMV extends AbstractCommand {
    constructor(kernel) {
        super(kernel, "mv");
        
        this.maxNumberParams = 2;
        this.minNumberParams = 2;
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
            let filenameSrc = this.kernel.preparePath(params[0]);
            let filenameDst = this.kernel.preparePath(params[1]);

            // find source element
            let elementSrc = this.kernel.findElementFromPath(filenameSrc, false);
            let elementDst = this.kernel.findElementFromPath(filenameDst, false);

            // find destinations filename and parent directory
            let pathInfo = Kernel.retrieveElementNameAndPath(filenameDst);
            let parentDirectoryDst = this.kernel.findElementFromPath(pathInfo.dir);
            filenameDst = pathInfo.elem;

            // handle invalid filename
            if (AbstractFile.containsSpecialCharacters(filenameDst)) // invalid special characters in filename
                return new CommandResult(false, this._getErrorSpecialChar());

            // move element src to dst
            if (elementSrc != null) { // if source element has been found
                if (parentDirectoryDst != null) { // if destination directory has been found
                    if (elementDst == null) { // if destination element does not already exist
                        if (parentDirectoryDst instanceof Directory) { // destination must be a directory
                            elementSrc.getParent().remove(elementSrc.getName()); // remove element from current directory
                            parentDirectoryDst.addChild(elementSrc); // add element to destination directory
                            elementSrc.rename(filenameDst); // rename element to its new name
                        } else
                            return new CommandResult(false, filenameDst + ": Not a directory");
                    } else
                        return new CommandResult(false, filenameDst + ": Already exists");
                } else
                    return new CommandResult(false, "Can't move '" + filenameSrc + "' to '" + filenameDst + "': No such file or directory");
            } else
                return new CommandResult(false, "Can't move '" + filenameSrc + "': No such file or directory");
            return new CommandResult();
        }
    }

    /**
     * help
     * Returns the command's help.
     */
    help() {
        return "Moves a file to another location, and can rename it<br/>usage: mv source destination";
    }
}
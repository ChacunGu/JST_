/**
 *  class CommandCP
 *  Copies files and directories.
 */
class CommandCP extends AbstractCommand {
    constructor(kernel) {
        super(kernel, "cp");

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
            
            let optLinkFiles = false;   // -l
            let optRecursive = false;   // -R

            // handle options
            for (let i=0; i<options.length; i++) {
                switch(options[i]) {
                    case "l":
                        optLinkFiles = true;
                        break;
                    case "R":
                        optRecursive = true;
                        break;
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

            // find destinations filename and parent directory
            let pathInfo = Kernel.retrieveElementNameAndPath(filenameDst);
            let parentDirectoryDst = this.kernel.findElementFromPath(pathInfo.dir);
            filenameDst = pathInfo.elem;

            // handle invalid filename
            if (AbstractFile.containsSpecialCharacters(filenameDst)) // invalid special characters in filename
                return new CommandResult(false, this._getErrorSpecialChar());

            // element's copy
            if (elementSrc instanceof Directory && !optRecursive && !optLinkFiles) // can't copy directories without recursive option
                return new CommandResult(false, filenameSrc + ": Omitting directory");

            if (elementSrc != null) { // if source element has been found
                if (parentDirectoryDst != null) { // if destination directory has been found
                    if (parentDirectoryDst instanceof Directory) {
                        if (
                            !this.kernel.getUser().canWrite(parentDirectoryDst) ||
                            !this.kernel.getUser().canWrite(elementSrc)
                        ) {
                            return new CommandResult(true, "Error : Permission denied");
                        }
                        elementSrc.copy(filenameDst, parentDirectoryDst, optLinkFiles);
                    } else {
                        return new CommandResult(false, filenameDst + ": Not a directory");
                    }
                } else {
                    return new CommandResult(false, filenameDst + ": No such file or directory.");
                }
            } else
                return new CommandResult(false, filenameSrc + ": No such file or directory.");
            return new CommandResult(); 
        }
    }

    /**
     * help
     * Returns the command's help.
     */
    help() {
        return "Copies files and directories<br/>usage: cp [-l][-R] source destination";
    }
}
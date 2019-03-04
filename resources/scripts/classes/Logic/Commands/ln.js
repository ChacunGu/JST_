/**
 *  class CommandLN
 *  Create a new symbolic file.
 */
class CommandLN extends AbstractCommand {
    constructor(kernel) {
        super(kernel, "ln");

        this.maxNumberOptions = 0;
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

            // find destinations filename and parent directory
            let pathInfo = Kernel.retrieveElementNameAndPath(filenameDst);
            let parentDirectoryDst = this.kernel.findElementFromPath(pathInfo.dir);
            filenameDst = pathInfo.elem;

            // handle invalid filename
            if (AbstractFile.containsSpecialCharacters(filenameDst)) // invalid special characters in filename
                return new CommandResult(false, this._getErrorSpecialChar());

            // create link
            if (elementSrc != null) { // if source element has been found
                if (parentDirectoryDst != null) { // if destination directory has been found
                    parentDirectoryDst.addChild(this.kernel.createSymbolicLink(filenameDst, elementSrc));
                } else
                    return new CommandResult(false, parentDirectoryPathDst + ": No such file or directory.");
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
        return "Create a new symbolic file<br/>usage: ln target link_name";
    }
}
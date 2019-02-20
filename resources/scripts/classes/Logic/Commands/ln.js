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
                        this.kernel.displayBlock(this.help());
                        return
                    default: // invalid option
                        this.kernel.displayBlock(this._getErrorOptions(options[i]));
                        return;
                }
            }

            // handle parameters
            let filenameSrc = this.kernel.preparePath(params[0]);
            let filenameDst = this.kernel.preparePath(params[1]);

            // find source element
            let elementSrc = this.kernel.findElementFromPath(filenameSrc, false);

            // find destinations filename and parent directory
            let lastSlashIndexDst = filenameDst.lastIndexOf("/");
            let parentDirectoryPathDst = filenameDst.slice(0, lastSlashIndexDst >= 0 ? lastSlashIndexDst : 0);
            let parentDirectoryDst = this.kernel.findElementFromPath(parentDirectoryPathDst);
            filenameDst = filenameDst.slice(filenameDst.lastIndexOf("/")+1, filenameDst.length);

            // handle invalid filename
            if (AbstractFile.containsSpecialCharacters(filenameDst)) { // invalid special characters in filename
                this.kernel.displayBlock(this._getErrorSpecialChar());
                return;
            }

            // create link
            if (elementSrc != null) { // if source element has been found
                if (parentDirectoryDst != null) { // if destination directory has been found
                    parentDirectoryDst.addChild(new SymbolicLink(filenameDst, elementSrc));
                } else {
                    this.kernel.displayBlock(parentDirectoryPathDst + ": No such file or directory.");
                    return;
                }
            } else {
                this.kernel.displayBlock(filenameSrc + ": No such file or directory.");
                return;
            }
            this.kernel.displayBlock("");
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
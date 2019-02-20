/**
 *  class CommandRMDIR
 *  Represents command rmdir. Removes a directory.
 */
class CommandRMDIR extends AbstractCommand {
    constructor(kernel) {
        super(kernel, "rmdir");

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
                        return;
                    default: // invalid option
                        this.kernel.displayBlock(this._getErrorOptions(options[i]));
                        return;
                }
            }

            // handle parameters
            let paramDir = this.kernel.preparePath(params[0]);
            let path = this.kernel.findElementFromPath(paramDir);

            // remove directory
            if (path instanceof Directory)
                path.parent.remove(path.getName());
            else if (path instanceof AbstractFile) {
                this.kernel.displayBlock("rmdir: " + paramDir + ": Not a directory");
                return;
            } else {
                this.kernel.displayBlock("rmdir: " + paramDir + ": No such file or directory");
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
        return "Remove the given directory<br/>usage: rmdir [-r][-f] filename";
    }
}
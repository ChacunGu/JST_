/**
 *  class CommandRM
 *  Represents command rm. Removes a file.
 */
class CommandRM extends AbstractCommand {
    constructor(kernel) {
        super(kernel, "rm");

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
            
            let optRecursive = false;

            // handle options
            for (let i=0; i<options.length; i++) {
                switch(options[i]) {
                    case "r":
                        optRecursive = true;
                        break;
                    case "?":
                        this.kernel.displayBlock(this.help());
                        return;
                    default: // invalid option
                        this.kernel.displayBlock(this._getErrorOptions(options[i]));
                        return;
                }
            }

            // handle params
            let paramDir = this.kernel.preparePath(params[0]);
            let path = this.kernel.findElementFromPath(paramDir);

            // remove file
            if (path instanceof Directory) {
                if (optRecursive)
                    path.parent.remove(path.getName());
                else {
                    this.kernel.displayBlock("rm: " + paramDir + " is a directory");
                    return;
                }
            } else if (path instanceof File)
                path.parent.remove(path.getName());
            else {
                this.kernel.displayBlock("rm: cannot remove " + paramDir + ": No such file or directory");
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
        return "Remove the given file<br/>usage: rm [-r] filename";
    }
}
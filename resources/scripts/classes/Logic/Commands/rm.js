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
                        return new CommandResult(true, this.help());
                    default: // invalid option
                        return new CommandResult(false, this._getErrorOptions(options[i]));
                }
            }

            // handle params
            let paramDir = this.kernel.preparePath(params[0]);
            let path = this.kernel.findElementFromPath(paramDir);
            if (path != null) {
                if (!this.kernel.getUser().canWrite(path)) {
                    return new CommandResult(false, "Error : Permission denied");
                }
            }

            // remove file
            if (path instanceof Directory) {
                if (optRecursive)
                    path.parent.remove(path.getName());
                else
                    return new CommandResult(false, "rm: " + paramDir + " is a directory");
            } else if (path instanceof File)
                path.parent.remove(path.getName());
            else
                return new CommandResult(false, "rm: cannot remove " + paramDir + ": No such file or directory");
            return new CommandResult();
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
/**
 *  class CommandRM
 *  show the path of th current directory
 */
class CommandRM extends AbstractCommand {
    constructor(kernel) {
        super(kernel, "rm");

        this.maxNumberOptions = 2;
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
            
            let recursive = false;
            let force = false;

            // handle options
            for (let i=0; i<options.length; i++) {
                switch(options[i]) {
                    case "r":
                        recursive = true;
                        break;
                    case "f":
                        force = true;
                        break;
                    case "?":
                        this.kernel.displayBlock(this.help());
                        return;
                    default: // invalid option
                        this.kernel.displayBlock(this._getErrorOptions(options[i]));
                        return;
                }
            }

            let paramDir = params[0];
            paramDir = this.kernel.removePossibleInputQuotes(paramDir);
            let path = this.kernel.findElementFromPath(paramDir);

            if (path instanceof Directory) {
                if (path.children.length == 0 && force) {
                    // can remove empty directory
                    path.parent.remove(path.getName());
                } else {
                    if (recursive && force) {
                        // remove directory and its content
                        path.parent.remove(path.getName());
                    } else {
                        this.kernel.displayBlock("Can not remove an non-empty directory");
                        return;
                    }
                }
            } else if (path instanceof File) {
                path.parent.remove(path.getName());
            } else {
                this.kernel.displayBlock("Error :" + paramDir + " do not exist");
            }
        }
    }

    /**
     * help
     * Returns the command's help.
     */
    help() {
        return "Remove the given file<br/>usage: rm filename";
    }
}
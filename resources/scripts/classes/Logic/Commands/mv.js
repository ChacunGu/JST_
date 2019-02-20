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
                        this.kernel.displayBlock(this.help());
                        return;
                    default: // invalid option
                        this.kernel.displayBlock(this._getErrorOptions(options[i]));
                        return;
                }
            }

            // TODO implement move

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
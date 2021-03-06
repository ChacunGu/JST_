/**
 *  class CommandDate
 *  show the path of th current directory
 */
class CommandDate extends AbstractCommand {
    constructor(kernel) {
        super(kernel, "date");
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

            return new CommandResult(true, new Date() + "");
        }
    }

    /**
     * help
     * Returns the command's help.
     */
    help() {
        return "Show the current date time<br/>usage: date";
    }
}
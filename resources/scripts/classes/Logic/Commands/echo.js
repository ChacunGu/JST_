/**
 * Class CommandEcho
 * Represents command echo. Displays a line of text.
 */
class CommandEcho extends AbstractCommand {
    constructor(kernel) {
        super(kernel, "echo");

        this.maxNumberParams = -1; // undefined maximum
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

            let paramText = "";

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
            for (let i=0; i<params.length; i++)
                paramText += params[i] + (i<params.length-1 ? " " : "");

            // remove possible quote marks
            paramText = Kernel.removePossibleInputQuotes(paramText);

            // execute command
            return new CommandResult(true, paramText);
        }
    }

    /**
     * help
     * Returns the command's help.
     */
    help() {
        return "Displays given line of text.<br/>usage: echo string(s)";
    }
}
/**
 * Class CommandClear
 * Represents command clear. Clears terminal.
 */
class CommandClear extends AbstractCommand {
    constructor(kernel) {
        super(kernel, "clear");

        this.maxNumberOptions = 1; // minimum 1 for '-?'
        this.maxNumberParams = 0;
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

            // execute command
            this.kernel.terminal.clear();
        }
    }

    /**
     * help
     * Returns the command's help.
     */
    help() {
        return "Clears screen.";
    }
}
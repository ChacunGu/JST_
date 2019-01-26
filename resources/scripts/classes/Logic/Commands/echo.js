/**
 * Class CommandEcho
 * Represents command echo. Displays a line of text.
 */
class CommandEcho extends AbstractCommand {
    constructor(kernel) {
        super(kernel, "echo");

        this.maxNumberOptions = 1; // at least 1 for '-?'
        this.minNumberOptions = 0;
        this.maxNumberParams = -1; // undefined maximum
        this.minNumberParams = 0;
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
                        this.kernel.displayBlock(this.help());
                        return
                    default: // invalid option
                        this.kernel.displayBlock(this._getErrorOptions(options[i]));
                        return;
                }
            }

            // handle parameters
            for (let i=0; i<params.length; i++)
                paramText += params[i] + " ";

            // remove possible quote marks
            if (paramText[0] == "\"" && paramText[paramText.length-2] == "\"")
                paramText = paramText.slice(1, paramText.length-2);

            // execute command
            this.kernel.displayBlock(paramText);
        }
    }

    /**
     * help
     * Returns the command's help.
     */
    help() {
        return "Displays given line of text.<br/>usage: echo [string(s)]";
    }
}
/**
 * Class CommandMan
 * Represents command man. Displays given command help.
 */
class CommandMan extends AbstractCommand {
    constructor(kernel) {
        super(kernel, "man");

        this.maxNumberOptions = 1; // at least 1 for '-?'
        this.minNumberOptions = 0;
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

            let paramCommandName = "";

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
                paramCommandName = params[i];

            // find the command
            let commandFile = this.kernel.getRootDirectory().find("bin").find(paramCommandName);
            
            // execute command
            if (commandFile != null)
                commandFile.execute(["?"], []);
            else
                this.kernel.displayBlock(paramCommandName + ": Not a command");
        }
    }

    /**
     * help
     * Returns the command's help.
     */
    help() {
        return "Displays given command help.<br/>usage: man [command name]";
    }
}
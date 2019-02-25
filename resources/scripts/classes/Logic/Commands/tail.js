/**
 *  class CommandTail
 *  display the 5 last lines of a TextFile to the console
 */
class CommandTail extends AbstractCommand {
    constructor(kernel) {
        super(kernel, "tail");

        this.maxNumberParams = 2;
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
                        return new CommandResult(true, this.help());
                    default: // invalid option
                        return new CommandResult(false, this._getErrorOptions(options[i]));
                }
            }

            let source = params[0];
            source = this.kernel.preparePath(source);
            source = this.kernel.findElementFromPath(source);

            if (source instanceof File) {
                let n = 5;
                if (params.length == 2) {
                    n = Number(params[1])
                }
                if (!Number.isInteger(n)) {
                    return new CommandResult(false, "Error : n is not an integer");
                }
                let text = source.content.split("\n").splice(-n).join("<br>");

                return new CommandResult(true, text);

            } else {
                return new CommandResult(false, "Error : Not a Text File");
            }
        }
    }

    /**
     * help
     * Returns the command's help.
     */
    help() {
        return "Display the 5 or n last lines of a text file<br/>usage: tail filePath [n]";
    }
}
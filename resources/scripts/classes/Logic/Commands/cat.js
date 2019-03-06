/**
 *  class CommandCat
 *  show the content text of a File to the console
 */
class CommandCat extends AbstractCommand {
    constructor(kernel) {
        super(kernel, "cat");

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

                let text = source.content.split("\n").join("<br>");

                if (this.kernel.getUser().canRead(source)) {
                    return new CommandResult(true, text);
                } else {
                    return new CommandResult(false, "Error : Permission denied")
                }

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
        return "Display the content of a File to the Console<br/>usage: cat filePath";
    }
}
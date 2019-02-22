/**
 * Class CommandCD
 * Represents command cd. Changes current directory.
 */
class CommandCD extends AbstractCommand {
    constructor(kernel) {
        super(kernel, "cd");
        
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

            let paramDir = null;        // dir

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
            paramDir = this.kernel.preparePath(params[0]);

            // execute command
            let directory = this.kernel.findElementFromPath(paramDir);

            if (directory != null) {
                if (directory instanceof Directory) {
                    let commandResult = new CommandResult(true, "", true, this.kernel.getHeader());
                    this.kernel.setCurrentDirectory(directory);
                    return commandResult;
                } else
                    return new CommandResult(false, paramDir + ": Not a directory.");
            } else
                return new CommandResult(false, paramDir + ": No such file or directory.");
        }
    }

    /**
     * help
     * Returns the command's help.
     */
    help() {
        return "Changes current directory.<br/>usage: cd dir";
    }
}
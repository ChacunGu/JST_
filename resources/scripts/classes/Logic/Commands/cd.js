/**
 * Class CommandCD
 * Represents command cd. Changes current directory.
 */
class CommandCD extends AbstractCommand {
    constructor(kernel) {
        super(kernel, "cd");

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

            let paramDir = null;        // dir

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
                paramDir = params[i];

            // execute command
            let directory = this.kernel.findDirectoryFromPath(paramDir);

            if (directory != null) {
                if (directory instanceof Directory) {
                    this.kernel.displayBlock("");
                    this.kernel.setCurrentDirectory(directory);
                } else {
                    this.kernel.displayBlock(paramDir + ": Not a directory.");
                    return;
                }
            } else {
                this.kernel.displayBlock(paramDir + ": No such file or directory.");
                return;
            }
        }
    }

    /**
     * help
     * Returns the command's help.
     */
    help() {
        return "Changes current directory.<br/>usage: cd [dir]";
    }
}
/**
 * Class CommandLS
 * Represents command ls. Lists files, directories and more informations if specified in options.
 */
class CommandLS extends AbstractCommand {
    constructor(kernel) {
        super(kernel, "ls");

        this.maxNumberOptions = 2; // at least 1 for '-?'
        this.minNumberOptions = 0;
        this.maxNumberParams = 1;
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

            let optVerbose = false;     // -l
            let optHiddenFiles = false; // -a
            let paramDir = null;        // dir

            // handle options
            for (let i=0; i<options.length; i++) {
                switch(options[i]) {
                    case "l":
                        optHiddenFiles = true;
                        break;
                    case "a":
                        optVerbose = true;
                        break;
                    case "?":
                        this.kernel.displayBlock(this.help());
                        return
                    default: // invalid option
                        this.kernel.displayBlock(this._getErrorOptions(options[i]));
                        return;
                }
            }

            // handle parameters
            for (let i=0; i<params.length; i++) {
                // TODO : verify parameter's validity (in this case if it is a valid directory file)
            }

            // execute command
            // TODO : execute the command with given options and parameters
        }
    }

    /**
     * help
     * Returns the command's help.
     */
    help() {
        return "Lists files, directories and more informations if specified in options.<br/>usage: ls [-l][-a][dir]";
    }
}
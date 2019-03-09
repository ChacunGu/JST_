/**
 *  class CommandSU
 *  Switches user to root.
 */
class CommandSU extends AbstractCommand {
    constructor(kernel) {
        super(kernel, "su");
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

            return new CommandResult(true, "", false, "", true);
        }
    }

    /**
     * executeFollowUp
     * Handles user response to first command result.
     * 
     * @param {String} input : user's response (password for root)
     */
    executeFollowUp(input) {
        let root = Kernel.ROOT_USER;
        if (root.getPassword() == Kernel.SHA256(input)) {
            this.kernel.setUser(root);
            return new CommandResult(true);
        }
        return new CommandResult(false, "Wrong password");
    }

    /**
     * help
     * Returns the command's help.
     */
    help() {
        return "Become root<br/>usage: su";
    }
}
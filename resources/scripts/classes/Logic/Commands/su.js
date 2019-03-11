/**
 *  class CommandSU
 *  Switch user or become root.
 */
class CommandSU extends AbstractCommand {
    constructor(kernel) {
        super(kernel, "su");
        this.lastUser = null;
        this.commandStepId = 0;

        this.maxNumberParams = 1;
    }
    
    /**
     * execute
     * Executes the command with given options and parameters.
     * @param {Array} options : command's option(s)
     * @param {Array} params : command's parameter(s)
     */
    execute(options=[], params=[]) { 
        this.commandStepId = 0;

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

            // handle parameters
            let username = "";
            if (params.length > 0) { // 1 parameter: seach for existing user
                username = params[0];
                this.lastUser = this.kernel.findUser(username);
            } else // 0 parameter: switch to root
                this.lastUser = Kernel.ROOT_USER;

            if (this.lastUser == null) // proceed only if user exists
                return new CommandResult(false, "No entry for user '" + username + "'");
            
            return new CommandResult(true, "Password for " + this.lastUser.getName() + ":", false, "", true);
        }
    }

    /**
     * executeFollowUp
     * Handles user response to first command result.
     * 
     * @param {String} input : user's response (password for root)
     */
    executeFollowUp(input) {
        this.commandStepId++;
        if (this.lastUser.getPassword() == Kernel.SHA256(input)) { // if passwords match
            this.kernel.setUser(this.lastUser); // switch user
            this.commandStepId = 0;
            return new CommandResult(true);
        }
        this.commandStepId = 0;
        return new CommandResult(false, "Authentication failure");
    }

    /**
     * help
     * Returns the command's help.
     */
    help() {
        return "Switch user or become root<br/>usage: su [username]";
    }
}
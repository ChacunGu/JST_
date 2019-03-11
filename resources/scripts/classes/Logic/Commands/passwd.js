/**
 *  class CommandPassWD
 *  Changes user's password.
 */
class CommandPassWD extends AbstractCommand {
    constructor(kernel) {
        super(kernel, "passwd");
        this.lastUser = null;
        this.userOldPassword = null;
        this.userNewPassword = null;
        this.commandStepId = 0;

        this.maxNumberParams = 1;
    }

    /**
     * _resetState
     * Resets command's internal state variables.
     */
    _resetState() {
        this.commandStepId = 0;
        this.userOldPassword = null;
        this.userNewPassword = null;
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
            if (params.length > 0) { // change password of specified user
                username = params[0];
                this.lastUser = this.kernel.findUser(username);
            } else // change password of current user
                this.lastUser = this.kernel.getUser();

            if (this.lastUser == null) // proceed only if user exists
                return new CommandResult(false, "No entry for user '" + username + "'");
            
            return new CommandResult(true, "Current password for " + this.lastUser.getName() + ":", false, "", true);
        }
    }

    /**
     * executeFollowUp
     * Handles user response to first command result.
     * 
     * @param {String} input : user's response
     */
    executeFollowUp(input) {
        this.commandStepId++;
        switch (this.commandStepId) {
            case 1: // current user's password
                if (this.lastUser.getPassword() == Kernel.SHA256(input)) { // if passwords match (current and input)
                    this.userOldPassword = Kernel.SHA256(input);
                    return new CommandResult(true, "New password for " + this.lastUser.getName() + ":", false, "", true);
                }
                this._resetState();
                return new CommandResult(false, "Authentication failure");

            case 2: // new user's password: entry n°1
                this.userNewPassword = Kernel.SHA256(input);
                return new CommandResult(true, "New password for " + this.lastUser.getName() + " (confirmation):", false, "", true);
            
            case 3: // new user's password: entry n°2 - confirmation
                if (this.userNewPassword == Kernel.SHA256(input)) { // if passwords match (new and validation)
                    this.kernel.changePasswordSHA(this.lastUser, this.userOldPassword, this.userNewPassword);
                    this._resetState();
                    return new CommandResult(true, "Password changed for " + this.lastUser.getName());
                }
                this._resetState();
                return new CommandResult(false, "Passwords doesn't match");
        }
    }

    /**
     * help
     * Returns the command's help.
     */
    help() {
        return "Change specified or current user's password<br/>usage: passwd [username]";
    }
}
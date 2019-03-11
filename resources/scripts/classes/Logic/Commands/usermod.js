/**
 *  class CommandUsermod
 *  add a user to a group
 */
class CommandUsermod extends AbstractCommand {
    constructor(kernel) {
        super(kernel, "usermod");

        this.maxNumberParams = 2;
        this.minNumberParams = 2;
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

            if (this.kernel.getUser().isRoot()) {
                let groupName = params[0];
                let group = this.kernel.findGroup(groupName);
                if (group == null) {
                    return new CommandResult(false, "Error : Group do not exist");
                }
                let userName = params[1];
                let user = this.kernel.findUser(userName);
                if (user == null) {
                    return new CommandResult(false, "Error : User do not exist");
                }

                this.kernel.addUserToGroup(user, group);

                return new CommandResult();

            } else {
                return new CommandResult(false, "Error : Permission denied. Need to be root");
            }
        }
    }

    /**
     * help
     * Returns the command's help.
     */
    help() {
        return "Adds a user to a group<br/>usage: usermod groupName userName";
    }
}
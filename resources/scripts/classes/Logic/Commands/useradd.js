/**
 *  class CommandUseradd
 *  create a new user
 */
class CommandUseradd extends AbstractCommand {
    constructor(kernel) {
        super(kernel, "useradd");

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

            if (this.kernel.getUser().isRoot()) {
                let userName = params[0];
                if (userName.includes(" ") || userName.includes("\"") || userName.includes("'")) {
                    return new CommandResult(false, "Error : Name includes illegal character");
                }
                if (this.kernel.findUser(userName)) {
                    return new CommandResult(false, "Error : User already exist");
                }
                
                this.kernel.createUser(userName);
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
        return "Create a new user<br/>usage: useradd username";
    }
}
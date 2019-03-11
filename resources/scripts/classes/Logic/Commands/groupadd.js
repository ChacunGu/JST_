/**
 *  class CommandGroupadd
 *  create a new group
 */
class CommandGroupadd extends AbstractCommand {
    constructor(kernel) {
        super(kernel, "groupadd");

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
                let groupName = params[0];
                if (this.kernel.findGroup(groupName)) {
                    return new CommandResult(false, "Error : Group already exist");
                }
                
                this.kernel.createGroup(groupName);
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
        return "Create a new group<br/>usage: groupadd groupName";
    }
}
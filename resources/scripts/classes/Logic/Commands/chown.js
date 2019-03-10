/**
 *  class CommandChown
 *  change the owner of the file
 */
class CommandChown extends AbstractCommand {
    constructor(kernel) {
        super(kernel, "chown");

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

            let file = params[0];
            file = this.kernel.preparePath(file);
            file = this.kernel.findElementFromPath(file);
            
            let user = params[1];
            user = this.kernel.findUser(user);

            if (file == null) {
                return new CommandResult(false, "Error : file do not exist");
            }
            if (user == null) {
                return new CommandResult(false, "Error : user do not exist");
            }

            if(this.kernel.getUser().canWrite(file)) {
                file.setOwner(user);
                return new CommandResult();
            } else {
                return new CommandResult(false, "Error : Permission denied");
            }
        }
    }

    /**
     * help
     * Returns the command's help.
     */
    help() {
        return "Changes the owner of a file<br/>usage: chown filePath newOwner";
    }
}
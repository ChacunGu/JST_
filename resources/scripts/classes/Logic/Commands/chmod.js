/**
 *  class CommandChmod
 *  Change the permission of a file
 */
class CommandChmod extends AbstractCommand {
    constructor(kernel) {
        super(kernel, "chmod");

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

            // handle parameters
            let octal = params[0];
            let path = this.kernel.preparePath(params[1]);            

            for (let i = 0 ; i < octal.length ; i++){
                if(
                    Number(octal[i]) < 0 || 
                    Number(octal[i]) > 7 || 
                    isNaN(Number(octal[i])) ||
                    octal.length != 3
                ) {
                    return new CommandResult(false, "Error : Param " + octal + " incorrect");
                }
            }

            let file = this.kernel.findElementFromPath(path);

            if (file instanceof AbstractFile) {
                if (this.kernel.getUser().canWrite(file)) {
                    file.setRights(octal);
                } else {
                    return new CommandResult(false, "Error : Permission denied");
                }
            }
            return new CommandResult();
        }
    }

    /**
     * help
     * Returns the command's help.
     */
    help() {
        return "Change the permissions of a file<br/>usage: chmod octal filePath";
    }
}
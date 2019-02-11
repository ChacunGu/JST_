/**
 *  class CommandTouch
 *  show the path of th current directory
 */
class CommandTouch extends AbstractCommand {
    constructor(kernel) {
        super(kernel, "touch");

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
                        this.kernel.displayBlock(this.help());
                        return
                    default: // invalid option
                        this.kernel.displayBlock(this._getErrorOptions(options[i]));
                        return;
                }
            }

            // handle params
            let fileName = params[0];
            let file = this.kernel.getCurrentDirectory().find(fileName);
            if(file != null) { // if the file already exists
                if (file instanceof File) {
                    file.update();
                } else {
                    this.kernel.displayBlock("Not a File");
                    return;
                }
            } else {
                this.kernel.getCurrentDirectory().addChild(new File(fileName));
            }
        }
    }

    /**
     * help
     * Returns the command's help.
     */
    help() {
        return "Create a new file in the current repository or modify the modification date of an existing file<br/>usage: touch [fileName]";
    }
}
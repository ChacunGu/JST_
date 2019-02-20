/**
 *  class CommandMV
 *  show the path of th current directory
 */
class CommandMV extends AbstractCommand {
    constructor(kernel) {
        super(kernel, "mv");
        
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
                        this.kernel.displayBlock(this.help());
                        return;
                    default: // invalid option
                        this.kernel.displayBlock(this._getErrorOptions(options[i]));
                        return;
                }
            }
            
            let source = params[0];
            source = this.kernel.preparePath(source);
            let sourceList = source.split("/");
            let sourceName = sourceList[sourceList.length-1];
            
            let destination = params[1];
            destination = this.kernel.preparePath(destination);
            let destinationList = destination.split("/");
            let destinationName = destinationList[destinationList.length-1];
            destinationList.pop();
            destination = destinationList.join("/");
            console.log(destination);

            source = this.kernel.findElementFromPath(source);
            if (source == null) {
                this.kernel.displayBlock("mv: can't move '" + sourceName + "': No such file or directory");
                return;
            }
            console.log(source);
            
            destination = this.kernel.findElementFromPath(destination);
            if (destination == null) {
                this.kernel.displayBlock("mv: can't move '" + sourceName + "' to '" + destination + "': No such file or directory");
                return;
            }
            console.log(destination);

            if (destination instanceof Directory) {
                source.parent.remove(source.getName());
                destination.addChild(source);
                source.rename(destinationName);
            }

            this.kernel.displayBlock("");
        }
    }

    /**
     * help
     * Returns the command's help.
     */
    help() {
        return "Moves a file to another location, and can rename it<br/>usage: mv source destination";
    }
}
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
                        return new CommandResult(true, this.help());
                    default: // invalid option
                        return new CommandResult(false, this._getErrorOptions(options[i]));
                }
            }
            
            let source = params[0];
            source = this.kernel.preparePath(source);
            let sourceName = Kernel.retrieveElementNameAndPath(source).elem;
            
            let destination = params[1];
            destination = this.kernel.preparePath(destination);
            destination = Kernel.retrieveElementNameAndPath(destination);
            let destinationName = destination.elem;
            destination = destination.dir;
            
            source = this.kernel.findElementFromPath(source);
            if (source == null)
                return new CommandResult(false, "mv: can't move '" + sourceName + "': No such file or directory");
            
            destination = this.kernel.findElementFromPath(destination);
            if (destination == null)
                return new CommandResult(false, "mv: can't move '" + sourceName + "' to '" + destination + "': No such file or directory");
            
            if (destination instanceof Directory) {
                source.parent.remove(source.getName());
                destination.addChild(source);
                source.rename(destinationName);
            }

            return new CommandResult();
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
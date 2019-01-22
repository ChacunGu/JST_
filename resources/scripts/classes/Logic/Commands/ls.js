/**
 * Class CommandLS
 * Represents command ls. Lists files, directories and more informations if specified in options.
 */
class CommandLS extends AbstractCommand {
    constructor(kernel) {
        super(kernel, "ls");

        this.maxNumberOptions = 2; // at least 1 for '-?'
        this.minNumberOptions = 0;
        this.maxNumberParams = 1;
        this.minNumberParams = 0;
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

            let optVerbose = false;     // -l
            let optHiddenFiles = false; // -a
            let paramDir = null;        // dir

            // handle options
            for (let i=0; i<options.length; i++) {
                switch(options[i]) {
                    case "l":
                        optVerbose = true;
                        break;
                    case "a":
                    optHiddenFiles = true;
                        break;
                    case "?":
                        this.kernel.displayBlock(this.help());
                        return
                    default: // invalid option
                        this.kernel.displayBlock(this._getErrorOptions(options[i]));
                        return;
                }
            }

            let path = this.kernel.getCurrentDirectory();
            // handle parameters
            for (let i=0; i<params.length; i++) {
                // TODO : verify parameter's validity (in this case if it is a valid directory file)
                //this.path =     
            }

            let listContent = "";
                
            if (path instanceof Directory) {
                for (let i=0; i < path.children.length; i++) { 
                    if (optHiddenFiles) {
                        if (optVerbose) {
                            //TODO : list all with file dates and access
                        } else {
                            listContent += path.children[i].name + "<br/>";
                        }
                    } else {
                        if (optVerbose) {
                            //TODO : list all with file dates and access
                        } else {
                            if (path.children[i].name[0] != ".") {
                                listContent += path.children[i].name + "<br/>";
                            }
                        }
                    }
                }   
            } else {
                this.kernel.displayBlock("Not a Directory");
                return;
            }

            this.kernel.displayBlock(listContent.slice(0, listContent.length-5));
        }
    }

    /**
     * help
     * Returns the command's help.
     */
    help() {
        return "Lists files, directories and more informations if specified in options.<br/>usage: ls [-l][-a][dir]";
    }
}
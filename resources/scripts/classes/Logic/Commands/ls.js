/**
 * Class CommandLS
 * Represents command ls. Lists files, directories and more informations if specified in options.
 */
class CommandLS extends AbstractCommand {
    constructor(kernel) {
        super(kernel, "ls");

        this.maxNumberOptions = 2; // at least 1 for '-?'
        this.maxNumberParams = 1;
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
                        return new CommandResult(true, this.help());
                    default: // invalid option
                        return new CommandResult(false, this._getErrorOptions(options[i]));
                }
            }

            let path = this.kernel.getCurrentDirectory();
            // handle parameters
            if (params.length == 1) {
                let paramDir = this.kernel.preparePath(params[0]);
                
                // find directory
                path = this.kernel.findElementFromPath(paramDir);

                if (path != null) {
                    if (!path instanceof Directory)
                        return new CommandResult(false, paramDir + ": Not a directory.");
                } else
                    return new CommandResult(false, paramDir + ": No such file or directory.");
            }
            
            let listContent = "";
                
            if (path instanceof Directory) {
                listContent += "<table>";
                for (let i=0; i < path.children.length; i++) {
                    
                    if (optHiddenFiles) {
                        listContent += "<tr>";
                        if (optVerbose) {
                            listContent += CommandLS.displayAll(path.children[i]);
                        } else {
                            let elementColor = path.children[i] instanceof Directory ?    CommandLS.directoryColor :
                                               path.children[i] instanceof SymbolicLink ? CommandLS.symbolicLinkColor : 
                                                                              CommandLS.fileColor;
                            listContent += "<td style='color: " + elementColor + ";'>" + path.children[i].getName() + "</td>";
                        }
                        listContent += "</tr>";
                    } else {
                        if (path.children[i].getName()[0] != ".") {
                            listContent += "<tr>";       
                            if (optVerbose) {
                                listContent += CommandLS.displayAll(path.children[i]);
                            } else {
                                let elementColor = path.children[i] instanceof Directory ?       CommandLS.directoryColor :
                                                   path.children[i] instanceof SymbolicLink ?    CommandLS.symbolicLinkColor :
                                                   path.children[i] instanceof AbstractCommand ? CommandLS.commandColor : 
                                                                                                 CommandLS.fileColor;
                                listContent += "<td style='color: " + elementColor + ";'>" + path.children[i].getName() + "</td>";
                            }
                            listContent += "</tr>";
                        }
                    }
                }
                listContent += "</table>";
            } else
                return new CommandResult(false, "Not a Directory");

            return new CommandResult(true, listContent.slice(0, listContent.length), false);
        }
    }

    static displayAll(file) {
        let fileType = "";
        let elementColor = "white";
        let numberOfFilesInside = 1;
        if (file instanceof File) {
            fileType = "-";
            elementColor = CommandLS.fileColor;
        } else if (file instanceof Directory) {
            fileType = "d";
            numberOfFilesInside = file.children.length;
            elementColor = CommandLS.directoryColor;
        } else if (file instanceof SymbolicLink) {
            fileType = "l";
            elementColor = CommandLS.symbolicLinkColor;
        } else if (file instanceof AbstractCommand) {
            fileType = "c";
            elementColor = CommandLS.commandColor;
        }
        return  "<td>" + fileType +                                             // file type (-, d, l)
                file.permission.toString() + "</td>" +                          // permission of everybody else
                "<td>" + numberOfFilesInside + "</td>" +                        // number of files or links inside
                "<td>" + file.getOwner().getName() + "</td>" +                  // name of the owner
                "<td>" + file.getOwner().getGroupName() + "</td>" +             // name of the group
                "<td>" + file.getSize() + "</td>" +                             // size in Byte
                "<td>" + Kernel.displayDate(file.lastEditDate) + "</td>" +      // last edit date 
                "<td style='color: " + elementColor + ";'>" + file.getName() + "</td>";   // name of file
    }

    /**
     * help
     * Returns the command's help.
     */
    help() {
        return "Lists files, directories and more informations if specified in options.<br/>usage: ls [-l][-a] [dir]";
    }
}

CommandLS.directoryColor = "#6A9AE8";
CommandLS.symbolicLinkColor = "#76E288";
CommandLS.fileColor = "#FFFFFF";
CommandLS.commandColor = "#E04D28";
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
            if (params.length == 1) {
                
                let paramDir = params[0];

                path = this.kernel.findDirectoryFromPath(paramDir);

                if (path != null) {
                    if (path instanceof Directory) {
                        // good to go!
                    } else {
                        this.kernel.displayBlock(paramDir + ": Not a directory.");
                        return;
                    }
                } else {
                    this.kernel.displayBlock(paramDir + ": No such file or directory.");
                    return;
                }
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
                            listContent += "<td>" + path.children[i].getName() + "</td>";
                        }
                        listContent += "</tr>";
                    } else {
                        if (path.children[i].getName()[0] != ".") {
                            listContent += "<tr>";       
                            if (optVerbose) {
                                listContent += CommandLS.displayAll(path.children[i]);
                            } else {
                                listContent += "<td>" + path.children[i].getName() + "</td>";
                            }
                            listContent += "</tr>";
                        }
                    }
                }
                listContent += "</table>";
            } else {
                this.kernel.displayBlock("Not a Directory");
                return;
            }

            this.kernel.displayBlock(listContent.slice(0, listContent.length));
        }
    }

    static displayAll(file) {
        let fileType = "";
        let numberOfFilesInside = 1;
        if (file instanceof File) {
            fileType = "-";
        } else if (file instanceof Directory) {
            fileType = "d";
            numberOfFilesInside = file.children.length;
        } else if (file instanceof SymbolicLink) {
            fileType = "l";
        }

        return  "<td>" + fileType + "</td>" +                                   // file type (-, d, l)
                "<td>" + "" + "</td>" +                                         // permissions of the owner
                "<td>" + "" + "</td>" +                                         // permission of the group
                "<td>" + "" + "</td>" +                                         // permission of everybody else
                "<td>" + numberOfFilesInside + "</td>" +                        // number of files or links inside
                "<td>" + "" + "</td>" +                                         // name of the owner
                "<td>" + "" + "</td>" +                                         // name of the group
                "<td>" + file.size + "</td>" +                                  // size in Byte
                "<td>" + Kernel.displayDate(file.lastEditDate) + "</td>" +      // last edit date 
                "<td>" + file.getName() + "</td>";   // name of file
    }

    /**
     * help
     * Returns the command's help.
     */
    help() {
        return "Lists files, directories and more informations if specified in options.<br/>usage: ls [-l][-a][dir]";
    }
}
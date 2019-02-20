/**
 *  class CommandMKDIR
 *  Create new directory.
 */
class CommandMKDIR extends AbstractCommand {
    constructor(kernel) {
        super(kernel, "mkdir");

        this.maxNumberParams = 1;
        this.minNumberParams = 1;
    }

    /**
     * _createPathDirectories
     * Create directories from the given path if not already created.
     * @param {String} directoryName : complete directory name (path + name)
     */
    _createPathDirectories(directoryName) {
        let directoryPath = directoryName.slice(0, directoryName.lastIndexOf("/"));
        let parentDirectory = this.kernel.findElementFromPath(directoryPath.length > 0 ? directoryPath : "/");

        if (parentDirectory != null) {
            if (!parentDirectory instanceof Directory)
                return new CommandResult(false, directoryPath + ": Not a directory.");
            else
                return parentDirectory;
        } else {
            let allDirectoryFromPath = directoryPath.split("/");
            let directoryPathIndex = 0;
            let wipDirectoryPath = allDirectoryFromPath[directoryPathIndex] + "/";
            let buildDirectoryPath = "";
            do {
                if (this.kernel.findElementFromPath(wipDirectoryPath) == null) {
                    if (directoryPathIndex > 0) {
                        // handle invalid directory name
                        if (AbstractFile.containsSpecialCharacters(allDirectoryFromPath[directoryPathIndex])) // invalid special characters in directory name
                            return new CommandResult(false, this._getErrorSpecialChar());
                        else // create new repository specified in given path
                            new Directory(allDirectoryFromPath[directoryPathIndex], 
                                            this.kernel.findElementFromPath(buildDirectoryPath));
                    } else { // find first directory specified in path
                        let startingDirectory = this.kernel.findElementFromPath(directoryName[0]);

                        // handle invalid directory name
                        if (AbstractFile.containsSpecialCharacters(allDirectoryFromPath[directoryPathIndex])) // invalid special characters in directory name
                            return new CommandResult(false, this._getErrorSpecialChar());
                        else // create repository specified in given path
                            new Directory(allDirectoryFromPath[directoryPathIndex], 
                                            startingDirectory);
                    }
                }

                buildDirectoryPath = wipDirectoryPath;
                wipDirectoryPath += allDirectoryFromPath[++directoryPathIndex] + "/";
            } while (this.kernel.findElementFromPath(directoryPath) == null);            
            return this.kernel.findElementFromPath(directoryPath);
        }
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
            let directoryName = this.kernel.preparePath(params[0]);
            
            // get new directory's parent directory
            let parentDirectory = null;
            if (directoryName.includes("/")) { // specified path 
                parentDirectory = this._createPathDirectories(directoryName);
                if (parentDirectory instanceof CommandResult)
                    return parentDirectory;
            } else // implicit path
                parentDirectory = this.kernel.getCurrentDirectory();
                
            // directory creation / update
            directoryName = directoryName.slice(directoryName.lastIndexOf("/")+1, directoryName.length);
            let existingDirectory = parentDirectory.find(directoryName);
            if(existingDirectory != null) // if the directory already exists
                return new CommandResult(false, directoryName + ": Directory already exists");
            else {
                // handle invalid filename
                if (AbstractFile.containsSpecialCharacters(directoryName)) // invalid special characters in filename
                    return new CommandResult(false, this._getErrorSpecialChar());
                new Directory(directoryName, parentDirectory); // create new directory
            }
            return new CommandResult();
        }
    }

    /**
     * help
     * Returns the command's help.
     */
    help() {
        return "Create a new repository or modify the modification date of an existing directory<br/>usage: mkdir directory";
    }
}
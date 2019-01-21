/**
 * Class that represent an Abstract File type
 * Contains a name, a date and a parent to find the path in file system.
 */
class AbstractFile {
    constructor(name) {
        this.name = name;
        this.creationDate = Date();
        this.lastEditDate = Date();

        this.parent = null;

        // avoid instantiation (abstract class)
        if (new.target === AbstractFile)
            throw new Error("Cannot construct AbstractFile instances directly.");
    }
    
    /**
     * getPath
     * Returns the complete path from root to this file.
     */
    getPath() {
        let file = this;
        let path = file.name;
        while(file.parent){
            file = file.parent;
            path = file.name + "/" + path;
        }
        return path;
    }
}
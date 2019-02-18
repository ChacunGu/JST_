/**
 * Class that represent an Abstract File type
 * Contains a name, a date and a parent to find the path in file system.
 */
class AbstractFile {
    constructor(name) {
        this.name = name;
        this.creationDate = new Date();
        this.lastEditDate = new Date();
        this.size = 0;

        this.parent = null;

        // avoid instantiation (abstract class)
        if (new.target === AbstractFile)
            throw new Error("Cannot construct AbstractFile instances directly.");
    }
    
    /**
     * getName
     * returns the name of the file
     */
    getName() {
        return this.name;
    }

    /**
     * getFile
     * returns the reference to the file
     */
    getFile() {
        return this;
    }

    /**
     * update
     * updates the last edit Date
     */
    update() {
        this.lastEditDate = new Date();
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
        return path.length > 0 ? path : "/";
    }

    /**
     * copy
     * Abstract method. Should return an instance's deep copy placed in given destination with given name.
     * @param {String} new_name : new element's name
     * @param {Directory} destination : new element's parent directory
     * @param {bool} createLink : true if copies creates a symbolic link for the given file false if it creates a real copy
     */
    copy(new_name, destination, createLink=false) { throw new Error("This method must be implemented by derived classes."); }

    /**
     * containsSpecialCharacters
     * Returns true if the given filename contains special characters false otherwise.
     * @param {String} filename 
     */
    static containsSpecialCharacters(filename) {
        let specialCharacters = ["\\", "/", ":", "*", "?", "\"", "<", ">", "|"];
        for (let i=0; i<specialCharacters.length; i++) {
            if (filename.includes(specialCharacters[i]))
                return true;
        }
        return false;
    }
}
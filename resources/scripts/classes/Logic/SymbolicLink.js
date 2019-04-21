/**
 * Class SymbolicLink
 * has a reference to another file
 */
class SymbolicLink extends AbstractFile {
    constructor(name, file, user=null) {
        super(name, user);

        this.size = 7;

        if(file instanceof AbstractFile) {
            this.file = file;
        } else {
            throw new TypeError("File must be of type AbstractFile.");
        }
    }

    /**
     * getFile
     * return the reference to the file
     */
    getFile() {
        return this.file;
    }

    /**
     * copy
     * Returns an instance's deep copy placed in given destination with given name.
     * @param {String} new_name : new element's name
     * @param {Directory} destination : new element's parent directory
     * @param {bool} createLink : true if copies creates a symbolic link for the given file false if it creates a real copy
     */
    copy(new_name, destination, createLink=false) { 
        let copy = new SymbolicLink(new_name, this.file, this.user);
        destination.addChild(copy);
        return copy;
    }
}
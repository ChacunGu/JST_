/**
 * Class File
 * Represents a file.
 */
class File extends AbstractFile {
    constructor(name, content="") {
        super(name);

        this.content = content;
        this.size = this.content.length;
    }

    /**
     * getSize
     * returns the size of the file
     */
    getSize() {
        return this.content.length;
    }
    
    /**
     * copy
     * Abstract method. Should return an instance's deep copy placed in given destination with given name.
     * @param {String} new_name : new element's name
     * @param {Directory} destination : new element's parent directory
     * @param {bool} createLink : true if copies creates a symbolic link for the given file false if it creates a real copy
     */
    copy(new_name, destination, createLink=false) { 
        let copy = !createLink ? new File(new_name, this.content) : new SymbolicLink(new_name, this);
        destination.addChild(copy);
        return copy;
    }
}
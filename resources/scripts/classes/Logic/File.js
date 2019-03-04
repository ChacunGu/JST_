/**
 * Class File
 * Represents a file.
 */
class File extends AbstractFile {
    constructor(name, user=null, content="") {
        super(name, user);

        this.content = content;
        this.size = this.content.length;
    }

    /**
     * getContent
     * Returns file's content.
     */
    getContent() {
        return this.content;
    }

    /**
     * setContent
     * Sets file's content with the given one.
     * @param {String} content : new file's content
     */
    setContent(content) {
        this.content = content;
    }

    /**
     * getSize
     * Returns the size of the file.
     */
    getSize() {
        return this.content.length;
    }
    
    /**
     * copy
     * Return an instance's deep copy placed in given destination with given name.
     * @param {String} new_name : new element's name
     * @param {Directory} destination : new element's parent directory
     * @param {bool} createLink : true if copies creates a symbolic link for the given file false if it creates a real copy
     */
    copy(new_name, destination, createLink=false) { 
        let copy = !createLink ? new File(new_name, this.content) : new SymbolicLink(new_name, this);
        copy.setOwner(this.getOwner());
        destination.addChild(copy);
        return copy;
    }
}
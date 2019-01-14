/**
 * Class Directory
 * has children (Directory or Files)
 */
class Directory extends AbstractFile {
    constructor(name) {
        super(name);

        this.children = [];
    }

    /**
     * addChild
     * adds a File or Directory to the children of this Directory.
     * @param {AbstractFile} file : the file to add to the children 
     */
    addChild(file) {
        if(file instanceof AbstractFile) {
            file.parent = this;
            this.children.push(file);
        } else
            throw new TypeError("File must be of type AbstractFile.");
    }
}
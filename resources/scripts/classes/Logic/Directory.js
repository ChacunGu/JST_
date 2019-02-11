/**
 * Class Directory
 * has children (Directory or Files)
 */
class Directory extends AbstractFile {
    constructor(name, parent) {
        super(name);
        
        this.size = 4096;

        this.children = [];
        this.children.push(new SymbolicLink(".", this));

        if (parent != null) {
            parent.addChild(this);
            this.children.push(new SymbolicLink("..", this.parent));
        }
    }
    
    /**
     * find
     * finds a file or directory named {filename} directly inside the directory
     * and returns it (return null if not exist)
     * @param {String} filename 
     */
    find(filename) {
        for (let i=0; i<this.children.length; i++) { 
            if(this.children[i].name == filename) {
                return this.children[i].getFile();
            }
        }
        return null;
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
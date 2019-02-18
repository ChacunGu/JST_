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
     * @param {bool} followingSymbolicLink : true if we follow the symbolic files pointer false if we return them
     */
    find(filename, followingSymbolicLink=true) {
        for (let i=0; i<this.children.length; i++) { 
            if(this.children[i].getName() == filename) {
                if (!followingSymbolicLink && this.children[i] instanceof SymbolicLink)
                    return this.children[i];
                else
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

    /**
     * copy
     * Abstract method. Should return an instance's deep copy placed in given destination with given name.
     * @param {String} new_name : new element's name
     * @param {Directory} destination : new element's parent directory
     * @param {bool} createLink : true if copies creates a symbolic link for the given file false if it creates a real copy
     */
    copy(new_name, destination, createLink=false) { 
        if (!createLink) {
            let copy = new Directory(new_name, destination);
            for (let i=0; i<this.children.length; i++) {
                if (this.children[i].getName() != "." && this.children[i].getName() != "..")
                    this.children[i].copy(this.children[i].getName(), copy);
            }
            return copy;
        } else {
            let copy = new SymbolicLink(new_name, this);
            destination.addChild(copy);
            return copy;
        }
    }
}
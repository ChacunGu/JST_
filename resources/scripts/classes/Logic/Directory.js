/**
 * Class Directory
 * has children (Directory or Files)
 */
class Directory extends AbstractFile {
    constructor(name, user=null, parent=null) {
        super(name, user);
        
        this.size = 4096;

        this.setRights("755");

        this.children = [];
        this.children.push(new SymbolicLink(".", this, user));
        
        if (parent != null) {
            parent.addChild(this);
            this.children.push(new SymbolicLink("..", this.parent, user));
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
     * remove
     * removes the file with the given name in the directory
     * @param {String} filename 
     */
    remove(filename) {
        for (let i=0; i<this.children.length; i++) { 
            if(this.children[i].getName() == filename) {
                this.children.splice(i,1);
                return;
            }
        }
    }

    /**
     * isEmpty
     * tests if the Directory is empty
     */
    isEmpty() {
        return this.children.length == 0;
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
        this.children.sort((a,b) => a.getName().localeCompare(b.getName()));
    }

    /**
     * copy
     * Returns an instance's deep copy placed in given destination with given name.
     * @param {String} new_name : new element's name
     * @param {Directory} destination : new element's parent directory
     * @param {bool} createLink : true if copies creates a symbolic link for the given file false if it creates a real copy
     */
    copy(new_name, destination, createLink=false) { 
        if (!createLink) {
            let copy = new Directory(new_name, destination);
            copy.setOwner(this.getOwner());
            for (let i=0; i<this.children.length; i++) {
                if (this.children[i].getName() != "." && this.children[i].getName() != "..")
                    this.children[i].copy(this.children[i].getName(), copy);
            }
            return copy;
        } else {
            let copy = new SymbolicLink(new_name, this);
            copy.setOwner(this.getOwner());
            destination.addChild(copy);
            return copy;
        }
    }

    /**
     * getChildren
     * Returns directory's children.
     */
    getChildren() {
        return this.children;
    }
}
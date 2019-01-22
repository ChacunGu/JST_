/**
 * Class SymbolicLink
 * has a reference to another file
 */
class SymbolicLink extends AbstractFile {
    constructor(name, file) {
        super(name);
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
}
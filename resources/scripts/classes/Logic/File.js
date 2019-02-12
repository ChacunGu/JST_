/**
 * Class File
 * has a content
 */
class File extends AbstractFile {
    constructor(name) {
        super(name);

        this.content = "";

        this.size = this.content.length;
    }

    /**
     * getSize
     * returns the size of the file
     */
    getSize() {
        return this.content.length;
    }

}
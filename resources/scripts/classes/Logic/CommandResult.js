/**
 * Class CommandResult
 * Represents command's result.
 */
class CommandResult {
    constructor(success=true, content="", addBreakline=true, customHeader="", isNewInputNeeded=false) {
        this.content = content;
        this.success = success;
        this.addBreakline = addBreakline;
        this.customHeader = customHeader;
        this.isNewInputNeeded = isNewInputNeeded;
    }

    /**
     * isSuccessful
     * Returns true if the command successfuly performed its task false otherwise.
     */
    isSuccessful() {
        return this.success;
    }

    /**
     * getContent
     * Returns the command's result.
     */
    getContent() {
        return this.content;
    }

    /**
     * getContent
     * Returns true if a break line shoud be added after the command's result when displayed false otherwise.
     */
    getAddBreakline() {
        return this.addBreakline;
    }

    /**
     * getCustomHeader
     * Returns the command's custom header for display.
     */
    getCustomHeader() {
        return this.customHeader;
    }

    /**
     * getNewInputNeeded
     * Returns true if a new input should be displayed after the command's result false otherwise.
     */
    getNewInputNeeded() {
        return this.isNewInputNeeded;
    }
}
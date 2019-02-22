/**
 * Class CommandResult
 * Represents command's result.
 */
class CommandResult {
    constructor(success=true, content="", addBreakline=true, customHeader="") {
        this.content = content;
        this.success = success;
        this.addBreakline = addBreakline;
        this.customHeader = customHeader;
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
}
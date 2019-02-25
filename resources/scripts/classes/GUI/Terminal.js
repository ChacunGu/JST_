/**
 * Terminal
 * Class which represents a terminal. Provides methods to append new content, clear and display 
 * the terminal's elements.
 */
class Terminal {
    constructor(user, hostname, path) {
        this.terminalNode = document.getElementById(Terminal.NODE_ID);
        this.input = new TerminalInput(this.terminalNode, user, hostname, path);
        this.input.focus();
        this.display();
    }

    /**
     * _append
     * Appends a new DOM element to the terminal.
     * @param {DOM node} block : the block to append to the terminal
     */
    _append(block) {
        // insert the block before the terminal's input
        this.terminalNode.insertBefore(block, this.input.inputNode);

        // scroll to bottom
        window.pageYOffset = 
            document.documentElement.scrollTop = 
            document.body.scrollTop = this.terminalNode.scrollHeight;
    }

    /**
     * addBlock
     * Creates the new block with its header, the command and its result. Calls the method
     * to append it to the terminal.
     * @param {String} header : header's content (user, hostname, path)
     * @param {String} command : user's command
     * @param {String} result : command's result
     * @param {boolean} addBreakLine : true if a break line should be added after the given content false otherwise
     */
    addBlock(header, command, result="", addBreakLine=true) {
        let block = document.createElement("div");
        block.classList.add(Terminal.BLOCK_NODE_CLS);
        
        block.append(document.createTextNode(header));
        block.append(document.createElement("br"));
        block.append(document.createTextNode("$ "));
        
        block.append(document.createTextNode(command));

        block.append(document.createElement("br"));

        // block.append(document.createTextNode(result));
        let resultContainer = document.createElement("span");
        resultContainer.innerHTML = result;
        block.append(resultContainer);
        
        if (result.length > 0 && addBreakLine)
            block.append(document.createElement("br"));
        block.append(document.createElement("br"));
        this._append(block);
    }

    /**
     * clear
     * Clears the terminal's content.
     */
    clear() {
        let elementsToRemove = this.terminalNode.getElementsByClassName(Terminal.BLOCK_NODE_CLS);
        while (elementsToRemove.length > 0) {
            elementsToRemove[0].parentNode.removeChild(elementsToRemove[0]);
        }
        this.input.focus();
    }

    /**
     * updateHeader
     * Updates the terminal's input header.
     * @param {String} header : new terminal's input header
     */
    updateHeader(header) {
        this.input.updateHeader(header);
    }

    /**
     * setInputContent
     * Sets terminal's input content.
     * @param {String} value : terminal's input value to set
     */
    setInputContent(value) {
        this.input.setValue(value);
    }

    /**
     * focus
     * Puts focus on the terminal's input.
     */
    focusInput() {
        this.input.focus(this.input.getCursorPosition());
    }

    /**
     * setCursorPosition
     * Sets the terminal input's cursor postion.
     * @param {int} pos : new cursor position in text
     */
    setCursorPosition(pos) {
        this.input.setCursorPosition(pos);
    }

    /**
     * display
     * Displays the terminal.
     */
    display() {
        this.terminalNode.style.visibility = "visible";
    }

    /**
     * hide
     * Hides the terminal.
     */
    hide() {
        this.terminalNode.style.visibility = "hidden";
    }

    /**
     * isVisible
     * Returns true if the terminal is visible false otherwise.
     */
    isVisible() {
        return this.terminalNode.style.visibility == "visible";
    }

    /**
     * getInput
     * Returns terminal's input.
     */
    getInput() {
        return this.input;
    }
}

Terminal.NODE_ID = "terminal";
Terminal.BLOCK_NODE_CLS = "terminal-blocks";
/**
 * Terminal
 * Class which represents a terminal. Provides methods to append new content, clear and display 
 * the terminal's elements.
 */
class Terminal {
    constructor(user, hostname, path) {
        this.terminalNode = document.getElementById(Terminal.NODE_ID);
        this.input = new Input(this.terminalNode, user, hostname, path);
        this.input.focus();
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
     */
    addBlock(header, command, result="") {
        let block = document.createElement("div");
        block.classList.add(Terminal.BLOCK_NODE_CLS);
        
        block.append(document.createTextNode(header));
        block.append(document.createElement("br"));
        block.append(document.createTextNode("$ "));
        
        block.append(document.createTextNode(command));

        block.append(document.createElement("br"));
        block.append(document.createTextNode(result));
        
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
}

Terminal.NODE_ID = "terminal";
Terminal.BLOCK_NODE_CLS = "terminal-blocks";
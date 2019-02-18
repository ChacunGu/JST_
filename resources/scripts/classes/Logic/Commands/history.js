/**
 * Class CommandHistory
 * Represents command history. Displays commands history.
 */
class CommandHistory extends AbstractCommand {
    constructor(kernel) {
        super(kernel, "history");
    }

    /**
     * execute
     * Executes the command with given options and parameters.
     * @param {Array} options : command's option(s)
     * @param {Array} params : command's parameter(s)
     */
    execute(options=[], params=[]) { 
        // handle invalid options / parameters
        if (this._verifyExecuteArgs(options, params)) {

            // handle options
            for (let i=0; i<options.length; i++) {
                switch(options[i]) {
                    case "?":
                        this.kernel.displayBlock(this.help());
                        return
                    default: // invalid option
                        this.kernel.displayBlock(this._getErrorOptions(options[i]));
                        return;
                }
            }

            // execute command
            this.kernel.displayBlock(this._getHistory());
        }
    }

    /**
     * _getHistory
     * Returns the commands history representation.
     */
    _getHistory() {
        let history = this.kernel.getHistory();
        let historyRepr = "";
        for (let i=0; i<history.length-1; i++)
            historyRepr += history[i] + ((i < history.length-2) ? "<br/>" : "");
        return historyRepr;
    }

    /**
     * help
     * Returns the command's help.
     */
    help() {
        return "Displays commands history.<br/>usage: history";
    }
}
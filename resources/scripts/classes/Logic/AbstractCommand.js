/**
 * Class AbstractCommand
 * Represents a command which is a file and has methods to execute and display help.
 */
class AbstractCommand extends AbstractFile {
    constructor(kernel, name) {
        super(name);

        this.maxNumberOptions = 1; // at least 1 for '-?'
        this.minNumberOptions = 0;
        this.maxNumberParams = 0;
        this.minNumberParams = 0;

        if(kernel instanceof Kernel) {
            this.kernel = kernel;
            this.setOwner(kernel.getUser());
        } else { 
            throw new TypeError("AbstractCommand must receive a Kernel as first argument.");
        }
        // avoid instantiation (abstract class)
        if (new.target === AbstractCommand)
            throw new Error("Cannot construct AbstractCommand instances directly.");
    }

    /**
     * execute
     * Abstract method. Should execute the command with given options and parameters.
     * @param {Array} options : command's option(s)
     * @param {Array} params : command's parameters
     */
    execute(options=[], params=[]) { throw new Error("This method must be implemented by derived classes."); }
    
    /**
     * help
     * Abstract method. Should return the command's help.
     */
    help() { throw new Error("This method must be implemented by derived classes."); }

    /**
     * _getErrorTooManyArguments
     * Returns the "too many parameters" error message.
     */
    _getErrorTooManyArguments() {
        return "Too many arguments.<br/>" + this.help();
    }

    /**
     * _getErrorNotEnoughArguments
     * Returns the "arguments missing" error message.
     */
    _getErrorNotEnoughArguments() {
        return "Arguments missing.<br/>" + this.help();
    }

    /**
     * _getErrorOptions
     * Returns the "invalid option" error message.
     * @param {String} option : invalid option
     */
    _getErrorOptions(option) {
        return "-" + option + ": invalid option<br/>" + this.help()
    }

    /**
     * _getErrorSpecialChar
     * Returns the "special characters" error message.
     */
    _getErrorSpecialChar() {
        return "Filename can not contain special characters : \ / : * ? \" < > |";
    }

    /**
     * _verifyExecuteArgs
     * Verifies commands options and parameters validity. Returns true if valid false otherwise.
     * @param {Array} options : command's option(s)
     * @param {Array} params : command's parameters
     */
    _verifyExecuteArgs(options, params) {
        if (!(options instanceof Array) || !(params instanceof Array))
            throw new TypeError("Options/Params must be of type Array.");
        
        if (((options.length > this.maxNumberOptions && this.maxNumberOptions != -1) || 
            (params.length > this.maxNumberParams && this.maxNumberParams != -1)) && !options.includes("?")) {
            this.kernel.displayBlock(this._getErrorTooManyArguments());
            return false;
        } else if ((options.length < this.minNumberOptions || params.length < this.minNumberParams) 
                    && !options.includes("?")) {
            this.kernel.displayBlock(this._getErrorNotEnoughArguments());
            return false;
        }
        return true;
    }
}
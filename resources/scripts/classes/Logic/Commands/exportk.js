/**
 *  class ExportK
 *  Exports current kernel state.
 */
class ExportK extends AbstractCommand {
    constructor(kernel) {
        super(kernel, "exportk");
    }

    /**
     * _downloadJson
     * Downloads given JSON.
     * Code from (source): https://stackoverflow.com/a/30800715
     * 
     * @param {String} json : kernel's state in json
     * @param {String} exportName : save file's name
     */
    _downloadJson(json, exportName) {
        let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(json);
        let downloadAnchorNode = document.createElement("a");
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", exportName + ".json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
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
            
            let optExternal = false; // -e

            // handle options
            for (let i=0; i<options.length; i++) {
                switch(options[i]) {
                    case "e":
                        optExternal = true;
                        break;
                    case "?":
                        return new CommandResult(true, this.help());
                    default: // invalid option
                        return new CommandResult(false, this._getErrorOptions(options[i]));
                }
            }

            let kernelState = this.kernel.getKernelStateAsJSON();

            if (optExternal) { // export to an external json file
                this._downloadJson(kernelState, "JST_kernelstate");
            } else { // export to localStorage
                this.kernel.exportToFileStorage(kernelState);
            }
            return new CommandResult(true, "Kernel exported successfuly");
        }
    }

    /**
     * help
     * Returns the command's help.
     */
    help() {
        return "Export current kernel's state<br/>usage: exportk [-e]";
    }
}
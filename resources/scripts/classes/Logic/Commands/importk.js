/**
 *  class ImportK
 *  Imports and restores a kernel state.
 */
class ImportK extends AbstractCommand {
    constructor(kernel) {
        super(kernel, "importk");
        this.fileSelector = document.getElementById("fileSelector");
        this.fileSelector.addEventListener("change", evt => {
            this._loadSelectedSave(evt);
            return false;
        });
    }

    /**
     * _loadSelectedSave
     * Loads selected save file.
     * @param {Event} evt : on change event
     */
    _loadSelectedSave(evt, __this) {
        let filename = evt.target.files[0].name.split(".");
        if (filename[filename.length-1] != "json") {
            alert("Invalid file format: JSON expected");
        } else {
            let filereader = new FileReader();
            filereader.onload = _ => {
                let data = JSON.parse(filereader.result);
                if(data != null) {
                    this._restoreKernel(data);
                } else {
                    alert("File error");
                }
            }
            filereader.readAsText(evt.target.files[0]);
        }
    }

    /**
     * _restoreKernel
     * Dispatch event for kernel restoration.
     * 
     * @param {Object} data : kernel's state
     */
    _restoreKernel(data) {
        window.dispatchEvent(new CustomEvent("restoreKernel", 
                                             {detail: data}));
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

            if (optExternal) { // import from an external json file
                this.fileSelector.click();
            } else { // import from localStorage
                let data = JSON.parse(localStorage.getItem("data"));
                if (data != null) {
                    this._restoreKernel(data);
                } else
                    return new CommandResult(true, "No kernel state has been found");
            }
            return;
        }
    }

    /**
     * help
     * Returns the command's help.
     */
    help() {
        return "Import and restore a kernel state<br/>usage: importk [-e]";
    }
}
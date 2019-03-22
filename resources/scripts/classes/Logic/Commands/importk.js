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
                let history = data.history;
                let hiddenHistory = data.hiddenHistory;
                if(history != null && hiddenHistory != null) {
                    this.kernel.import(history, hiddenHistory);
                    alert("Successful kernel restoration");
                } else {
                    alert("File error");
                }
            }
            filereader.readAsText(evt.target.files[0]);
        }
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
                    let history = data.history;
                    let hiddenHistory = data.hiddenHistory;

                    this.kernel.import(history, hiddenHistory);
                    return new CommandResult(true, "Successful kernel restoration");
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
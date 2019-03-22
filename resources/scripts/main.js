
var kernel = null;

window.onload = initKernel;

/**
 * initKernel
 * Initializes the session's kernel.
 */
function initKernel() {
    kernel = new Kernel();
    initEvents();
}

/**
 * restoreKernel
 * Initializes a new kernel and restores given state.
 * 
 * @param {Object} data : kernel's state
 */
function restoreKernel(data) {
    kernel._init();
    kernel.import(data.history, data.hiddenHistory);
    alert("Successful kernel restoration");
}

/**
 * initEvents
 * Initializes application's events.
 */
function initEvents() {
    window.addEventListener("restoreKernel", event => restoreKernel(event.detail));

    window.onkeyup = event => {
        let keycode = event.keyCode;
        if (kernel.getTerminal().isVisible()) { // kernel events
            if (kernel.getTerminal().getInput().editableNode != document.activeElement && !event.ctrlKey && 
                    ((keycode > 47 && keycode < 58) || keycode == 32 || keycode == 13  || 
                    (keycode > 64 && keycode < 91)  || (keycode > 95 && keycode < 112) || 
                    (keycode > 185 && keycode < 193))) {
                if ((keycode > 47 && keycode < 58) || (keycode > 64 && keycode < 91) || 
                    (keycode > 95 && keycode < 112) || (keycode > 185 && keycode < 193))
                    kernel.getTerminal().getInput().write(event.key);
                focusInput(kernel.getTerminal());
            }
        } else if (kernel.getEditor().isVisible()) { // editor events
            if (kernel.getEditor().getMode() == Editor.MODE_COMMAND)
                kernel.getEditor().verifyCommandInputValidity();
        }
    }

    window.onkeydown = event => {
        if (kernel.getTerminal().isVisible()) { // kernel events
            // ...
        } else if (kernel.getEditor().isVisible()) { // editor events
            if (kernel.getEditor().getMode() == Editor.MODE_COMMAND)
                kernel.getEditor().verifyCommandInputValidity();

            if (event.keyCode === Editor.KEY_TOGGLE_MODE_GENERAL)
                kernel.getEditor().changeMode(Editor.MODE_GENERAL);
            else if (event.keyCode === Editor.KEY_TOGGLE_MODE_COMMAND) {
                if (kernel.getEditor().getMode() == Editor.MODE_GENERAL)
                    kernel.getEditor().changeMode(Editor.MODE_COMMAND);
            } else if (event.keyCode === Editor.KEY_TOGGLE_MODE_INSERT) {
                if (kernel.getEditor().getMode() == Editor.MODE_GENERAL) {
                    event.preventDefault();
                    kernel.getEditor().changeMode(Editor.MODE_INSERT);
                }
            }
        }
    };

    window.onclick = event => {
        if (kernel.getEditor().isVisible())
            focusInput(kernel.getEditor());
        else if (kernel.getTerminal().isVisible()) {
            if (event.target.id != TerminalInput.NODE_ID)
                focusInput(kernel.getTerminal());
        }
    }
    
    document.getElementById(TerminalInput.EDITABLE_NODE_ID).onblur = () => {
        if (kernel.getTerminal().isVisible())
            kernel.getTerminal().setCursorPosition(window.getSelection().anchorOffset);
        else
            return;
    }

    document.getElementById(EditorInput.EDITABLE_NODE_ID).onblur = () => {
        if (kernel.getEditor().isVisible()) {
            kernel.getEditor().setCursorPosition(window.getSelection().anchorOffset);
        } else
            return;
    };
}

/**
 * focusInput
 * Focuses the given object's input.
 * @param {Terminal/Editor} elem : object containing the input to be focused
 */
function focusInput(elem) {
    if ((window.getSelection ? window.getSelection() :
          document.getSelection ? document.getSelection() :
          document.selection ? document.selection() : "") == "") {
        if (elem.isVisible()) {
            elem.focusInput();
        }
    }
}
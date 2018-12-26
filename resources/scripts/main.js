
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
 * initEvents
 * Initializes application's events.
 */
function initEvents() {
    // always focus the terminal's input
    let focusTerminalInput = () => {
        if ((window.getSelection ? window.getSelection() :
              document.getSelection ? document.getSelection() :
              document.selection ? document.selection() : "") == "")
            kernel.terminal.input.focus();
    };
    window.onmouseup = focusTerminalInput;
    window.setTimeout(focusTerminalInput, 500);

    // focus the terminal's input if not focused and user pressed a key
    window.onkeyup = event => {
        let keycode = event.keyCode;
        if (kernel.terminal.input.editableNode != document.activeElement && !event.ctrlKey &&
            ((keycode > 47 && keycode < 58) ||
            keycode == 32 || keycode == 13  ||
            (keycode > 64 && keycode < 91)  ||
            (keycode > 95 && keycode < 112) ||
            (keycode > 185 && keycode < 193))) {
                kernel.terminal.input.write(event.key);
                kernel.terminal.input.focus();
            }
    }

    // focus the terminal's input when the down arrow is pressed
    window.onkeydown = event => {
        if(event.keyCode == 40)
            kernel.terminal.input.focus();
    }
}
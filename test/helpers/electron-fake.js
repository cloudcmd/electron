const noop = () => {};
const handlers = {};
const windows = [];
const errors = [];

globalThis.__electron = {
    handlers,
    windows,
    errors,
};

export const app = {
    on: (name, fn) => {
        handlers[name] = fn;
    },
    quit: noop,
};

export const dialog = {
    showErrorBox: (...args) => errors.push(args),
};

export const globalShortcut = {
    register: noop,
};

export class BrowserWindow {
    constructor(options) {
        this.options = options;
        this.webContentsHandlers = {};
        this.webContents = {
            openDevTools: noop,
            on: (name, fn) => {
                this.webContentsHandlers[name] = fn;
            },
        };
        windows.push(this);
    }

    loadURL(url) {
        this.url = url;
    }

    on() {}
}

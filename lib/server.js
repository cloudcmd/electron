'use strict';

const http = require('http');
const cloudcmd = require('cloudcmd');
const io = require('socket.io');
const app = require('express')();

module.exports = (fn) => {
    const prefix = '/cloudcmd';
    
    const server = http.createServer(app);
    const socket = io.listen(server, {
        path: `${prefix}/socket.io`
    });
    
    const terminal = true;
    const terminalPath = 'gritty';
    
    const config = {
        prefix,
        terminal,
        terminalPath,
    };
    
    app.use(cloudcmd({
        socket, /* used by Config, Edit (optional) and Console (required)   */
        config, /* config data (optional)                                   */
    }));
    
    server.listen(0, '127.0.0.1', () => {
        fn(null, server.address().port);
    });
    
    server.on('error', fn);
};


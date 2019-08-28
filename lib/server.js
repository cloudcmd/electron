'use strict';

const http = require('http');
const {promisify} = require('util');

const cloudcmd = require('cloudcmd');
const io = require('socket.io');
const app = require('express')();

module.exports = promisify((fn) => {
    const server = http.createServer(app);
    const socket = io.listen(server);
    
    const terminal = true;
    const terminalPath = 'gritty';
    
    const config = {
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
});


import http from 'node:http';
import {promisify} from 'node:util';
import cloudcmd from 'cloudcmd';
import {Server} from 'socket.io';
import express from 'express';

export const createServer = async ({port = 0} = {}) => {
    const app = express();
    const server = http.createServer(app);
    const socket = new Server(server);
    
    app.use(cloudcmd({
        socket,
        config: {
            terminal: true,
            terminalPath: 'gritty',
        },
    }));
    
    await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(port, '127.0.0.1', resolve);
    });
    
    return {
        port: server.address().port,
        close: promisify(server.close.bind(server)),
    };
};

import {register} from 'node:module';

register('./electron-loader.js', import.meta.url);

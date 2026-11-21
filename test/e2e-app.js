import test from 'supertape';
import {tryCatch} from 'try-catch';
import {getAppPath, getLaunchArgs} from '../scripts/e2e-app.js';

const check = (name, options, expected) => {
    test(`cloudcmd-electron: e2e-app: getAppPath: ${name}`, (t) => {
        const result = getAppPath(options);
        
        t.equal(result, expected);
        t.end();
    });
};

check('linux x64', {platform: 'linux', arch: 'x64'}, 'dist/linux-unpacked/cloudcmd');
check('linux arm64', {platform: 'linux', arch: 'arm64'}, 'dist/linux-arm64-unpacked/cloudcmd');
check('windows x64', {platform: 'win32', arch: 'x64'}, 'dist/win-unpacked/cloudcmd.exe');
check('windows arm64', {platform: 'win32', arch: 'arm64'}, 'dist/win-arm64-unpacked/cloudcmd.exe');
check('mac x64', {platform: 'darwin', arch: 'x64'}, 'dist/mac/cloudcmd.app/Contents/MacOS/cloudcmd');
check('mac arm64', {platform: 'darwin', arch: 'arm64'}, 'dist/mac-arm64/cloudcmd.app/Contents/MacOS/cloudcmd');
check('custom dist directory', {platform: 'linux', arch: 'x64', dist: 'out'}, 'out/linux-unpacked/cloudcmd');

test('cloudcmd-electron: e2e-app: getAppPath: unknown platform is an error', (t) => {
    const [error] = tryCatch(getAppPath, {
        platform: 'freebsd',
        arch: 'x64',
    });
    
    t.equal(error.message, 'Platform freebsd is not supported');
    t.end();
});

test('cloudcmd-electron: e2e-app: getLaunchArgs: linux needs no-sandbox (CI runners have no setuid sandbox)', (t) => {
    const result = getLaunchArgs('linux');
    const expected = ['--no-sandbox'];
    
    t.deepEqual(result, expected);
    t.end();
});

test('cloudcmd-electron: e2e-app: getLaunchArgs: windows has no extra args', (t) => {
    const result = getLaunchArgs('win32');
    const expected = [];
    
    t.deepEqual(result, expected);
    t.end();
});

test('cloudcmd-electron: e2e-app: getLaunchArgs: mac has no extra args', (t) => {
    const result = getLaunchArgs('darwin');
    const expected = [];
    
    t.deepEqual(result, expected);
    t.end();
});

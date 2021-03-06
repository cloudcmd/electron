'use strict';

const {version} = require('./package');
const {run} = require('madrun');

module.exports = {
    'lint': () => 'putout lib .madrun.js',
    'fix:lint': () => run('lint', '--fix'),
    'pack:windows': () => 'electron-packager . --platform=win32 --arch x64 --icon=icon.ico',
    'mv:windows': () => `mv cloudcmd-win32-x64 cloudcmd-v${version}-win32-x64`,
    'ci:mv:windows': () => run('mv:windows'),
    'zip:windows': () => `onezip -p cloudcmd-v${version}-win32-x64`,
    'ci:zip:windows': () => run('zip:windows'),
    'rm:windows': () => 'rimraf cloudcmd-*',
    'rm:modules': () => 'rimraf node_modules',
    'install:all': () => 'npm i',
    'upload:windows': () => `putasset --force -l -o coderaiser -r cloudcmd -t v${version} -f cloudcmd-v${version}-win32-x64.zip`,
    'ci:upload:windows': () => run('upload:windows'),
    'dist': () => run(['pack:*', 'mv:*', 'zip:*', 'upload:*', 'rm:*']),
    'ci:dist': () => run(['pack:*', 'ci:mv:*', 'ci:zip:*', 'ci:upload:*']),
    'wisdom:done:old': () => run('dist'),
    'wisdom:done': () => 'echo https://ci.appveyor.com/project/coderaiser/electron/',
};


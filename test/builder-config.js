import {readFileSync} from 'node:fs';
import test from 'supertape';

const read = (name) => readFileSync(new URL(`../${name}`, import.meta.url), 'utf8');
const config = read('electron-builder.yml');
const workflow = read('.github/workflows/release.yml');

test('cloudcmd-electron: builder: config has windows', (t) => {
    const result = config.includes('\nwin:');
    t.ok(result);
    t.end();
});

test('cloudcmd-electron: builder: config has mac', (t) => {
    const result = config.includes('\nmac:');
    t.ok(result);
    t.end();
});

test('cloudcmd-electron: builder: config has linux', (t) => {
    const result = config.includes('\nlinux:');
    t.ok(result);
    t.end();
});

test('cloudcmd-electron: builder: windows artifact keeps the old release name', (t) => {
    const result = config.includes('cloudcmd-v${version}-win32-${arch}.${ext}');
    t.ok(result);
    t.end();
});

test('cloudcmd-electron: builder: mac artifact name', (t) => {
    const result = config.includes('cloudcmd-v${version}-darwin-${arch}.${ext}');
    t.ok(result);
    t.end();
});

test('cloudcmd-electron: builder: linux artifact name', (t) => {
    const result = config.includes('cloudcmd-v${version}-linux-${arch}.${ext}');
    t.ok(result);
    t.end();
});

test('cloudcmd-electron: workflow: runs on tags', (t) => {
    const result = workflow.includes(`tags:\n      - 'v*'`);
    t.ok(result);
    t.end();
});

test('cloudcmd-electron: workflow: publishes to releases of cloudcmd', (t) => {
    const result = workflow.includes('--repo coderaiser/cloudcmd');
    t.ok(result);
    t.end();
});

test('cloudcmd-electron: builder: mac uses ad-hoc signature (arm64 build without it is "damaged")', (t) => {
    const result = config.includes('identity: "-"');
    
    t.ok(result);
    t.end();
});

test('cloudcmd-electron: builder: linux binary is named cloudcmd (e2e starts it by this name)', (t) => {
    const result = config.includes('executableName: cloudcmd');
    
    t.ok(result);
    t.end();
});

test('cloudcmd-electron: builder: windows does not list architectures (each runner builds its own)', (t) => {
    const result = config.includes('arch:');
    
    t.notOk(result);
    t.end();
});

test('cloudcmd-electron: workflow: e2e runs before the artifacts are uploaded', (t) => {
    const result = /npm run e2e[\s\S]*upload-artifact/.test(workflow);
    
    t.ok(result);
    t.end();
});

test('cloudcmd-electron: workflow: e2e on linux runs under xvfb', (t) => {
    const result = workflow.includes('xvfb-run -a npm run e2e');
    
    t.ok(result);
    t.end();
});

test('cloudcmd-electron: workflow: e2e report is kept when a run fails', (t) => {
    const result = workflow.includes('if: failure()');
    
    t.ok(result);
    t.end();
});

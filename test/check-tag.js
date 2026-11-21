import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import process from 'node:process';
import test from 'supertape';
import {checkTag} from '../scripts/check-tag.js';

test('cloudcmd-electron: check-tag: tag matches the version', (t) => {
    const [error] = checkTag('v19.24.0', '19.24.0');

    t.notOk(error);
    t.end();
});

test('cloudcmd-electron: check-tag: refs/tags prefix is accepted', (t) => {
    const [error] = checkTag('refs/tags/v19.24.0', '19.24.0');

    t.notOk(error);
    t.end();
});

test('cloudcmd-electron: check-tag: different version is an error', (t) => {
    const [error] = checkTag('v19.25.0', '19.24.0');

    t.equal(error.message, 'Tag v19.25.0 does not match version 19.24.0 of package.json');
    t.end();
});

test('cloudcmd-electron: check-tag: tag without v is an error', (t) => {
    const [error] = checkTag('19.24.0', '19.24.0');

    t.ok(error);
    t.end();
});

test('cloudcmd-electron: check-tag: empty tag is an error', (t) => {
    const [error] = checkTag('', '19.24.0');

    t.ok(error);
    t.end();
});

const cli = fileURLToPath(new URL('../scripts/check-tag-cli.js', import.meta.url));
const {version} = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

test('cloudcmd-electron: check-tag: cli: exits with 0 when the tag matches', (t) => {
    const {status} = spawnSync(process.execPath, [cli], {
        env: {
            ...process.env,
            GITHUB_REF: `refs/tags/v${version}`,
        },
    });

    t.equal(status, 0);
    t.end();
});

test('cloudcmd-electron: check-tag: cli: prints the reason when the tag differs', (t) => {
    const {stderr} = spawnSync(process.execPath, [cli], {
        env: {
            ...process.env,
            GITHUB_REF: 'refs/tags/v0.0.1',
        },
    });

    const result = String(stderr).includes('does not match');

    t.ok(result);
    t.end();
});

test('cloudcmd-electron: check-tag: cli: exits with 1 when GITHUB_REF is not set', (t) => {
    const env = {
        ...process.env,
    };

    delete env.GITHUB_REF;

    const {status} = spawnSync(process.execPath, [cli], {
        env,
    });

    t.equal(status, 1);
    t.end();
});

test('cloudcmd-electron: check-tag: cli: exits with 1 when the tag differs', (t) => {
    const {status} = spawnSync(process.execPath, [cli], {
        env: {
            ...process.env,
            GITHUB_REF: 'refs/tags/v0.0.1',
        },
    });

    t.equal(status, 1);
    t.end();
});

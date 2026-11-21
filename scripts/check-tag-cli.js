import process from 'node:process';
import {readFileSync} from 'node:fs';
import {checkTag} from './check-tag.js';

const {version} = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const [error] = checkTag(process.env.GITHUB_REF || '', version);

if (error) {
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
}

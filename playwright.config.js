import process from 'node:process';
import {defineConfig} from '@playwright/test';

// Tests start the packaged application from "dist", so run "npm run dist" first.
export default defineConfig({
    testDir: './test-e2e',
    timeout: 60_000,
    workers: 1,
    fullyParallel: false,
    forbidOnly: Boolean(process.env.CI),
    reporter: 'list',
    outputDir: 'test-results',
    expect: {
        timeout: 15_000,
    },
});

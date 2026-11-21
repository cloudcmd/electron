# Cloud Commander Desktop [![Release][BUILD_IMG]][BUILD_URL]

Desktop version of [Cloud Commander](https://cloudcmd.io): the file manager with console and terminal, in an Electron window.

[BUILD_IMG]: https://github.com/cloudcmd/electron/actions/workflows/release.yml/badge.svg
[BUILD_URL]: https://github.com/cloudcmd/electron/actions/workflows/release.yml

## Download

Builds are attached to [releases of Cloud Commander](https://github.com/coderaiser/cloudcmd/releases):

| Platform | Files |
|---|---|
| Windows | `cloudcmd-v<version>-win32-x64.zip`, `.exe` (also `arm64`) |
| macOS | `cloudcmd-v<version>-darwin-x64.dmg`, `-darwin-arm64.dmg` (and `.zip`) |
| Linux | `cloudcmd-v<version>-linux-x64.AppImage`, `.deb` (also `arm64`) |

## Development

Node.js >= 22 is needed.

```sh
npm ci
npm start          # run in Electron
npm test           # tests
npm run coverage   # tests with 100% coverage check
npm run lint
npm run dist       # build installers into ./dist for the current platform
```

## Release

Push a tag equal to the version of `package.json`:

```sh
git tag v19.24.0
git push origin v19.24.0
```

The workflow `release.yml` runs lint and tests with 100% coverage, builds on 6 runners (Linux, Windows, macOS; x64 and arm64) and uploads the files to the release `v<version>` of `coderaiser/cloudcmd`. The release must exist. The secret `CLOUDCMD_RELEASES_TOKEN` needs write access to `coderaiser/cloudcmd`.

## License

MIT

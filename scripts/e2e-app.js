import path from 'node:path';

const suffix = (arch) => arch === 'x64' ? '' : `-${arch}`;

// directories and binaries that electron-builder makes with the "dir" target
const resolvers = {
    linux: (arch) => [`linux${suffix(arch)}-unpacked`, 'cloudcmd'],
    win32: (arch) => [`win${suffix(arch)}-unpacked`, 'cloudcmd.exe'],
    darwin: (arch) => [`mac${suffix(arch)}`, 'cloudcmd.app/Contents/MacOS/cloudcmd'],
};

export const getAppPath = ({platform, arch, dist = 'dist'}) => {
    const resolve = resolvers[platform];
    
    if (!resolve)
        throw Error(`Platform ${platform} is not supported`);
    
    const [directory, binary] = resolve(arch);
    
    return path.posix.join(dist, directory, binary);
};

// the setuid sandbox of Chromium does not work on CI runners of linux
export const getLaunchArgs = (platform) => platform === 'linux' ? ['--no-sandbox'] : [];

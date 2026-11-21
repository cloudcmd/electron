export const checkTag = (ref, version) => {
    const tag = ref.replace('refs/tags/', '');
    
    if (tag === `v${version}`)
        return [null];
    
    return [Error(`Tag ${tag} does not match version ${version} of package.json`)];
};

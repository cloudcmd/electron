const fake = new URL('./electron-fake.js', import.meta.url).href;

export const resolve = (specifier, context, nextResolve) => {
    if (specifier === 'electron')
        return {
            url: fake,
            shortCircuit: true,
        };

    return nextResolve(specifier, context);
};

declare const _default: {
    optimizeDeps: {
        exclude: never[];
    };
    resolve: {
        conditions: string[];
        dedupe: string[];
        tsconfigPaths: true;
    };
    test: {
        exclude: string[];
        fakeTimers: {
            toFake: undefined;
        };
        sequence: {
            concurrent: true;
        };
        server: {
            deps: {
                inline: string[];
            };
        };
        setupFiles: string[];
    };
};
export default _default;

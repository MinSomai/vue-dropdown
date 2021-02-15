'use strict';

module.exports = {
    mode: 'production',
    devtool: 'source-map',
    performance: { hints: false },
    stats: 'minimal',
    resolve: {
        extensions: ['.wasm', '.mjs', '.js', '.json', '.vue', '.ts'],
        fallback: {util: false},
        alias: {
            '@vue/test-utils': '@vue/test-utils/dist/vue-test-utils.esm-bundler.js'
        }
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: { cacheDirectory: true }
                    },
                    { loader: 'ts-loader' }
                ]
            }
        ]
    }
};

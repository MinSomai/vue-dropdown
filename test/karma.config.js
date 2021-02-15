'use strict';
const webpackConfig = require('./webpack.config');

module.exports = function (config) {
    const option = {
        frameworks: ['mocha', 'webpack'],
        reporters: ['mocha'],
        port: 4096,
        logLevel: config.LOG_INFO,
        browsers: ['ChromeHeadless'],
        autoWatch: false,
        singleRun: true,
        concurrency: Infinity,
        files: [
            './**/*.spec.js'
        ],
        preprocessors: {
            './**/*.spec.js': ['webpack']
        },
        webpack: webpackConfig
    };
    config.set(option);
};

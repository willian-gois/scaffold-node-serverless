const path = require('path');
const slsw = require('serverless-webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
    mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
    devtool: slsw.lib.webpack.isLocal ? 'source-map' : false,
    entry: slsw.lib.entries,
    target: 'node',
    resolve: {
        extensions: ['.cjs', '.mjs', '.js', '.ts'],
        plugins: [new TsconfigPathsPlugin()],
    },
    // Anything that will be available to the bundled code in the runtime 
    // environment and does not need to be included in any of the bundles.
    // 
    // In AWS Lambda, the `aws-sdk` is available and we almost certainly want to 
    // exclude it from our bundle(s). Similarly, because it's a Node lambda, 
    // Node's native modules will also be available. 
    externals: ['aws-sdk', nodeExternals()],
    resolve: {
        extensions: ['.ts', '.js'],
    },
    output: {
        libraryTarget: 'commonjs2',
        path: path.join(__dirname, '.webpack'),
        filename: '[name].js',
        sourceMapFilename: '[file].map'
    },
    module: {
        // Instruct Webpack to use the `ts-loader` for any TypeScript files, else it
        // won't know what to do with them. 
        rules: [
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                exclude: [
                    [
                        path.resolve(__dirname, 'node_modules'),
                        path.resolve(__dirname, '.webpack'),
                        path.resolve(__dirname, '.serverless'),
                    ],
                ],
                // And here we have options for ts-loader
                // https://www.npmjs.com/package/ts-loader#options
                options: {
                    // Disable type checking, this will lead to improved build times
                    transpileOnly: true,
                    // Enable file caching, can be quite useful when running offline
                    experimentalFileCaching: true,
                },
            },
        ],
    },
    // We still want type checking, just without the burden on build performance, 
    // so we use a plugin to take care of it on another thread.
    plugins: [new ForkTsCheckerWebpackPlugin()],
};

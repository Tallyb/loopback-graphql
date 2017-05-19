'use strict';
var nodeExternals = require('webpack-node-externals');
var webpack = require('webpack');
var path = require('path');
//var fs = require('fs');

/* helper function to get into build directory */
var distPath = function(name) {
    if (undefined === name) {
        return path.join('dist');
    }

    return path.join('dist', name);
};

var webpack_opts = {
    entry: './src/index.ts',
    target: 'node',
    output: {
        filename: distPath('index.js'),
        libraryTarget: 'commonjs2',
        sourceMapFilename: '[file]_map'
    },
    resolve: {
        extensions: ['.ts', '.js'],
        modules: [
            'node_modules',
            'src'
        ]
    },
    plugins: [
        new webpack.LoaderOptionsPlugin({
            options: {
                test: /\.ts$/,
                ts: {
                    compiler: 'typescript',
                    configFileName: 'tsconfig.json'
                },
                tslint: {
                    emitErrors: true,
                    failOnHint: true
                }
            }
        })
    ],
    devtool: 'source-map',
    module: {
        loaders: [{
            test: /\.ts$/,
            loaders: 'awesome-typescript-loader'
        }]
    },
    externals: [nodeExternals()]
};

module.exports = webpack_opts;

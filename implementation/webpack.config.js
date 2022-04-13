const path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = [
    {
        mode: 'development',
        devtool: 'source-map',
        entry: './customScripts/dtApp',
        output: {
            path: path.resolve(__dirname, './dist'),
            filename: 'dtBundle.js',
            library: 'DynatraceLib',
            libraryTarget: 'umd'
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: './dt_worldmap.html',
                inject: 'body',
                scriptLoading: 'module'
            })
        ],
        module: {
            rules: [
                { test: /.css$/, use: ['style-loader', 'css-loader'] },
                { test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/ },
                { test: /.ts$/, use: 'ts-loader' },
                {
                    test: /\.(png|jpe?g|svg)$/,
                    loader: 'file-loader',
                    options: {
                      name: '[name].[ext]',
                    },
                  },
            ]
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js', '.json']
        }
    },
    // {
    //     mode: 'development',
    //     devtool: 'source-map',
    //     entry: './customScripts/iVolApp.ts',
    //     output: {
    //         path: path.resolve(__dirname, './dist'),
    //         filename: 'iVolBundle.js',
    //         library: 'IVolLib',
    //         libraryTarget: 'umd'
    //     },
    //     plugins: [
    //         new HtmlWebpackPlugin({
    //             template: './ivolunteer_-_map.html',
    //             inject: 'body',
    //             scriptLoading: 'module'
    //         })
    //     ],
    //     module: {
    //         rules: [
    //             { test: /.css$/, use: ['style-loader', 'css-loader'] },
    //             { test: /.ts$/, use: 'ts-loader' },
    //         ]
    //     },
    //     resolve: {
    //         extensions: ['.ts', '.js', '.json']
    //     }
    // },  
];
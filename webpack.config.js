const path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = [
    {
        mode: 'development',
        devtool: 'source-map',
        entry: './customScripts/dtApp.js',
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
                {
                    test: /\.css$/,
                    use: [
                        'style-loader',
                        'css-loader',
                    ],
                },
            ]
        }
    },
    {
        mode: 'development',
        devtool: 'source-map',
        entry: './customScripts/iVolApp.js',
        output: {
            path: path.resolve(__dirname, './dist'),
            filename: 'iVolBundle.js',
            library: 'IVolLib',
            libraryTarget: 'umd'
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: './ivolunteer_-_map.html',
                inject: 'body',
                scriptLoading: 'module'
            })
        ],
        module: {
            rules: [
                {
                    test: /\.css$/,
                    use: [
                        'style-loader',
                        'css-loader',
                    ],
                },
            ],
        }
    },  
];
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = [
    {
        mode: 'development',
        devtool: 'source-map',
        entry: './src/customCode/dtApp',
        output: {
            path: path.resolve(__dirname, './dist'),
            filename: 'dtBundle.js',
            library: 'DynatraceLib',
            libraryTarget: 'umd'
        },
        devServer: {
            static: './dist',
            port: 21191,
            hot: true,
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: './src/index.html',
                inject: 'body',
                scriptLoading: 'module'
            }),
            new CopyPlugin({
                patterns: [
                  { from: "./src/axure", to: "axure" },
                  { from: "./src/customCode/data/geodata", to: "data/geodata" },
                  { from: "./src/customCode/styles", to: "styles" },
                ]
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
                      name: 'img/[name].[ext]',
                    },
                }
            ]
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js', '.json']
        }
    },
    // {
    //     mode: 'development',
    //     devtool: 'source-map',
    //     entry: './src/customCode/iVolApp',
    //     output: {
    //         path: path.resolve(__dirname, './dist'),
    //         filename: 'iVolBundle.js',
    //         library: 'IVolLib',
    //         libraryTarget: 'umd'
    //     },
    //     devServer: {
    //         static: './dist',
    //         port: 21191,
    //         hot: true,
    //     },
    //     plugins: [
    //         new HtmlWebpackPlugin({
    //             template: './src/index.html',
    //             inject: 'body',
    //             scriptLoading: 'module'
    //         }),
    //         new CopyPlugin({
    //             patterns: [
    //               { from: "./src/axure", to: "axure" },
    //               { from: "./src/customCode/data/geodata", to: "data/geodata" },
    //               { from: "./src/customCode/styles", to: "styles" },
    //             ]
    //         })
    //     ],
    //     module: {
    //         rules: [
    //             { test: /.css$/, use: ['style-loader', 'css-loader'] },
    //             { test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/ },
    //             { test: /.ts$/, use: 'ts-loader' },
    //             {
    //                 test: /\.(png|jpe?g|svg)$/,
    //                 loader: 'file-loader',
    //                 options: {
    //                   name: 'img/[name].[ext]',
    //                 },
    //             }
    //         ]
    //     },
    //     resolve: {
    //         extensions: ['.tsx', '.ts', '.js', '.json']
    //     }
    // },  
];
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const path = require('path');
const PRODUCTION = "production";
const DEVELOPMENT = "development";

module.exports = (env, argv) => {
    const isProductionPack = argv.mode === PRODUCTION;
    return {
        resolve: {
            extensions: ['.tsx', '.ts', '.jsx', '.js']
        }, module: {
            rules: [{
                test: /\.(tsx|ts)$/, exclude: /node_modules/, use: {
                    loader: 'babel-loader', options: {
                        presets: ['@babel/preset-env', '@babel/preset-typescript', '@babel/preset-react']
                    }
                }
            }, {
                test: /\.(jsx|js)$/, exclude: /node_modules/, use: {
                    loader: 'babel-loader', options: {
                        presets: ['@babel/preset-env', '@babel/preset-react']
                    }
                }
            }, {
                test: /\.css$/i, exclude: /\.module\.css$/, use: ['style-loader', 'css-loader']
            }, {
                test: /\.module\.css$/i, use: ['style-loader', {
                    loader: 'css-loader', options: {
                        modules: {
                            namedExport: false
                        }
                    }
                }]
            },]
        }, output: {
            clean: true
        }, plugins: [
            new webpack.DefinePlugin({PARKING_API_HOST: JSON.stringify(isProductionPack ? "https://api.sensade.com" : "http://localhost:8080/")}),
            new webpack.DefinePlugin({PARKING_API_BASE_URI: JSON.stringify(isProductionPack ? "" : "/parking")}),
            new HtmlWebpackPlugin({
                template: path.join(__dirname, 'public', 'index.html')
            })], devServer: {
            proxy: [{
                context: ["/parking"],
                target: "https://api.sensade.com",
                changeOrigin: true,
                secure: false,
                pathRewrite: {"^/parking": ""}
            },],
        },
    }
}
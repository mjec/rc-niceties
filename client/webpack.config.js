const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const yml = require('node-yaml');
const webpack = require('webpack');

const config = yml.readSync(path.join(__dirname, 'config.yml'));
const NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = {
  entry: [path.join(__dirname, 'src/js/index')],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: [/node_modules/],
        loaders: ['babel-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html'
    }),
    new webpack.DefinePlugin(
      Object.keys(config[NODE_ENV]).reduce((acc, key) => {
        acc[key] = JSON.stringify(config[NODE_ENV][key]);
        return acc;
      }, {})
    )
  ],
  mode: NODE_ENV === 'production' ? 'production' : 'development',
  devServer: {
    port: process.env.PORT || 8000
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  output: {
    filename: '[name].[chunkhash].bundle.js',
    path: path.join(__dirname, 'dist')
  },
  stats: 'normal'
};

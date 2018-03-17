var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var yml = require('node-yaml');  
var webpack = require('webpack');

var config = yml.readSync(path.join(process.cwd(), 'config.yml'));
var NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = {
  entry: [
    path.join(process.cwd(), 'src/js/index')
  ],
  module: {
    rules:[
      {
        test: /\.js$/,
        exclude: [/node_modules/],
        loaders: ['babel-loader']
      }
    ] 
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html'
    }),
    new webpack.DefinePlugin(Object.keys(config[NODE_ENV])
      .reduce(function(acc, key) {
        acc[key] = JSON.stringify(config[NODE_ENV][key]);
        return acc;
      }, {})
    )
  ],
  mode: NODE_ENV === 'production' ? 'production' : 'development',
  devServer: {
    port: process.env.PORT || 8000
  },
  output: {
    filename: '[name].[chunkhash].bundle.js',
    path: path.join(process.cwd(), 'dist'),
  },
  stats: 'normal'
}

var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');


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
    })
  ],
  devServer: {
    port: process.env.PORT || 3000
  },
  output: {
    filename: 'bundle.js',
    path: path.join(process.cwd(), 'dist'),
  },
  stats: 'normal'
}

var webpack = require('webpack');
var path = require('path');

module.exports = {
  devtool: 'source-map',
  entry: {
    signalerjs: 'index.js',
    'signalerjs.min': 'index.js'
  },
  module: {
    rules: [{test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/}]
  },
  output: {
    filename: 'dist/[name].js',
    libraryTarget: 'umd',
    library: 'signalerjs'
  },
  resolve: {
    modules: [
      path.resolve('src'),
      'node_modules'
    ],
    extensions: ['.js']
  },
   plugins: [
     new webpack.LoaderOptionsPlugin({
      minimize: true
    }),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      include: /\.min\.js$/,
      sourceMap: true
    })
  ]
};

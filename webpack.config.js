const webpack = require('webpack');

module.exports = {
  entry: './src',
  module: {
    loaders: [
      {test: /\.js$/, loader: 'babel', exclude: /node_modules/}
    ]
  },
  output: {
    filename: 'dist/signalerjs.min.js',
    libraryTarget: 'umd',
    library: 'signalerjs'
  },
  resolve: {
    extensions: ['', '.js'],
    modulesDirectories: ['node_modules', 'src'],
    fallback: __dirname
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
  ]
};

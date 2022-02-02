const webpack = require('webpack');

module.exports = {
  entry: './src',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [['@babel/preset-env', {targets: 'defaults'}]]
          }
        }
      },
    ]
  },
  output: {
    filename: 'signalerjs.min.js',
    libraryTarget: 'umd',
    library: 'signalerjs'
  },
  resolve: {
    extensions: ['', '.js'],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    })
  ]
};

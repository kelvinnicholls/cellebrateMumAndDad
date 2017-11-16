var path = require('path');

var webpack = require('webpack');
var webpackMerge = require('webpack-merge');
var commonConfig = require('./webpack.config.common.js');


console.log("webpack.config.prod.js");

module.exports = dev => {
  return webpackMerge.smart(commonConfig, {
    entry: {
      'app': './src/app/main.aot.ts'
    },

    output: {
      path: path.resolve(__dirname + '/server/public/js/app'),
      filename: 'bundle.js',
      publicPath: '/js/app/',
      chunkFilename: '[id].chunk.js'
    },

    module: {
      rules: [{
        test: /\.ts$/,
        use: [
          'awesome-typescript-loader',
          'angular2-template-loader',
          'angular-router-loader?aot=true'
        ]
      }]
    },

    plugins: [
      new webpack.optimize.UglifyJsPlugin({
        sourceMap: false
      })
    ]
  })
};

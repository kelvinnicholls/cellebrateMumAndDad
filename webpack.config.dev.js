var path = require('path');
var webpack = require('webpack');
var webpackMerge = require('webpack-merge');
var commonConfig = require('./webpack.config.common.js');

//Console.log("webpack.config.dev.js");

module.exports = env => {
  return webpackMerge(commonConfig, {
    devtool: 'cheap-module-eval-source-map',

    output: {
      path: path.resolve(__dirname + '/server/public/js/app'),
      publicPath: "/js/app/",
      filename: 'bundle.js',
      publicPath: '/js/app/',
      chunkFilename: '[id].chunk.js'
    },
    module: {
      rules: [{
        test: /\.ts$/,
        use: [{
            loader: 'awesome-typescript-loader',
            options: {
              transpileOnly: true
            }
          },
          {
            loader: 'angular2-template-loader'
          },
          {
            loader: 'angular-router-loader'
          }
        ]
      }]

    }
  })
};

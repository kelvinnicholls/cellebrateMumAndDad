// Karma configuration file, see link for more information
// https://karma-runner.github.io/0.13/config/configuration-file.html

// module.exports = function (config) {
//   config.set({
//     basePath: '',
//     //frameworks: ['jasmine', '@angular/cli'],
//     frameworks: ['jasmine'],
//     plugins: [
//       require('karma-jasmine'),
//       require('karma-chrome-launcher'),
//       require('karma-jasmine-html-reporter'),
//       require('karma-coverage-istanbul-reporter')
//       //require('@angular/cli/plugins/karma')
//     ],
//     client: {
//       clearContext: false // leave Jasmine Spec Runner output visible in browser
//     },
//     // list of files / patterns to load in the browser
//     // files: [
//     //   '**/*.spec.ts'
//     // ],
//     files : [
//       "./src/xtest.ts"
//     ],
//     include : [
//       "./src/**/*.xspec.ts"
//     ],
//     coverageIstanbulReporter: {
//       reports: ['html', 'lcovonly'],
//       fixWebpackSourcePaths: true
//     },
//     // angularCli: {
//     //   environment: 'dev'
//     // },
//     phantomJsLauncher: {
//       exitOnResourceError: true
//     },
//     reporters: ['progress', 'kjhtml', 'dots'],
//     port: 9876,
//     colors: true,
//     logLevel: config.LOG_INFO,
//     autoWatch: true,
//     //browsers: ['Chrome', 'PhantomJS'],
//     browsers: ['Chrome'],
//     singleRun: false
//   });
// };


// module.exports = function (config) {
//   config.set({
//     basePath: '',
//     frameworks: ['jasmine', '@angular/cli'],
//     plugins: [
//       require('karma-jasmine'),
//       require('karma-chrome-launcher'),
//       require('karma-jasmine-html-reporter'),
//       require('karma-coverage-istanbul-reporter'),
//       require('@angular/cli/plugins/karma')
//     ],
//     client:{
//       clearContext: false // leave Jasmine Spec Runner output visible in browser
//     },
//     coverageIstanbulReporter: {
//       reports: [ 'html', 'lcovonly' ],
//       fixWebpackSourcePaths: true
//     },
//     angularCli: {
//       environment: 'dev'
//     },
//     reporters: ['progress', 'kjhtml'],
//     port: 9876,
//     colors: true,
//     logLevel: config.LOG_INFO,
//     autoWatch: true,
//     browsers: ['Chrome'],
//     singleRun: false
//   });
// };

// module.exports = function (config) {
//   config.set({
//     basePath: '',
//     frameworks: ['jasmine'],
//     plugins: [
//       require('karma-jasmine'),
//       require('karma-chrome-launcher'),
//       require('karma-jasmine-html-reporter'),
//       require('karma-coverage-istanbul-reporter')
//     ],
//     client:{
//       clearContext: false // leave Jasmine Spec Runner output visible in browser
//     },
//     files: [
//       { pattern: 'test/main.js' }
//     ],
//     coverageIstanbulReporter: {
//       reports: [ 'html', 'lcovonly' ],
//       fixWebpackSourcePaths: true
//     },
//     reporters: ['progress', 'kjhtml'],
//     port: 9876,
//     colors: true,
//     logLevel: config.LOG_INFO,
//     autoWatch: true,
//     browsers: ['Chrome'],
//     singleRun: false
//   });
// };

// https://medium.com/@lacolaco/setting-up-angular-2-testing-environment-with-karma-and-webpack-e9b833befd99

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    files: [{
      pattern: 'test/main.js',
      watched: false
    }],
    exclude: [],
    preprocessors: {
      'test/main.js': ['webpack', 'sourcemap']
    },
    webpack: require('./webpack.config.dev'),
    customLaunchers: {
      Chrome_with_debugging: {
        base: 'Chrome',
        flags: ['--remote-debugging-port=9222'],
        debug: true
      }
    },
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['Chrome','IE','Firefox','PhantomJS'],
    singleRun: true,
    concurrency: Infinity
  })
}

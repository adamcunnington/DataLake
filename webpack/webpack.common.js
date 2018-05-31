var webpack = require('webpack');
var path = require('path');

var BUILD_DIR = path.resolve(__dirname, '../datalake/static/scripts/public');
var APP_DIR = path.resolve(__dirname, '../datalake/static/scripts/app');

var config = {
  entry: {
    monitoring: APP_DIR + '/monitoring.jsx',
    execution: APP_DIR + '/execution.jsx',
    schedules: APP_DIR + '/schedules.jsx',
    schedule: APP_DIR + '/schedule.jsx',
    adhoc: APP_DIR + '/adhoc.jsx'
  },
  output: {
    path: BUILD_DIR,
    filename: '[name].js'
  },
  module : {
    rules : [
      {
        test : /\.jsx?/,
        include : APP_DIR,
        loader : 'babel-loader'
      }, {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader'
        ]
      }, {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      }
    ]
  }
};

module.exports = config;
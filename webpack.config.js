var webpack = require('webpack');
var path = require('path');
var settings = require('./setting');

var config = {
  entry: {
    common:['react','react-redux','react-dom','redux','react-router'],
    index: ["./index.js"]
  },
  output: {
    publicPath: settings.WDS_URL + '/static/dist/',
    path: path.join(__dirname, '/static/dist/'),
    filename: '[name].bundle.js'
  },
  plugins: [
    new webpack.DefinePlugin(settings),
    new webpack.optimize.CommonsChunkPlugin('common', 'common.bundle.js'),
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.optimize.OccurenceOrderPlugin(), // OccurenceOrderPlugin，它会按引用频度来排序 ID，以便达到减少文件大小的效果
    // new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin() // 用来跳过编译时出错的代码并记录，使编译后运行时的包不会发生错误
  ],
  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /(node_modules|bower_components)/,
      loader: 'babel',
      query: {
        presets: ['react', 'es2015'],
        plugins: ['transform-runtime'],
        cacheDirectory:true
      }
    }, {
      test: /\.(less|css)?$/,
      exclude: /(node_modules|bower_components)/,
      loader: 'style!css!less'
    }, {
      test: /\.json$/,
      loader: 'json'
    }]
  },
  resolve: {
    extensions: ['', '.js', '.jsx', '.less']
  }
};

if (settings.__DEV__) {
  config.devtool = 'cheap-module-eval-source-map';
  config.plugins.push(new webpack.HotModuleReplacementPlugin());
}

module.exports = config;

var webpack = require('webpack');
var webpackDevServer = require('webpack-dev-server');
var webpackConfig = require('./webpack.config');
var settings = require('./setting');
var wds_url = settings.WDS_URL;
var port = wds_url.match(/\d+$/)[0];
var host = wds_url.replace(/http:\/\/(.*?)\b:\d+/,'$1').trim();

var options = {
    hot: false,
    noInfo: false,
    publicPath: webpackConfig.output.publicPath,
    headers: {
        "Access-Control-Allow-Origin": "*"
    },
    stats: {
        colors: true
    }
};

if (settings.__DEV__) {
    for (var entryName in webpackConfig.entry) {
        webpackConfig.entry[entryName].unshift('webpack-dev-server/client?' + wds_url, 'webpack/hot/dev-server');
    }

    Object.assign(options, {
        hot: true,
        noInfo: false,
        watchOptions: {
            aggregateTimeout: 300,
            poll: 1000
        }
    });
}

var child_process = require('child_process')
var compiler = webpack(webpackConfig);
var server = new webpackDevServer(compiler, options).listen(port, host, function() {
    console.info("==> 🌍  Open up %s in your browser.", wds_url);
    // child_process.exec('open ' + wds_url + '/views')
});

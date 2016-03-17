var webpack = require('webpack');
var CommonsPlugin = webpack.optimize.CommonsChunkPlugin;

var config = {
    cache:false,
    // watch: true,
    debug:true,
    entry: {
        'icalendar': './c/icalendar/index.js'
    },
    output: {
        path: 'c/',
        filename: '[name].bundle.js'
    },
    devtool: 'source-map',
    module: {
        loaders: [
            {test: /\.ejs$/, loader: 'ejs'},
            {test: /\.less$/, loader: 'style-loader!css-loader!less-loader'},
            {test: /\.css$/, loader: 'style-loader!css-loader'},
            {test: /\.(png|jpg)$/, loader: 'url-loader?limit=102400'}
        ]
    }
    //plugins: [new CommonsPlugin('common.js')]
};

module.exports = config;

//Helooo
const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// App files location
const PATHS = {
    app: path.resolve(__dirname, '../src'),
    appHtml: path.resolve(__dirname, '../src/index.html'),
    styles: path.resolve(__dirname, '../src/styles'),
    images: path.resolve(__dirname, '../src/images'),
    build: path.resolve(__dirname, '../build')
};

// console.log('PATHS', __dirname);

const plugins = [
    new HtmlWebpackPlugin({
        inject: true,
        // title: appName,
        template: PATHS.appHtml,
    }),
    new CleanWebpackPlugin([PATHS.build]),
    new CopyWebpackPlugin([{
        from: PATHS.images,
        to: 'images'
    }, {
        from: PATHS.styles,
        ignore: ['*.scss'],
        to: 'styles'
    }]),
    // Shared code
    new webpack.optimize.CommonsChunkPlugin('vendor', 'js/vendor.bundle.[chunkhash:8].js'),
    // Avoid publishing files when compilation fails
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production'),
        __DEV__: JSON.stringify(JSON.parse(process.env.DEBUG || 'false'))
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false
        }
    }),
    // This plugin moves all the CSS into a separate stylesheet
    new ExtractTextPlugin('css/app.[chunkhash:8].css', { allChunks: true })
];

const sassLoaders = [
    'css-loader?modules&sourceMap&localIdentName=[local]',
    'postcss-loader',
    'sass-loader?outputStyle=compressed'
];

module.exports = {
    entry: {
        app: path.resolve(PATHS.app, 'main.js'),
        vendor: ['react', 'react-dom']
    },
    output: {
        path: PATHS.build,
        filename: 'js/[name].[chunkhash:8].js',
        publicPath: '/'
    },
    stats: {
        colors: true
    },
    resolve: {
        // We can now require('file') instead of require('file.jsx')
        extensions: ['', '.js', '.jsx', '.scss']
    },
    module: {
        noParse: /\.min\.js$/,
        loaders: [{
                test: /\.jsx?$/,
                loaders: ['react-hot', 'babel'],
                include: PATHS.app
            }, {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract('style-loader', 'css?modules&sourceMap!sass?outputStyle=expanded')
            }, {
                test: /\.css$/,
                // include: PATHS.styles,
                loader: ExtractTextPlugin.extract('style', 'css?modules&sourceMap')
            }, {
                test: /\.css\?global$/,
                loader: ExtractTextPlugin.extract('style', 'css?sourceMap&modules&localIdentName=[local]'),
            },
            // Inline base64 URLs for <=8k images, direct URLs for the rest
            {
                test: /\.(png|jpg|jpeg|gif|svg)$/,
                loader: 'url-loader?limit=8192&name=images/[name].[ext]?[hash]'
            }, {
                test: /\.(woff|woff2)$/,
                loader: 'url-loader?limit=8192&name=fonts/[name].[ext]?[hash]'
            }
        ]
    },
    plugins: plugins,
    postcss: function() {
        return [autoprefixer({
            browsers: ['last 2 versions']
        })];
    },
    devtool: 'source-map'
};

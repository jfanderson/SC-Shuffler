var path = require('path');

module.exports = {
  entry: './app/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: 'dist/'
  },
  module: {
    loaders: [
      { test: /\.(js|jsx)$/, loader: 'babel-loader', exclude: /node_modules/ },
    ]
  },
  devtool: "cheap-eval-source-map",
  devServer: {
    port: 8080,
    historyApiFallback: true,
    setup: function(app) {
      app.get('/callback', function(req, res) {
        res.sendFile(__dirname + '/callback.html');
      });
    },
  }
};

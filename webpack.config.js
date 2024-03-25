// webpack.config.js
module.exports = {
    resolve: {
      fallback: {
        timers: require.resolve('timers-browserify')
      }
    }
    // Other configurations...
  };
  
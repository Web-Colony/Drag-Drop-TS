const path = require("path");

module.exports = {
  mode: "development",
  // the main file that webpack will look for first
  entry: "./src/app.ts",
  // the output options for bundling files
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    // just is needed for webpack-dev-server to continuously update the bundle.js
    publicPath: "dist",
  },
  // tells webpack to wire bundle through source maps that are generated later
  devtool: "inline-source-map",
  // tells webpack how to deal with loading multiple files
  module: {
    rules: [
      {
        // check filename first before bundle
        test: /\.ts$/,
        // use an external loader for typescript files
        use: "ts-loader",
        // exclude unnessary files
        exclude: /node_modules/,
      },
    ],
  },
  // tells webpack how to resolve multiple files
  resolve: {
    // extenstion to look for at bundle
    extensions: [".ts", ".js"],
  },
};

const path = require("path");
const CleanPlugin = require("clean-webpack-plugin");

module.exports = {
  mode: "production",
  // the main file that webpack will look for first
  entry: "./src/app.ts",
  // the output options for bundling files
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  // tells webpack to wire bundle through source maps that are generated later
  devtool: "none",
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
  plugins: [new CleanPlugin.CleanWebpackPlugin()],
};

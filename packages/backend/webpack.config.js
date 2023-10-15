const path = require('path');
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  entry: {
    securedRoutes: './src/lambda/securedRoutes.ts', 
    unsecuredRoutes: './src/lambda/unsecuredRoutes.ts', 
    sessionAuthorizer: './src/lambda/sessionAuthorizer.ts',
    createComparison: './src/lambda/createComparison.ts',
    downloadSpotifyPlaylists: './src/lambda/downloadSpotifyPlaylists.ts',
  },
  target: 'node18',
  output: {
    path: path.resolve(__dirname, '../cdk/lambda'),
    filename: '[name].js',
    libraryTarget: 'commonjs', // do not change when building for AWS Lambda!!!
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: 'ts-loader'
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  // externals: {
  //   'aws-sdk': "require('aws-sdk')",
  // },
  optimization: {
    usedExports: false,
    minimize: false,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: false,
          },
        },
        extractComments: false,
      }),
    ],
  },
  ignoreWarnings: [
    {
      module: /follow-redirects/,
    },
  ],
};
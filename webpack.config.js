const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/index.ts',
  output: {
    filename: 'index.js',
    path: path.join(__dirname, './dist'),
    library: {
      name: 'SassExtractVarsPlugin',
      type: 'umd',
    },
    publicPath: '/dist/',
  },
  resolve: {
    extensions: ['.ts'],
  },
  target: 'node',
  module: {
    rules: [
      {
        test: /\.ts?$/,
        loader: 'ts-loader',
        options: {
          compilerOptions: {
            noEmit: false,
          },
        },
      },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          mangle: {
            reserved: ['userFunction'],
          },
        },
      }),
    ],
  },
};

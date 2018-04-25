// [定数] webpack の出力オプションを指定します
// 'production' か 'development' を指定
const MODE = 'development';
 
// ソースマップの利用有無(productionのときはソースマップを利用しない)
const enabledSourceMap = (MODE === 'development');

const webpack = require('webpack');

module.exports = {
    // モード値を production に設定すると最適化された状態で、
    // development に設定するとソースマップ有効でJSファイルが出力される
    mode: MODE,
  
    // メインとなるJavaScriptファイル（エントリーポイント）
    entry: [
      './src/index.ts',
      // './src/splib/MicrosoftAjax.js',
      // './src/splib/sp.runtime.js',
      // './src/splib/sp.js',
      // './src/splib/sp.core.js',
      // './src/splib/sp.ui.controls.js',
      // './src/splib/Office.Controls.debug.js',
      // './src/splib/Office.Controls.PeoplePicker.js',
    ],

    // ファイルの出力設定
    output: {
      //  出力ファイルのディレクトリ名
      path: `${__dirname}/dist`,
      // 出力ファイル名
      filename: 'index.js'
    },
    
    module: {
      rules: [
        // tsファイルの読み込みとコンパイル
        {
          // 拡張子 .ts の場合
          test: /\.ts$/,
          // TypeScript をコンパイルする
          use: 'ts-loader'
        },
      ]
    },

    plugins: [
      new webpack.ProvidePlugin({
        $: "jquery",
        jQuery: "jquery",
        // "windows.jQuery": "jquery",
        Promise: "promise",
      })
    ],

    // import 文で .ts ファイルを解決するため
    resolve: {
      extensions: [
        '.ts',
        '.js',
      ],
      // Webpackで利用するときの設定
      alias: {
      }
    },
      
  };
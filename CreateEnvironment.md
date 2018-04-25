### 環境構築
1.https://www.npmjs.com/でパッケージ名を検索し、既存にないものをパッケージ名とする

1.git init
1..gitignoreファイルを作成
npm-debug.log
node_modules/

1.npm adduser
```
PS C:\Devprojects\NPM\sp-com> npm adduser
Username: aiprovide
Password:
Email: (this IS public) itaru.ando@aiprovide.com
Logged in as aiprovide on https://registry.npmjs.org/.
```

1.githubにリポジトリを作成

1.npm init
```
This utility will walk you through creating a package.json file.
It only covers the most common items, and tries to guess sensible defaults.

See `npm help json` for definitive documentation on these fields
and exactly what they do.

Use `npm install <pkg>` afterwards to install a package and
save it as a dependency in the package.json file.

Press ^C at any time to quit.
package name: (sp-com)
version: (1.0.0) 0.0.1
description: A library of common classes used for developing SharePoint addins.
entry point: (index.js)
test command: ava -v
git repository: https://github.com/Aiprovide/sp-com.git
keywords: sharepoint common library jsom addins sp-com
author: Aiprovide
license: (ISC) MIT
About to write to C:\Devprojects\NPM\sp-com\package.json:
```

1.npm i -D webpack webpack-cli webpack-dev-server
1.npm i -D ts-loader
1.npm i -D typescript
1.npm i -D jquery
1.npm i -D jquery-ui
1.npm i -D datatables.net
1.npm i -D jquery-treetable
1.npm i -D jquery.cookie

1.tsconfig.jsonを作成
node_modules/.bin/tsc --init
```javascript
{
  "compilerOptions": {
    "sourceMap": true,
    // TSはECMAScript 5に変換
    "target": "es5",
    // TSのモジュールはES Modulesとして出力
    "module": "es2015",
    "declaration": true,
    // import Vue from 'vue' の書き方を許容する
    "allowSyntheticDefaultImports": true,
    "lib": [
      "dom",
      "es2017"
    ],
    "moduleResolution": "node",
    // デコレーターを有効に設定
    "experimentalDecorators": true
  }
}
```

1.npm i -D @types/sharepoint
1.npm i -D @types/jquery
1.npm i -D @types/jqueryui
1.npm i -D @types/microsoft-ajax
1.npm i -D @types/datatables.net

1.package.jsonを修正
```javascript
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "webpack",
    "watch": "webpack --watch",
    "start": "webpack-dev-server",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
```

1..npmignoreファイルを作成
tsconfig.json
src
CreateEnvironment.md

1.webpack.config.jsを作成
```javascript
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
```

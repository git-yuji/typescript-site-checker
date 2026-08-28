# TypeScript Site Checker

URLを入力するとWebサイトのHTMLを取得し、公開前に確認したい項目を診断するTypeScript学習用アプリです。

## なぜTypeScriptを選んだか

JavaScriptを学びながら、型があることでどのようにミスを防げるのかを実際に経験したいと考え、TypeScriptを選びました。

このプロジェクトでは、次のような場面で型を使っています。

- 診断結果を`CheckResult`型に統一する
- 診断状態を`pass`、`warning`、`error`のUnion型に限定する
- APIの成功レスポンスとエラーレスポンスを区別する
- `HTMLFormElement`や`HTMLInputElement`など、操作するDOM要素を明確にする
- 診断関数の引数と戻り値を決め、新しい診断を安全に追加する

例えば、診断状態に想定外の文字列を指定した場合や、関数が診断結果を返していない場合は、実行前の型チェックで気づくことができます。実装中にも、条件分岐によって戻り値がない関数をTypeScriptが検出してくれたことで、型チェックの良さを実感できました。

まだTypeScriptを学習中ですが、型を付けることでデータの形や関数の役割が分かりやすくなり、機能追加や修正を安全に進めるために役立つと理解しています。

## 主な機能

- URLの入力チェック
- 対象サイトのHTML取得
- 診断中の状態表示
- エラー・警告・合格の件数表示
- 重要度順での診断結果表示
- URLを変更して再チェック

## 診断項目

- ページタイトル
- メタディスクリプション
- h1の個数
- OGP
- canonical URL
- favicon
- robots設定
- 画像のalt属性

診断結果は次の3段階で表示します。

| 状態 | 意味 |
| --- | --- |
| `pass` | 問題なし |
| `warning` | 確認または設定を推奨 |
| `error` | 公開前に修正が必要 |

## 必要な環境

- Node.js 22.12以上
- npm

## セットアップ

リポジトリを取得した後、依存パッケージをインストールします。

```bash
npm install
```

## 起動方法

```bash
npm run dev
```

ターミナルに表示されたURLをブラウザで開きます。通常は次のURLです。

```text
http://localhost:5173/
```

## 使い方

1. チェックしたいWebサイトのURLを入力する
2. 「チェックする」を押す
3. 診断結果と重要度ごとの件数を確認する
4. 必要に応じてURLを変更して再チェックする

入力できるのは`http`または`https`のURLです。

## テスト

すべてのテストを1回実行します。

```bash
npm test
```

ファイル変更時にテストを自動実行します。

```bash
npm run test:watch
```

## ビルド

TypeScriptの型チェックとViteのビルドを実行します。

```bash
npm run build
```

## 使用技術

- TypeScript
- Vite
- Vitest
- jsdom

## ファイル構成

```text
src/
├── checks.ts       # 診断ロジック
├── checks.test.ts  # 診断関数のテスト
├── main.ts         # 画面表示とAPI呼び出し
└── style.css       # スタイル

vite.config.ts      # HTML取得API
```

## 注意事項

HTML取得APIはViteの開発サーバー上で動作します。診断機能を利用するときは`npm run dev`で起動してください。

対象サイトの状態やアクセス制限によっては、HTMLを取得できない場合があります。取得処理は10秒でタイムアウトします。

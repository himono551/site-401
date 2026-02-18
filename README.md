# site 401 README（初心者向け・一本化）

このプロジェクトは、Obsidian の `Journal` を正本としてブログHTMLを生成します。

## まず覚えること（これだけ）

1. 記事は Obsidian 側の `Journal` に書く  
2. サイト側で `npm run build:journal` を実行する  
3. `index.html` / `archive.html` を開いて確認する  

## 正本ソースと出力先

- 正本（編集する場所）  
  `/Users/user/Library/Mobile Documents/iCloud~md~obsidian/Documents/Obsidian_iCloud/Journal`
- 出力（自動生成される場所）  
  `/Users/user/Documents/2026年/★personalworks/code/260203site401/generated`
- 一覧データ（自動生成される場所）  
  `/Users/user/Documents/2026年/★personalworks/code/260203site401/data/posts.json`

## フォルダ構成（このプロジェクト）

```text
260203site401
├── generated/                  # 生成HTMLとキャッシュ
├── data/posts.json             # 一覧表示データ（自動生成）
├── scripts/build-from-journal.mjs
├── legacy/                     # 旧資産（通常は触らない）
├── index.html
├── archive.html
├── post.html
└── js/
```

## 初回セットアップ

```bash
cd "/Users/user/Documents/2026年/★personalworks/code/260203site401"
npm install
```

## 普段の更新手順

1. Obsidian の `Journal` に記事を書く  
2. このプロジェクトで次を実行  

```bash
npm run build:journal
```

3. `archive.html` で記事一覧を確認する

このコマンドで実行されること:

- `Journal/*.md` -> `generated/*.html`
- `generated/.publish-cache.json` 再生成
- `data/posts.json` 再生成

## よく使うコマンド

- 通常生成  
  `npm run build:journal`
- `publish: true` の記事だけ生成  
  `npm run build:journal:published`
- frontmatter (`title` / `date`) も更新  
  `npm run build:journal:with-frontmatter`

## うまく表示されない時

1. `npm run build:journal` を再実行  
2. ブラウザをハードリロード  
3. `data/posts.json` の先頭に最新記事があるか確認  

## 補足

- 旧フローは `legacy/` に退避済みです。
- 旧コマンド `npm run build:posts` は互換用です（通常は不要）。

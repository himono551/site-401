# site 401 - ブログサイト

ピクセルフォントを使ったダークテーマのシンプルなブログサイトです。

## フォント

- **タイトル・ナビゲーション**: Bitcount Mono Single Regular Square
- **本文**: DotGothic16

## ファイル構造

```
site-401/
├── index.html           # トップページ
├── css/
│   ├── style.css       # メインスタイル
│   └── post.css        # 個別記事ページ用スタイル
├── js/
│   └── main.js         # ナビゲーション機能
├── posts/
│   └── site-open.html  # 個別記事（例）
└── README.md           # このファイル
```

## 機能

- **シングルページナビゲーション**: home/archive/about/contactは同一ページ内で切り替え
- **個別記事ページ**: 記事タイトルをクリックすると専用ページへ
- **レスポンシブ対応**: スマホでも見やすい

## GitHubとNetlifyでの公開・更新手順

### 1. 初回セットアップ

#### GitHubにアップロード

1. GitHubで新しいリポジトリを作成
   - リポジトリ名: 例 `site-401`
   - Public または Private を選択

2. ローカルでGitの初期化（コマンドライン）
   ```bash
   cd site-401
   git init
   git add .
   git commit -m "初回コミット: サイトの基本構造"
   git branch -M main
   git remote add origin https://github.com/あなたのユーザー名/site-401.git
   git push -u origin main
   ```

#### Netlifyで公開

1. [Netlify](https://www.netlify.com/)にログイン（GitHubアカウントで連携可）
2. 「Add new site」→「Import an existing project」を選択
3. GitHubを選択し、作成したリポジトリを選ぶ
4. Build settings:
   - Build command: 空欄のままでOK
   - Publish directory: `/` (ルートディレクトリ)
5. 「Deploy site」をクリック

→ これで自動デプロイが完了し、URLが発行されます！

### 2. 更新作業の流れ

記事を追加したり、デザインを変更したりする場合:

#### ローカルで編集

```bash
# 1. ファイルを編集（VSCodeなどで）

# 2. 変更を確認
git status

# 3. 変更をステージング（追加）
git add .

# 4. コミット（変更を記録）
git commit -m "新しい記事を追加"

# 5. GitHubにプッシュ（アップロード）
git push
```

#### 自動デプロイ

- GitHubに`push`すると、**Netlifyが自動的に検知して更新**されます
- 1〜2分でサイトに反映されます

### 3. 新しい記事の追加方法

1. `posts/`フォルダに新しいHTMLファイルを作成
   - ファイル名例: `2026-02-03-my-post.html`

2. `site-open.html`をコピーして内容を編集

3. `index.html`の記事リストに追加
   ```html
   <article class="post-item">
       <time class="post-date">2026.02.03</time>
       <h2 class="post-title"><a href="posts/2026-02-03-my-post.html">新しい記事のタイトル</a></h2>
   </article>
   ```

4. GitHubにプッシュ（上記の手順）

### 用語の説明

- **Git**: ファイルの変更履歴を管理するツール
- **GitHub**: Gitのデータを保存するオンラインサービス
- **commit（コミット）**: 変更を記録すること
- **push（プッシュ）**: ローカルの変更をGitHubにアップロードすること
- **Netlify**: Webサイトを公開するホスティングサービス

## トラブルシューティング

### Netlifyで更新が反映されない場合

1. Netlifyの管理画面で「Deploys」タブを確認
2. エラーが出ていないかチェック
3. 「Trigger deploy」→「Clear cache and deploy site」を試す

### フォントが表示されない場合

- インターネット接続を確認（Google Fontsから読み込むため）
- ブラウザのキャッシュをクリア

## カスタマイズ

### 色の変更

`css/style.css`の`:root`セクションで色を変更できます:

```css
:root {
    --bg-color: #3a3a3a;        /* 背景色 */
    --text-color: #ffffff;      /* テキスト色 */
    --link-color: #4a9eff;      /* リンク色 */
    --link-hover: #6ab4ff;      /* リンクホバー色 */
    --border-color: #666666;    /* ボーダー色 */
    --date-color: #cccccc;      /* 日付の色 */
}
```

### レイアウトの調整

- 記事一覧の表示件数: `index.html`の`#home`セクション内の記事を調整
- 最大幅: `css/style.css`の`body`の`max-width`を変更

## ライセンス

個人利用・改変自由です。

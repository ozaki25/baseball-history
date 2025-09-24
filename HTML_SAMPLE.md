# 日本ハム公式サイト HTML構造分析

## サンプル情報

- **試合**: ビジターゲーム（京セラD大阪）
- **結果**: ファイターズ勝利 6-3 vs オリックス
- **日付**: 2024.05.05 SUN

## 重要な構造要素

### 1. 試合結果スコア部分

```html
<div class="game-vs-teams__team-score game-vs-teams__team-score--game-end">
  <span>3</span><i></i><em>6</em>
</div>
```

- `<span>3</span>` = オリックス（相手）のスコア
- `<em>6</em>` = ファイターズ（自分）のスコア
- **重要**: ファイターズのスコアは`<em>`タグ内

### 2. チーム情報

```html
<div class="game-vs-teams__team">
  <div class="game-vs-teams__team-stadium">ホーム</div>
  <div class="game-vs-teams__team-logo">
    <span><img src="/media/sites/2/common/teamlogo/2024/logo_2005002_l.png" alt="" /></span>
  </div>
</div>
```

- **ホーム**: オリックス（相手チーム）
- **ビジター**: ファイターズ（自分のチーム）

### 3. 球場情報

```html
<div class="game-vs__text">京セラD大阪</div>
```

### 4. 試合状態

```html
<div class="game-vs__status">試合終了</div>
```

### 5. 詳細スコアボード

```html
<div class="c-score-board-table-score-result-body">
  <div class="c-score-board-table-score-result-body-cell">6</div>
  <div class="c-score-board-table-score-result-body-cell">10</div>
</div>
<div class="c-score-board-table-score-result-body">
  <div class="c-score-board-table-score-result-body-cell">3</div>
  <div class="c-score-board-table-score-result-body-cell">8</div>
</div>
```

- **1行目**: ファイターズ（6点、10安打）
- **2行目**: オリックス（3点、8安打）

## 対戦相手特定パターン

### チーム情報セクション

```html
<div class="c-game-detail__header-text">オリックス</div>
```

### スタメン部分

```html
<div class="c-game-team-tabs-tab-button"><span>オリックス</span></div>
<div class="c-game-team-tabs-tab-button is-active"><span>北海道日本ハム</span></div>
```

- `is-active`クラスがついているのがファイターズ

## パースロジック設計

### 1. 対戦相手抽出

- セレクター: `.c-game-detail__header-text`
- ファイターズ以外のチーム名を取得

### 2. スコア抽出

- セレクター: `.game-vs-teams__team-score span` (相手)
- セレクター: `.game-vs-teams__team-score em` (自分)

### 3. 球場抽出

- セレクター: `.game-vs__text`

### 4. ホーム/ビジター判定

- セレクター: `.game-vs-teams__team-stadium`
- "ビジター" = アウェイゲーム

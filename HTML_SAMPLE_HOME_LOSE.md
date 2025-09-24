# ファイターズ公式サイト HTML構造分析 - ホームゲーム負けパターン

## 試合基本情報

- **日付**: 2024.05.23 THU
- **対戦**: ファイターズ vs オリックス
- **会場**: エスコンフィールド（ホーム）
- **結果**: 3-9 でファイターズ負け
- **観客数**: 22,067人

## 重要なDOM構造分析

### 1. ホーム/ビジター表示

```html
<div class="game-vs-teams">
  <div class="game-vs-teams__team">
    <div class="game-vs-teams__team-stadium">ホーム</div>
    <div class="game-vs-teams__team-logo">
      <span><img src="/media/sites/2/common/teamlogo/2024/logo_2004001_l.png" alt="" /></span>
    </div>
  </div>
  <div class="game-vs-teams__team-score game-vs-teams__team-score--game-end">
    <span>3</span><i></i><em>9</em>
  </div>
  <div class="game-vs-teams__team">
    <div class="game-vs-teams__team-stadium">ビジター</div>
    <div class="game-vs-teams__team-logo">
      <span><img src="/media/sites/2/common/teamlogo/2024/logo_2005002_l.png" alt="" /></span>
    </div>
  </div>
</div>
```

### 2. 重要な発見: スコア構造の変化

**前回（ビジターゲーム・ファイターズ勝利）**:

```html
<span>6</span><i></i><em>3</em>
```

- span: 6（相手チーム）
- em: 3（ファイターズ）

**今回（ホームゲーム・ファイターズ負け）**:

```html
<span>3</span><i></i><em>9</em>
```

- span: 3（ファイターズ）
- em: 9（相手チーム）

### 3. 球場情報

```html
<div class="game-vs__text">エスコンフィールド</div>
```

### 4. 対戦チーム特定

```html
<div class="c-game-detail__header-text">オリックス</div>
<div class="c-game-detail__header-text">北海道日本ハム</div>
```

## パターン分析の結論

### スコア表示ルール

1. **ホームゲーム時**: span=ファイターズスコア, em=相手スコア
2. **ビジターゲーム時**: span=相手スコア, em=ファイターズスコア

### チーム表示順序

- 上段: ホームチーム
- 下段: ビジターチーム

### ファイターズスコア判定方法

1. `game-vs-teams__team-stadium` でホーム/ビジターを確認
2. ファイターズのロゴ（logo_2004001）の位置を特定
3. その位置に基づいてspan/emのどちらがファイターズかを判定

このパターンを元に、より正確なparseGameHTML関数を実装できます。

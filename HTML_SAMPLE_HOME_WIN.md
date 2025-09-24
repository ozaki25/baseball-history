# HTMLサンプル - ホームゲーム勝利（サヨナラ勝ち）

## 試合情報

- **日付**: 2024年5月12日（日）
- **対戦**: 北海道日本ハム vs 千葉ロッテ
- **会場**: エスコンフィールド（ホーム）
- **結果**: ファイターズ6x-5勝利（サヨナラ勝ち）
- **スコア表示の特徴**: サヨナラ勝ちのため「6x」の特殊表示

## 重要なDOM要素の構造

### 1. チーム名の取得

```html
<div class="c-game-detail__header-text">千葉ロッテ</div>
<div class="c-game-detail__header-text">北海道日本ハム</div>
```

### 2. ホーム/ビジター判定とスコア

```html
<div class="game-vs-teams">
  <div class="game-vs-teams__team">
    <div class="game-vs-teams__team-stadium">ホーム</div>
    <div class="game-vs-teams__team-logo">
      <span><img src="/media/sites/2/common/teamlogo/2024/logo_2004001_l.png" alt="" /></span>
    </div>
  </div>
  <div class="game-vs-teams__team-score game-vs-teams__team-score--game-end">
    <em>6x</em><i></i><span>5</span>
  </div>
  <div class="game-vs-teams__team">
    <div class="game-vs-teams__team-stadium">ビジター</div>
    <div class="game-vs-teams__team-logo">
      <span><img src="/media/sites/2/common/teamlogo/2024/logo_1992001_l.png" alt="" /></span>
    </div>
  </div>
</div>
```

### 3. 球場情報

```html
<div class="game-vs__text">エスコンフィールド</div>
```

## スコア構造の分析

### ホームゲーム時のスコア表示パターン

- **ファイターズがホーム（上側）**: em要素 = ファイターズスコア
- **相手チームがビジター（下側）**: span要素 = 相手チームスコア
- **サヨナラ勝ちの場合**: 「6x」のように「x」が付く

### logo_2004001との関係

- `logo_2004001` = ファイターズのロゴ
- ホーム側（上側）にファイターズロゴが表示されている

## 4パターンの比較まとめ

| パターン     | ファイターズ | 会場               | ロゴ位置 | スコア構造      |
| ------------ | ------------ | ------------------ | -------- | --------------- |
| ビジター勝利 | ビジター     | 京セラドーム       | 下側     | span=F, em=相手 |
| ホーム負け   | ホーム       | エスコンフィールド | 上側     | em=F, span=相手 |
| ビジター引分 | ビジター     | ZOZOマリン         | 下側     | span=F, em=相手 |
| ホーム勝利   | ホーム       | エスコンフィールド | 上側     | em=F, span=相手 |

### DOM解析による判定ロジック

1. **ホーム/ビジター判定**: `logo_2004001`が上側（最初の team）にあるかで判定
2. **スコア抽出**: ホームなら em=F/span=相手、ビジターなら span=F/em=相手
3. **相手チーム特定**: `c-game-detail__header-text`から「北海道日本ハム」以外を抽出

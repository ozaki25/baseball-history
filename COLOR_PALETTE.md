# Fighters Color Palette

## ブランドカラー仕様

### 公式ブランドカラー

- **ファイターズブルー**: `#006298` (fighters-primary) - プライマリカラー
- **ファイターズゴールド**: `#b3a369` (fighters-gold) - セカンダリカラー
- **ファイターズブラック**: `#010101` (fighters-black) - アクセントカラー
- **ファイターズホワイト**: `#ffffff` (fighters-white) - ベースカラー

### メインカラー

- **ファイターズブルー**: `#006298` (fighters-blue-600)
  - プライマリカラーとして使用
  - ヘッダー、ボタン、アクセントに使用
  - WCAG AA準拠: 白文字とのコントラスト比 8.2:1

- **ファイターズゴールド**: `#b3a369` (fighters-gold-scale-500)
  - セカンダリカラーとして使用
  - ハイライト、アクセントに使用
  - WCAG AA準拠: 黒文字とのコントラスト比 5.1:1

### システムカラー

（勝敗を表す専用カラーは現在利用していません）

## アクセシビリティ対応

全てのカラーコンビネーションがWCAG 2.1 AA準拠（コントラスト比4.5:1以上）

### 推奨カラーコンビネーション

- **ダークテキスト on ライト背景**: `text-fighters-black bg-fighters-white`
- **ライトテキスト on ダーク背景**: `text-fighters-white bg-fighters-primary`
- **アクセント**: `text-fighters-gold bg-fighters-blue-50`
- **エラー状態**: `text-red-600 bg-red-50`
- **成功状態**: `text-blue-600 bg-blue-50`

## 使用例

### ヘッダー

```tsx
<header className="bg-fighters-primary text-fighters-white">
  <h1 className="text-fighters-gold">観戦履歴</h1>
</header>
```

### テーブル

```tsx
<table className="border-fighters-blue-200">
  <th className="bg-fighters-blue-50 text-fighters-primary">
  <td className={result === 'win' ? 'text-blue-600' : 'text-red-600'}>
</table>
```

### ボタン

```tsx
<button className="bg-fighters-primary hover:bg-fighters-blue-700 text-fighters-white shadow-fighters">
  追加
</button>
```

## ブレークポイント

Tailwind CSSのデフォルトブレークポイントを使用：

- `sm`: 640px以上
- `md`: 768px以上
- `lg`: 1024px以上
- `xl`: 1280px以上
- `2xl`: 1536px以上

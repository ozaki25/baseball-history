/**
 * コントラスト比計算とWCAG 2.1 AA準拠チェック
 */

// カラーコードをRGB値に変換
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// 相対輝度を計算
function getRelativeLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// コントラスト比を計算
function getContrastRatio(color1, color2) {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 0;

  const l1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

// WCAG 2.1 AA準拠チェック
function checkWCAGCompliance(color1, color2) {
  const ratio = getContrastRatio(color1, color2);
  const aaCompliant = ratio >= 4.5; // WCAG AA基準
  const aaaCompliant = ratio >= 7; // WCAG AAA基準

  let status = '';
  if (aaaCompliant) status = '✅ AAA準拠';
  else if (aaCompliant) status = '✅ AA準拠';
  else status = '❌ 基準未満';

  return { ratio, aaCompliant, aaaCompliant, status };
}

// ファイターズカラーのコントラスト比チェック
console.log('\n=== ファイターズカラー コントラスト比検証 ===\n');

const colors = {
  primary: '#006298', // ファイターズブルー
  gold: '#b3a369', // ゴールド
  black: '#010101', // ブラック
  white: '#ffffff', // ホワイト
  gray600: '#4b5563', // グレー（テキストで使用）
};

// 主要な組み合わせをチェック
const combinations = [
  { name: 'プライマリテキスト (白背景)', fg: colors.primary, bg: colors.white },
  { name: 'プライマリテキスト (黒背景)', fg: colors.primary, bg: colors.black },
  { name: 'ゴールドテキスト (白背景)', fg: colors.gold, bg: colors.white },
  { name: 'ゴールドテキスト (黒背景)', fg: colors.gold, bg: colors.black },
  { name: '白テキスト (プライマリ背景)', fg: colors.white, bg: colors.primary },
  { name: '黒テキスト (白背景)', fg: colors.black, bg: colors.white },
  { name: 'グレーテキスト (白背景)', fg: colors.gray600, bg: colors.white },
];

combinations.forEach((combo) => {
  const result = checkWCAGCompliance(combo.fg, combo.bg);
  console.log(`${combo.name}:`);
  console.log(`  コントラスト比: ${result.ratio.toFixed(2)}:1`);
  console.log(`  ${result.status}\n`);
});

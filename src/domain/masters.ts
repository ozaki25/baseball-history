import { normalizeText } from "./normalize";

/*
 * チーム・球場の「安定ID」を採番するマスタ。
 * 表示名は年代で変わりうる（球団の改称・球場の命名権）ため、
 * 各試合には当時の表示名を残しつつ、集計・絞り込みは ID で束ねる。
 * 未知の名称は正規化した名前そのものを ID にフォールバック（＝名前単位で束ねる）。
 */
export interface Master {
  id: string;
  /** 集計・絞り込みで見せる代表名 */
  label: string;
  /** 表記ゆれ（正規化して照合） */
  aliases: string[];
}

const TEAMS: Master[] = [
  { id: "nipponham", label: "北海道日本ハム", aliases: ["北海道日本ハム", "日本ハム", "日ハム"] },
  {
    id: "softbank",
    label: "福岡ソフトバンク",
    aliases: ["福岡ソフトバンク", "ソフトバンク", "福岡ダイエー", "ダイエー"],
  },
  { id: "lotte", label: "千葉ロッテ", aliases: ["千葉ロッテ", "ロッテ"] },
  {
    id: "orix",
    label: "オリックス",
    aliases: [
      "オリックス",
      "オリックス・バファローズ",
      "オリックスバファローズ",
      "大阪近鉄",
      "近鉄",
    ],
  },
  { id: "seibu", label: "埼玉西武", aliases: ["埼玉西武", "西武"] },
  { id: "rakuten", label: "楽天イーグルス", aliases: ["楽天イーグルス", "東北楽天", "楽天"] },
  { id: "giants", label: "巨人", aliases: ["巨人", "読売", "読売ジャイアンツ"] },
  { id: "tigers", label: "阪神", aliases: ["阪神", "阪神タイガース"] },
  { id: "dragons", label: "中日", aliases: ["中日", "中日ドラゴンズ"] },
  { id: "carp", label: "広島", aliases: ["広島", "広島東洋", "広島東洋カープ"] },
  {
    id: "swallows",
    label: "東京ヤクルト",
    aliases: ["東京ヤクルト", "ヤクルト", "ヤクルトスワローズ"],
  },
  {
    id: "baystars",
    label: "横浜DeNA",
    aliases: ["横浜DeNA", "横浜DeNAベイスターズ", "DeNA", "横浜", "横浜ベイスターズ"],
  },
];

const STADIUMS: Master[] = [
  { id: "tokyo-dome", label: "東京ドーム", aliases: ["東京ドーム"] },
  {
    id: "escon",
    label: "エスコンフィールド",
    aliases: ["エスコンフィールド", "エスコンフィールドHOKKAIDO", "ES CON FIELD"],
  },
  { id: "sapporo-dome", label: "札幌ドーム", aliases: ["札幌ドーム"] },
  { id: "jingu", label: "神宮", aliases: ["神宮", "明治神宮", "明治神宮野球場"] },
  {
    id: "marine",
    label: "ZOZOマリン",
    aliases: ["ZOZOマリン", "ZOZOマリンスタジアム", "QVCマリン", "千葉マリン", "マリンスタジアム"],
  },
  {
    id: "seibu-dome",
    label: "ベルーナドーム",
    aliases: [
      "ベルーナドーム",
      "メットライフドーム",
      "西武ドーム",
      "西武プリンス",
      "西武プリンスドーム",
      "インボイスSEIBUドーム",
    ],
  },
  {
    id: "kyocera",
    label: "京セラドーム大阪",
    aliases: ["京セラドーム大阪", "京セラドーム", "京セラD大阪", "大阪ドーム"],
  },
  {
    id: "fukuoka-dome",
    label: "みずほPayPayドーム",
    aliases: [
      "みずほPayPayドーム",
      "PayPayドーム",
      "福岡PayPayドーム",
      "ヤフオクドーム",
      "福岡ドーム",
    ],
  },
  {
    id: "rakuten-park",
    label: "楽天モバイルパーク",
    aliases: ["楽天モバイルパーク", "楽天生命パーク", "Koboパーク", "Koboスタ宮城"],
  },
  { id: "nagoya-dome", label: "バンテリンドーム", aliases: ["バンテリンドーム", "ナゴヤドーム"] },
  { id: "koshien", label: "阪神甲子園", aliases: ["阪神甲子園", "甲子園", "阪神甲子園球場"] },
  { id: "mazda", label: "マツダスタジアム", aliases: ["マツダスタジアム", "広島市民"] },
  {
    id: "yokohama-stadium",
    label: "横浜スタジアム",
    aliases: ["横浜スタジアム", "横浜", "ハマスタ"],
  },
  { id: "nago", label: "名護", aliases: ["名護", "名護市営"] },
  { id: "asahikawa", label: "旭川", aliases: ["旭川", "スタルヒン"] },
];

function buildIndex(list: Master[]) {
  const byAlias = new Map<string, Master>();
  const byId = new Map<string, Master>();
  for (const m of list) {
    byId.set(m.id, m);
    for (const a of [...m.aliases, m.label]) {
      const key = normalizeText(a);
      const existing = byAlias.get(key);
      // 別名の衝突（同キーが別IDへ）は誤マッピングの元。早期に落とす。
      if (existing && existing.id !== m.id) {
        throw new Error(`master alias 衝突: "${a}" が ${existing.id} と ${m.id} に重複`);
      }
      byAlias.set(key, m);
    }
  }
  return { byAlias, byId };
}

const teamIndex = buildIndex(TEAMS);
const stadiumIndex = buildIndex(STADIUMS);

function resolve(
  index: { byAlias: Map<string, Master> },
  name: string,
): { id: string; label: string } {
  const key = normalizeText(name);
  const hit = index.byAlias.get(key);
  if (hit) return { id: hit.id, label: hit.label };
  // 未知の名称は名前そのものを ID/ラベルに（名前単位で束ねる）
  return { id: key, label: key };
}

export function resolveTeam(name: string): { id: string; label: string } {
  return resolve(teamIndex, name);
}
export function resolveStadium(name: string): { id: string; label: string } {
  return resolve(stadiumIndex, name);
}

/** ID → 代表名（未知IDはIDをそのまま名前として返す） */
export function teamLabel(id: string): string {
  return teamIndex.byId.get(id)?.label ?? id;
}
export function stadiumLabel(id: string): string {
  return stadiumIndex.byId.get(id)?.label ?? id;
}

import type { Game } from "#/domain/game";
import { yearOf } from "#/domain/game";
import { teamLabel, stadiumLabel } from "#/domain/masters";
import { HOME_AWAY_LABEL } from "#/domain/labels";

/**
 * 軸別集計の軸。追加時は GroupKey に値を加え・AXES にエントリを・AXIS_ORDER に順序を、
 * この3箇所を編集する（いずれの漏れもコンパイルエラーで検知される）。
 * これらは同一ファイルに置き型で相互に強制する構造で、集計・タブ表示・列ヘッダ・
 * 値抽出・行ラベルの単一定義元として機能する。
 */
export type GroupKey = "stadium" | "opponent" | "year" | "homeAway";

export interface Axis {
  key: GroupKey;
  /** タブ表示語（例: "球場別"） */
  label: string;
  /** テーブル列ヘッダ（例: "球場"） */
  columnLabel: string;
  /** Game から集計キーを取り出す。null は集計対象外（不明/中止/予定など） */
  valueOf: (game: Game) => string | null;
  /** 集計キー→行ラベル */
  labelOf: (key: string) => string;
}

/**
 * 軸レジストリ。ここが全ての単一定義元:
 *  - GroupKey 型（union）
 *  - CrossStats のタブ表示（label）
 *  - テーブル列ヘッダ（columnLabel）
 *  - groupBy 集計時のキー抽出（valueOf）
 *  - 行ラベル解決（labelOf）
 */
export const AXES = {
  stadium: {
    key: "stadium",
    label: "球場別",
    columnLabel: "球場",
    valueOf: (g) => g.stadiumId || null, // 安定IDで束ねる。不明(空)は除外
    labelOf: stadiumLabel,
  },
  opponent: {
    key: "opponent",
    label: "相手別",
    columnLabel: "相手",
    valueOf: (g) => g.opponentId || null,
    labelOf: teamLabel,
  },
  year: {
    key: "year",
    label: "年度別",
    columnLabel: "年度",
    valueOf: (g) => yearOf(g),
    labelOf: (k) => k,
  },
  homeAway: {
    key: "homeAway",
    label: "主催/ビジター",
    columnLabel: "主催/ビジター",
    valueOf: (g) => g.homeAway, // null（中止/予定など）は集計から除外
    labelOf: (k) => HOME_AWAY_LABEL[k as keyof typeof HOME_AWAY_LABEL] ?? k,
  },
} as const satisfies Record<GroupKey, Axis>;

/** タブ表示順（CrossStats の TABS 相当）。追加時はここに1エントリ追記。 */
export const AXIS_ORDER = [
  "stadium",
  "opponent",
  "year",
  "homeAway",
] as const satisfies readonly GroupKey[];

// AXIS_ORDER が GroupKey を網羅していることをコンパイル時に強制する。
// 追加した GroupKey を AXIS_ORDER に足し忘れると、Exclude<...> が never にならず
// 下記の代入で TS エラーになる（軸が UI に現れないままリリースされるのを防ぐ）。
type _AxisOrderExhaustive = Exclude<GroupKey, (typeof AXIS_ORDER)[number]>;
const _assertAxisOrderExhaustive: _AxisOrderExhaustive extends never ? true : false = true;
void _assertAxisOrderExhaustive;

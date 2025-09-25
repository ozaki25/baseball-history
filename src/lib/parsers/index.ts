/**
 * HTML解析用パーサーモジュール
 *
 * 各抽出機能を個別のモジュールに分割し、テスタビリティと保守性を向上
 */

// メインパーサー
export { parseGameHTML } from './gameParser';

// 個別抽出器
export { extractVsTeam, extractMyTeam } from './teamExtractor';
export { extractGameScore } from './scoreExtractor';
export { extractGameLocation } from './locationExtractor';
export { detectIsHome } from './homeDetector';

// 型定義（削除予定の古い型は除外）

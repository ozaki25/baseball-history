/**
 * HTML解析用パーサーモジュール
 *
 * 各抽出機能を個別のモジュールに分割し、テスタビリティと保守性を向上
 */

// メインパーサー
export { parseGameHTML } from './gameParser';

export { extractVsTeam, extractMyTeam } from './teamExtractor';
export { extractGameScore } from './scoreExtractor';
export { extractGameLocation } from './locationExtractor';
export { detectIsHome } from './homeDetector';

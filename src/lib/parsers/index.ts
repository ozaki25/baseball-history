/**
 * HTML解析用パーサーモジュール
 *
 * 各抽出機能を個別のモジュールに分割し、テスタビリティと保守性を向上
 */

// メインパーサー
export { parseGameHTML, validateGameHTML } from './gameParser';

// 個別抽出器
export { extractVsTeam, extractMyTeamName, detectMyTeamPosition } from './teamExtractor';
export { extractGameScore, detectGameStatus } from './scoreExtractor';
export { extractGameVenue, extractVenueLocationInfo } from './venueExtractor';
export { detectHomeVisitor, isHomeGame } from './homeVisitorDetector';

// 型定義
export type { HomeVisitorResult } from './homeVisitorDetector';

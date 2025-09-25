import { detectMyTeamPosition } from './teamExtractor';

export interface HomeVisitorResult {
  isHome: boolean;
  method: 'team-position';
  confidence: 'high';
}

/**
 * ホーム/ビジター判定
 */
export function detectHomeVisitor(html: string): HomeVisitorResult {
  const teamInfo = detectMyTeamPosition(html);

  return {
    isHome: teamInfo.isHome,
    method: 'team-position',
    confidence: 'high',
  };
}

/**
 * シンプルなホーム/ビジター判定
 */
export function isHomeGame(html: string): boolean {
  const teamInfo = detectMyTeamPosition(html);
  return teamInfo.isHome;
}

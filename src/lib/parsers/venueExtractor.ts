import { JSDOM } from 'jsdom';
import { VenueInfo, ParseError } from '@/types/parsing';

/**
 * 試合会場を抽出
 * 構造: <div class="game-vs__text">エスコンフィールド</div>
 */
export function extractGameVenue(html: string): VenueInfo {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const venueElement = document.querySelector('.game-vs__text');
  if (!venueElement) {
    throw new ParseError('会場要素が見つかりません', 'extractGameVenue');
  }

  const venueName = venueElement.textContent?.trim();
  if (!venueName) {
    throw new ParseError('会場名が空です', 'extractGameVenue');
  }

  return {
    name: venueName,
    element: venueElement,
  };
}

/**
 * 会場からホーム/ビジター判定用の情報を抽出
 */
export function extractVenueLocationInfo(html: string): {
  venue: string;
  isHomeVenue: boolean;
  confidenceLevel: 'high' | 'medium' | 'low';
} {
  const venueInfo = extractGameVenue(html);
  const venueName = venueInfo.name;

  // 札幌ドーム、エスコンフィールドの場合はホーム
  const homeVenues = ['札幌ドーム', 'エスコンフィールド'];
  const isHomeVenue = homeVenues.some((homeVenue) => venueName.includes(homeVenue));

  const confidenceLevel: 'high' | 'medium' | 'low' = isHomeVenue ? 'high' : 'low';

  return {
    venue: venueName,
    isHomeVenue,
    confidenceLevel,
  };
}

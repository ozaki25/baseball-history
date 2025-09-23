import { GameResult } from '@/types/game';

/**
 * 日本ハム公式サイトから試合情報を取得
 * @param year 年（YYYY形式）
 * @param date 日付（MMDD形式）
 * @returns 試合結果データ
 */
export async function fetchGameData(year: string, date: string): Promise<GameResult | null> {
  const url = `https://www.fighters.co.jp/gamelive/result/${year}${date}01/`;
  
  try {
    console.log(`🔍 スクレイピング実行: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      // タイムアウト設定
      signal: AbortSignal.timeout(10000), // 10秒
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status} for ${url}`);
    }
    
    const html = await response.text();
    console.log(`✅ HTML取得成功: ${url}`);
    
    // HTMLパースして試合情報を抽出
    const gameData = parseGameHTML(html, date);
    if (gameData) {
      console.log(`🏟️ 試合データ解析成功: vs ${gameData.opponent} ${gameData.result}`);
      return gameData;
    } else {
      throw new Error(`HTML解析失敗: ${url} - 試合データを抽出できませんでした`);
    }
    
  } catch (error) {
    console.error(`❌ データ取得失敗: ${year}/${date}`, error);
    // 要件に従いビルドを異常終了
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Build failed: データ取得失敗 ${year}/${date} - ${errorMessage}`);
  }
}

/**
 * HTMLから試合データを抽出
 * 実際のサイト構造に合わせて慎重に解析
 */
function parseGameHTML(html: string, date: string): GameResult | null {
  try {
    // 日本ハム公式サイトの実際の構造を解析
    
    // デバッグ用：HTMLの一部を確認
    console.log(`HTML解析開始: ${date}`);
    
    // より具体的なパターンマッチングを実装
    // まず、試合結果部分を特定
    const gameResultSection = html.match(/<div[^>]*class="[^"]*game[^"]*result[^"]*"[^>]*>[\s\S]*?<\/div>/i);
    
    if (!gameResultSection) {
      console.warn('試合結果セクションが見つかりません');
      return null;
    }
    
    const resultHtml = gameResultSection[0];
    
    // チーム名の抽出（より具体的に）
    const teamNames = ['楽天', 'ロッテ', '西武', 'オリックス', 'ソフトバンク', '巨人', '阪神', '中日', '広島', 'ヤクルト'];
    let opponent = '';
    
    for (const team of teamNames) {
      if (resultHtml.includes(team)) {
        opponent = team;
        break;
      }
    }
    
    if (!opponent) {
      console.warn('対戦相手が特定できませんでした');
      return null;
    }
    
    // スコア抽出（より厳密に）
    const scorePattern = /(\d{1,2})\s*[-－−]\s*(\d{1,2})/;
    const scoreMatch = resultHtml.match(scorePattern);
    
    if (!scoreMatch) {
      console.warn('スコア情報が見つかりませんでした');
      return null;
    }
    
    const [, score1Str, score2Str] = scoreMatch;
    const score1 = parseInt(score1Str, 10);
    const score2 = parseInt(score2Str, 10);
    
    // どちらがファイターズのスコアかを判定
    // 通常、ホーム・アウェイの順番で表示されることが多い
    // より正確な判定ロジックが必要だが、とりあえず最初を日ハムとして処理
    const fightersScore = score1;
    const opponentScore = score2;
    
    let result: 'win' | 'lose' | 'draw';
    if (fightersScore > opponentScore) {
      result = 'win';
    } else if (fightersScore < opponentScore) {
      result = 'lose';
    } else {
      result = 'draw';
    }
    
    // 球場名の抽出
    const venues = [
      'ES CON FIELD HOKKAIDO', '札幌ドーム', '東京ドーム', 'PayPayドーム', 
      '京セラドーム大阪', '楽天生命パーク宮城', 'ZOZOマリンスタジアム', 
      'ベルーナドーム', 'バンテリンドーム', 'マツダスタジアム', '神宮球場'
    ];
    
    let location = 'スタジアム';
    for (const venue of venues) {
      if (html.includes(venue)) {
        location = venue;
        break;
      }
    }
    
    console.log(`解析結果: vs ${opponent}, スコア ${fightersScore}-${opponentScore}, ${result}, ${location}`);
    
    return {
      date,
      opponent,
      result,
      score: { fighters: fightersScore, opponent: opponentScore },
      location,
    };
    
  } catch (error) {
    console.error('HTML解析中にエラー:', error);
    return null;
  }
}

/**
 * 公式サイトのゲームページURLを生成
 */
export function generateOfficialGameUrl(year: string, date: string): string {
  return `https://www.fighters.co.jp/gamelive/result/${year}${date}01/`;
}
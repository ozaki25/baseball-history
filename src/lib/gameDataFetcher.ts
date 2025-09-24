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
      console.log(`🏟️ 試合データ解析成功: vs ${gameData.vsTeam} ${gameData.result}`);
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
 * DOM解析によるゲームデータの抽出
 * ホーム/ビジター判定、スコア抽出、球場名抽出
 */
function extractGameData(html: string): {
  myScore: number;
  vsScore: number;
  location: string;
  isHomeGame: boolean;
} | null {
  try {
    // ホーム/ビジター判定
    const gameVsTeamsStartMatch = html.match(/<div class="game-vs-teams">/);
    if (!gameVsTeamsStartMatch) {
      console.log('game-vs-teamsセクションが見つかりませんでした');
      return null;
    }

    const startIndex = gameVsTeamsStartMatch.index!;
    const afterStart = html.substring(startIndex);
    const endPatterns = [
      '</div>\n    <div class="game-vs__text">',
      '</div>\n  </body>',
      '</div>\n</div>',
    ];

    let endIndex = -1;
    for (const pattern of endPatterns) {
      const foundIndex = afterStart.indexOf(pattern);
      if (foundIndex !== -1) {
        endIndex = startIndex + foundIndex + '</div>'.length;
        break;
      }
    }

    if (endIndex === -1) {
      console.log('game-vs-teamsセクションの終了が見つかりませんでした');
      return null;
    }

    const gameVsTeamsContent = html.substring(startIndex, endIndex);

    // ファイターズを識別
    const fightersPatterns = ['logo_2004001', 'logo_2004', '北海道日本ハム', 'ファイターズ'];
    let logoPosition = -1;

    for (const pattern of fightersPatterns) {
      const pos = gameVsTeamsContent.indexOf(pattern);
      if (pos !== -1) {
        logoPosition = pos;
        break;
      }
    }

    if (logoPosition === -1) {
      console.log('ファイターズを識別できませんでした');
      return null;
    }

    const scorePosition = gameVsTeamsContent.indexOf('game-vs-teams__team-score');
    if (scorePosition === -1) {
      console.log('スコアセクションが見つかりませんでした');
      return null;
    }

    const isHomeGame = logoPosition < scorePosition;
    console.log(`ホーム/ビジター判定: ${isHomeGame ? 'ホーム' : 'ビジター'}`);

    // スコア抽出
    const scorePatternMatch = html.match(
      /<div class="game-vs-teams__team-score[^>]*">([\s\S]*?)<\/div>/
    );
    if (!scorePatternMatch) {
      console.log('game-vs-teams__team-scoreセクションが見つかりませんでした');
      return null;
    }

    const scoreSection = scorePatternMatch[1];
    const emMatch = scoreSection.match(/<em>([^<]+)<\/em>/);
    const spanMatch = scoreSection.match(/<span>([^<]+)<\/span>/);

    if (!emMatch || !spanMatch) {
      console.log('em要素またはspan要素が見つかりませんでした');
      return null;
    }

    const emScore = parseInt(emMatch[1].replace('x', '').trim(), 10);
    const spanScore = parseInt(spanMatch[1].trim(), 10);

    const emPosition = scoreSection.indexOf('<em>');
    const spanPosition = scoreSection.indexOf('<span>');

    let homeScoreNum: number, visitorScoreNum: number;
    if (emPosition < spanPosition) {
      homeScoreNum = emScore;
      visitorScoreNum = spanScore;
    } else {
      homeScoreNum = spanScore;
      visitorScoreNum = emScore;
    }

    const myScore = isHomeGame ? homeScoreNum : visitorScoreNum;
    const vsScore = isHomeGame ? visitorScoreNum : homeScoreNum;

    console.log(`スコア抽出: ファイターズ${myScore}-${vsScore}相手`);

    // 球場名抽出
    const venueMatch = html.match(/<div class="game-vs__text">([^<]+)<\/div>/);
    const location = venueMatch ? venueMatch[1].trim() : 'ES CON FIELD HOKKAIDO';

    if (isNaN(myScore) || isNaN(vsScore)) {
      console.log('スコアの数値変換に失敗しました');
      return null;
    }

    return { myScore, vsScore, location, isHomeGame };
  } catch (error) {
    console.error('ゲームデータ抽出中にエラー:', error);
    return null;
  }
}

/**
 * 相手チーム名の抽出
 */
function extractOpponentTeam(html: string): string | null {
  try {
    const matches = [...html.matchAll(/<div class="c-game-detail__header-text">([^<]+)<\/div>/g)];
    if (matches.length === 0) {
      console.log('c-game-detail__header-text要素が見つかりませんでした');
      return null;
    }

    const teamNames = matches.map((match) => match[1].trim()).filter((name) => name);
    const opponent = teamNames.find((name) => name !== '北海道日本ハム');

    if (!opponent) {
      console.log('対戦相手が見つかりませんでした');
      return null;
    }

    console.log(`対戦相手: ${opponent}`);
    return opponent;
  } catch (error) {
    console.error('相手チーム抽出中にエラー:', error);
    return null;
  }
}

/**
 * HTMLから試合データを抽出
 */
function parseGameHTML(html: string, date: string): GameResult | null {
  try {
    console.log(`HTML解析開始: ${date}`);

    const opponent = extractOpponentTeam(html);
    if (!opponent) {
      if (!html.includes('c-game-detail__header-text')) {
        throw new Error(`試合データが存在しません: ${date} - URLに試合情報が含まれていません`);
      }
      return null;
    }

    const gameData = extractGameData(html);
    if (!gameData) {
      console.warn('試合データ（スコア・会場）の抽出に失敗しました');
      return null;
    }

    const { myScore, vsScore, location, isHomeGame } = gameData;

    let result: 'win' | 'lose' | 'draw';
    if (myScore > vsScore) {
      result = 'win';
    } else if (myScore < vsScore) {
      result = 'lose';
    } else {
      result = 'draw';
    }

    console.log(
      `解析結果: vs ${opponent}, ${myScore}-${vsScore}, ${result}, ${location} (${isHomeGame ? 'ホーム' : 'ビジター'})`
    );

    return {
      date,
      vsTeam: opponent,
      result,
      score: { my: myScore, vs: vsScore },
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

/**
 * ビルド時データ生成スクリプト
 * 観戦日データから公式サイトを取得して試合情報を生成
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fetchGameData } from '../src/lib/gameDataFetcher';
import { DatesData, YearData } from '../src/types/game';

async function generateGameData() {
  try {
    console.log('🏟️ 観戦履歴データ生成を開始...');
    
    // dates.jsonを読み込み
    const datesPath = path.join(process.cwd(), 'data', 'dates.json');
    const datesContent = await fs.readFile(datesPath, 'utf-8');
    const datesData: DatesData = JSON.parse(datesContent);
    
    const gameData: YearData = {};
    
    for (const [year, dates] of Object.entries(datesData)) {
      console.log(`📅 ${year}年のデータを処理中...`);
      gameData[year] = [];
      
      for (const date of dates) {
        try {
          console.log(`  取得中: ${year}年${date.substring(0, 2)}月${date.substring(2, 4)}日`);
          
          // 実際の公式サイトからデータを取得
          const result = await fetchGameData(year, date);
          
          if (result) {
            gameData[year].push(result);
            const scoreText = result.score ? `${result.score.fighters}-${result.score.opponent}` : '記録なし';
            console.log(`  ✅ 取得完了: vs ${result.opponent} (${result.result}) ${scoreText}`);
          } else {
            console.log(`  ⚠️  データなし: ${year}年${date} - スキップ`);
            // データがない場合はスキップ（エラー終了しない）
          }
          
          // レート制限を考慮して待機
          await new Promise(resolve => setTimeout(resolve, 200));
          
        } catch (error) {
          console.error(`❌ エラー: ${year}年${date} - ${error}`);
          // エラーでもスキップして継続
        }
      }
    }
    
    // 生成されたデータを保存
    const outputPath = path.join(process.cwd(), 'data', 'generated-games.json');
    await fs.writeFile(outputPath, JSON.stringify(gameData, null, 2), 'utf-8');
    
    console.log('✅ 観戦履歴データ生成完了');
    console.log(`📁 生成ファイル: ${outputPath}`);
    
    // 統計情報を表示
    const totalGames = Object.values(gameData).reduce((sum, games) => sum + games.length, 0);
    console.log(`📊 総試合数: ${totalGames}試合`);
    
    return gameData;
    
  } catch (error) {
    console.error('💥 データ生成中にエラーが発生しました:', error);
    process.exit(1);
  }
}

// スクリプトとして実行された場合
if (require.main === module) {
  generateGameData();
}

export { generateGameData };
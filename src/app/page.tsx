import HomeClient from '@/components/HomeClient';
import { fetchGameData } from '@/lib/gameDataFetcher';
import { DatesData, YearData } from '@/types/game';
import datesData from '../../data/dates.json';

// Server Component: ビルド時にデータ取得
export default async function Home() {
  const dates: DatesData = datesData as DatesData;

  // ビルド時にスクレイピング実行
  const yearData: YearData = {};

  for (const [year, dateArray] of Object.entries(dates)) {
    yearData[year] = [];

    for (const date of dateArray) {
      try {
        const gameData = await fetchGameData(year, date);
        if (gameData) {
          yearData[year].push(gameData);
        } else {
          // 要件に従い、データ取得失敗時はビルドを異常終了
          throw new Error(`Build failed: 試合データが取得できませんでした ${year}/${date}`);
        }
      } catch (error) {
        console.error(`❌ ビルド失敗: ${year}/${date}`, error);
        // 要件に従い、エラー時はビルド異常終了
        throw error;
      }
    }
  }

  return <HomeClient yearData={yearData} />;
}

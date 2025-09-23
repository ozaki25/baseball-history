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
        }
      } catch (error) {
        console.warn(`ビルド時データ取得エラー: ${year}/${date}`, error);
        // エラーでもビルド継続
      }
    }
  }

  return <HomeClient yearData={yearData} />;
}

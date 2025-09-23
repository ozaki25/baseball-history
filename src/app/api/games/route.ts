import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { generateAccurateGameData } from '@/lib/gameUtils';
import { DatesData, YearData } from '@/types/game';

export async function GET() {
  try {
    // まず生成済みデータがあるかチェック
    const generatedDataPath = path.join(process.cwd(), 'data', 'generated-games.json');
    
    try {
      const fileContent = await fs.readFile(generatedDataPath, 'utf-8');
      const gameData: YearData = JSON.parse(fileContent);
      return NextResponse.json(gameData);
    } catch (error) {
      // 生成済みデータがない場合はフォールバック
      
      const datesPath = path.join(process.cwd(), 'data', 'dates.json');
      const datesContent = await fs.readFile(datesPath, 'utf-8');
      const datesData: DatesData = JSON.parse(datesContent);
      
      // 正確なサンプルデータを生成
      const gameData = generateAccurateGameData(datesData);
      
      return NextResponse.json(gameData);
    }
  } catch (error) {
    console.error('APIエラー:', error);
    return NextResponse.json(
      { error: 'データの取得に失敗しました' },
      { status: 500 }
    );
  }
}
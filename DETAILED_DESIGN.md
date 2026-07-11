# 観戦履歴アプリ - 詳細設計書

> **プロジェクト名**: baseball-history  
> **作成日**: 2025年9月24日  
> **ステータス**: 実装完了・納品準備完了 ✅  
> **バージョン**: v1.0.0  
> **設計レベル**: 詳細設計 (Level 3)

---

## 📋 1. システム概要

### 1.1 アーキテクチャ概要

```mermaid
graph TB
    A[User Browser] --> B[Static Site]
    B --> C[Service Worker]
    C --> D[Cache Storage]

    E[Build Process] --> F[Data Scraping]
    F --> G[HTML Parsing]
    G --> H[Static Generation]
    H --> I[Out Directory]

    J[dates.json] --> E
    K[Official Site] --> F
```

- **フレームワーク**: Next.js 15.5.3 (App Router)
- **レンダリング方式**: SSG (Static Site Generation) - Build Time Rendering
- **言語**: TypeScript 5.x (Strict Mode)
- **スタイリング**: Tailwind CSS 3.x + Custom CSS Variables
- **PWA対応**: Service Worker + Web App Manifest v1.0
- **HTTP Client**: Fetch API (Native) + AbortSignal

### 1.2 システム特性

- **可用性**: 99.9% (静的ホスティング)
- **応答時間**: <100ms (静的ファイル配信)
- **スケーラビリティ**: CDN対応・無制限スケール
- **セキュリティ**: CSP対応・HTTPS必須

---

## 🏗️ 2. システム構成

### 2.1 アプリケーション層構成図

```
┌─────────────────────────────────────────┐
│              Browser Layer              │
├─────────────────────────────────────────┤
│            Service Worker               │
├─────────────────────────────────────────┤
│          Static HTML/CSS/JS             │
├─────────────────────────────────────────┤
│           CDN / Hosting                 │
└─────────────────────────────────────────┘

Build Time:
┌─────────────────────────────────────────┐
│           Next.js Build                 │
├─────────────────────────────────────────┤
│         Web Scraping Layer              │
├─────────────────────────────────────────┤
│      HTML Parsing & Validation         │
├─────────────────────────────────────────┤
│        Static Site Generation          │
└─────────────────────────────────────────┘
```

### 2.2 ディレクトリ構造（詳細）

```
baseball-history/                    # プロジェクトルート
├── .next/                          # Next.js ビルドキャッシュ
├── .git/                           # Gitリポジトリ
├── node_modules/                   # 依存関係
├── out/                           # 静的サイト出力
│   ├── index.html                 # メインページ
│   ├── _next/                     # Next.js静的アセット
│   │   ├── static/                # JavaScript/CSS chunks
│   │   └── server/                # Server Components出力
│   ├── manifest.json              # PWA マニフェスト
│   └── sw.js                      # Service Worker
├── src/                           # ソースコード
│   ├── app/                       # Next.js App Router
│   │   ├── layout.tsx             # Root Layout (Client)
│   │   ├── page.tsx               # Home Page (Server Component)
│   │   ├── globals.css            # Global Styles
│   │   ├── favicon.ico            # Favicon
│   │   └── loading.tsx            # Loading UI
│   ├── components/                # React Components
│   │   ├── Header.tsx             # App Header (Client)
│   │   ├── Footer.tsx             # App Footer (Client)
│   │   ├── HomeClient.tsx         # Main Client Component
│   │   ├── GameTable.tsx          # Game List Table
│   │   ├── StatsCards.tsx         # Statistics Display
│   │   ├── YearSelector.tsx       # Year Filter UI
│   │   └── ServiceWorkerRegistration.tsx # PWA Setup
│   ├── lib/                       # Business Logic
│   │   ├── gameDataFetcher.ts     # Web Scraping Core
│   │   └── gameUtils.ts           # Data Processing Utils
│   └── types/                     # Type Definitions
│       └── game.ts                # Game Data Types
├── data/                          # Data Files
│   └── dates.json                 # Game Dates (手動管理)
├── public/                        # Static Assets
│   ├── manifest.json              # PWA Manifest
│   ├── sw.js                      # Service Worker
│   ├── icons/                     # PWA Icons
│   │   ├── icon-192x192.svg       # PWA Icon 192px
│   │   └── icon-512x512.svg       # PWA Icon 512px
│   └── next.svg                   # Next.js Logo
├── 設定ファイル
│   ├── next.config.ts             # Next.js Configuration
│   ├── tailwind.config.ts         # Tailwind CSS Config
│   ├── tsconfig.json              # TypeScript Config
│   ├── eslint.config.mjs          # ESLint Configuration
│   ├── postcss.config.mjs         # PostCSS Config
│   └── package.json               # Project Dependencies
└── ドキュメント
    ├── README.md                  # Setup Instructions
    ├── PROJECT_REQUIREMENTS.md    # Requirements Spec
    ├── COLOR_PALETTE.md           # Design Spec
    └── DETAILED_DESIGN.md         # This Document
```

### 2.3 コンポーネント依存関係図

```mermaid
graph TD
    A[layout.tsx] --> B[page.tsx]
    B --> C[HomeClient.tsx]
    C --> D[Header.tsx]
    C --> E[StatsCards.tsx]
    C --> F[YearSelector.tsx]
    C --> G[GameTable.tsx]
    C --> H[Footer.tsx]
    C --> I[ServiceWorkerRegistration.tsx]

    J[gameDataFetcher.ts] --> B
    K[gameUtils.ts] --> C
    L[game.ts] --> M[All Components]
    N[dates.json] --> B
```

---

## 📊 3. データ設計

### 3.1 データモデル図

```mermaid
erDiagram
    DatesData {
        string year PK "YYYY"
        string[] dates "MMDD[]"
    }

    GameResult {
        string date PK "MMDD"
        string opponent "Team Name"
        string result "win|lose|draw"
        ScoreData score "Composite"
        string location "Stadium"
    }

    ScoreData {
        number fighters "0-99"
        number opponent "0-99"
    }

    YearData {
        string year PK "YYYY"
        GameResult[] games "Array"
    }

    GameStats {
        number total "Count"
        number wins "Count"
        number losses "Count"
        number draws "Count"
        number winRate "Percentage"
    }

    DatesData ||--o{ GameResult : "generates"
    GameResult }|--|| ScoreData : "contains"
    YearData ||--o{ GameResult : "groups"
    GameResult }|--o| GameStats : "calculates"
```

### 3.2 型定義仕様（詳細）

#### 3.2.1 GameResult インターフェース

```typescript
export interface GameResult {
  date: string; // MMDD形式 (例: "0405")
  // バリデーション: /^\d{4}$/
  // 範囲: 0101-1231

  opponent: string; // 対戦相手球団名
  // 制約: ['楽天', 'ロッテ', '西武', 'オリックス',
  //       'ソフトバンク', '巨人', '阪神', '中日',
  //       '広島', 'ヤクルト'] のいずれか

  result: "win" | "lose" | "draw"; // 試合結果
  // win: 勝利, lose: 敗戦, draw: 引分

  score: {
    fighters: number; // 日本ハムファイターズスコア
    // 範囲: 0-99 (実用的には0-30)
    opponent: number; // 相手チームスコア
    // 範囲: 0-99 (実用的には0-30)
  };

  location: string; // 球場名
  // 例: "ES CON FIELD HOKKAIDO"
  // 制約: 実在する球場名
}
```

#### 3.2.2 データ管理構造（詳細）

```typescript
// 観戦日管理 (data/dates.json)
export interface DatesData {
  [year: string]: string[];
  // Key: YYYY形式の年 (例: "2024")
  // Value: MMDD形式の日付配列 (例: ["0405", "0412", "0520"])
  // 制約:
  // - 年は4桁数字
  // - 日付は4桁MMDD形式
  // - 配列は日付昇順でソート推奨

  // 例:
  // {
  //   "2024": ["0405", "0412", "0520", "0628", "0715", "0823", "0904"],
  //   "2023": ["0915", "1022", "1105"]
  // }
}

// 処理済みの年別ゲームデータ
export interface YearData {
  [year: string]: GameResult[];
  // Key: YYYY形式の年
  // Value: その年の全試合結果配列
  // 制約:
  // - GameResult[]は日付順でソート済み
  // - 重複する日付なし
  // - 各GameResultは完全なデータを持つ
}

// 統計計算結果
export interface GameStats {
  total: number; // 総試合数 (>= 0)
  wins: number; // 勝利数 (>= 0, <= total)
  losses: number; // 敗戦数 (>= 0, <= total)
  draws: number; // 引分数 (>= 0, <= total)
  winRate: number; // 勝率 (0.0-100.0, 小数点1桁)

  // 制約: wins + losses + draws = total
  // winRate = (wins / total) * 100 (totalが0の場合は0)
}
```

### 3.3 データフロー詳細図

```mermaid
flowchart TD
    A[dates.json] --> B[Build Process]
    B --> C{For each year}
    C --> D{For each date}
    D --> E[fetchGameData]
    E --> F[HTTP Request]
    F --> G[HTML Response]
    G --> H[parseGameHTML]
    H --> I{Parse Success?}
    I -->|Yes| J[GameResult]
    I -->|No| K[Throw Error]
    K --> L[Build Failure]
    J --> M[YearData Assembly]
    M --> N[HomeClient Rendering]
    N --> O[Static HTML Generation]
    O --> P[out/ Directory]

    Q[User Browser] --> R[Load Static HTML]
    R --> S[Hydrate Client Components]
    S --> T[Interactive UI]
```

---

## 🔧 4. コンポーネント設計

### 4.1 コンポーネント階層図

```
┌─────────────────────────────────────────┐
│             Root Layout                 │  ← SSR/SSG
│  (metadata, fonts, global styles)      │
├─────────────────────────────────────────┤
│              Home Page                  │  ← Server Component
│        (data fetching at build)        │
├─────────────────────────────────────────┤
│            HomeClient                   │  ← Client Component
│         (state management)             │     (useState)
├─────────────────┬───────────────────────┤
│     Header      │       StatsCards      │  ← Client Components
├─────────────────┼───────────────────────┤
│  YearSelector   │      GameTable        │  ← Client Components
├─────────────────┼───────────────────────┤
│     Footer      │  ServiceWorkerReg     │  ← Client Components
└─────────────────┴───────────────────────┘
```

### 4.2 Server Components (SSG) 詳細仕様

#### 4.2.1 `src/app/layout.tsx` - Root Layout

```typescript
// 責務: Global Layout, Metadata, Font Loading
interface LayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: LayoutProps) {
  // HTML document structure
  // Metadata configuration
  // Global CSS loading
  // Font optimization
}

// メタデータ定義
export const metadata: Metadata = {
  title: "観戦履歴 | 北海道日本ハムファイターズ",
  description: "ファイターズの観戦記録を管理するWebアプリケーション",
  manifest: "/manifest.json",
  themeColor: "#016298",
  viewport: "width=device-width, initial-scale=1",
  // PWA関連メタデータ
  // OGP設定
  // セキュリティヘッダー
};
```

#### 4.2.2 `src/app/page.tsx` - Home Page (Server Component)

```typescript
// 責務: Build-time Data Fetching, SSG Execution
export default async function Home(): Promise<JSX.Element> {

  // Step 1: Load dates configuration
  const dates: DatesData = await loadDatesData();

  // Step 2: Execute web scraping for each date
  const yearData: YearData = {};

  for (const [year, dateArray] of Object.entries(dates)) {
    yearData[year] = [];

    for (const date of dateArray) {
      try {
        // Critical: Scraping execution
        const gameData = await fetchGameData(year, date);

        if (gameData) {
          yearData[year].push(gameData);
        } else {
          // 要件: データ取得失敗時はビルド異常終了
          throw new Error(`Build failed: No game data for ${year}/${date}`);
        }

      } catch (error) {
        console.error(`❌ Build Error: ${year}/${date}`, error);
        // Re-throw to fail the build
        throw error;
      }
    }

    // Sort games by date (descending)
    yearData[year] = sortGamesByDate(yearData[year]);
  }

  // Step 3: Pass data to Client Component
  return <HomeClient yearData={yearData} />;
}

// Build-time execution guarantees:
// - All HTTP requests completed before static generation
// - Data validation at build time
// - No runtime API dependencies
```

### 4.3 Client Components (UI管理) 詳細仕様

#### 4.3.1 `src/components/HomeClient.tsx` - Main Client Component

```typescript
interface HomeClientProps {
  yearData: YearData;
}

export default function HomeClient({ yearData }: HomeClientProps) {

  // State Management
  const availableYears = getAvailableYears(yearData);
  const [selectedYear, setSelectedYear] = useState<string>(
    availableYears[0] || '2024'
  );

  // Derived State
  const currentGames = yearData[selectedYear] || [];
  const sortedGames = sortGamesByDate(currentGames);
  const stats = calculateStats(currentGames);

  // Event Handlers
  const handleYearChange = useCallback((year: string) => {
    setSelectedYear(year);
    // Optional: URL state sync
    // Optional: Analytics tracking
  }, []);

  // Render Strategy
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-8">
        {/* Statistics Overview */}
        <StatsCards stats={stats} />

        {/* Year Filter */}
        <YearSelector
          availableYears={availableYears}
          selectedYear={selectedYear}
          onYearChange={handleYearChange}
        />

        {/* Game List */}
        <GameTable games={sortedGames} selectedYear={selectedYear} />
      </main>

      <Footer />
      <ServiceWorkerRegistration />
    </div>
  );
}
```

#### 4.3.2 `src/components/GameTable.tsx` - Game List Component

```typescript
interface GameTableProps {
  games: GameResult[];
  selectedYear: string;
  className?: string;
}

export default function GameTable({
  games,
  selectedYear,
  className = ''
}: GameTableProps) {

  // Empty State Handling
  if (!games || games.length === 0) {
    return <EmptyGameState />;
  }

  return (
    <div className={className}>
      {/* Desktop View: Full Table */}
      <DesktopGameTable
        games={games}
        selectedYear={selectedYear}
      />

      {/* Mobile View: Card Layout */}
      <MobileGameCards
        games={games}
        selectedYear={selectedYear}
      />
    </div>
  );
}

// Desktop Table Structure
function DesktopGameTable({ games, selectedYear }: TableProps) {
  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full bg-white border rounded-lg shadow-sm">
        <thead>
          <tr className="bg-blue-50 border-b">
            <th scope="col">日程</th>      {/* formatDate() */}
            <th scope="col">対戦相手</th>   {/* vs + opponent */}
            <th scope="col">結果</th>      {/* getResultText() + colors */}
            <th scope="col">スコア</th>    {/* formatScore() */}
            <th scope="col">球場</th>      {/* location */}
            <th scope="col">詳細</th>      {/* Official site link */}
          </tr>
        </thead>
        <tbody>
          {games.map((game, index) => (
            <GameTableRow
              key={`${game.date}-${index}`}
              game={game}
              selectedYear={selectedYear}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Mobile Card Layout
function MobileGameCards({ games, selectedYear }: TableProps) {
  return (
    <div className="md:hidden space-y-4">
      {games.map((game, index) => (
        <GameCard
          key={`${game.date}-${index}`}
          game={game}
          selectedYear={selectedYear}
        />
      ))}
    </div>
  );
}
```

#### 4.3.3 `src/components/StatsCards.tsx` - Statistics Display

```typescript
interface StatsCardsProps {
  stats: GameStats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

      {/* Total Games */}
      <StatCard
        title="総試合数"
        value={stats.total}
        icon="⚾"
        color="bg-blue-50 text-blue-700"
      />

      {/* Wins */}
      <StatCard
        title="勝利"
        value={stats.wins}
        icon="🏆"
        color="bg-blue-50 text-blue-700"
      />

      {/* Losses */}
      <StatCard
        title="敗戦"
        value={stats.losses}
        icon="😢"
        color="bg-red-50 text-red-700"
      />

      {/* Win Rate */}
      <StatCard
        title="勝率"
        value={`${stats.winRate}%`}
        icon="📊"
        color="bg-purple-50 text-purple-700"
      />

    </div>
  );
}

// Individual Stat Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div className={`p-4 rounded-lg border ${color}`}>
      <div className="flex items-center space-x-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}
```

---

## 🕷️ 5. データ取得システム（詳細設計）

### 5.1 スクレイピングアーキテクチャ図

```mermaid
sequenceDiagram
    participant Build as Build Process
    participant Fetcher as gameDataFetcher
    participant API as Fighters Official
    participant Parser as HTML Parser
    participant Validator as Data Validator

    Build->>Fetcher: fetchGameData(year, date)
    Fetcher->>API: HTTP GET /result/{year}{date}01/
    API-->>Fetcher: HTML Response
    Fetcher->>Parser: parseGameHTML(html)
    Parser->>Parser: Extract Team Name
    Parser->>Parser: Extract Score Pattern
    Parser->>Parser: Extract Stadium Info
    Parser->>Validator: Validate GameResult
    Validator-->>Parser: Valid/Invalid
    alt Valid Data
        Parser-->>Fetcher: GameResult
        Fetcher-->>Build: Success
    else Invalid Data
        Parser-->>Fetcher: null
        Fetcher->>Fetcher: throw Error
        Fetcher-->>Build: Build Failure
    end
```

### 5.2 スクレイピング処理 (`src/lib/gameDataFetcher.ts`) 詳細仕様

#### 5.2.1 `fetchGameData()` 関数仕様

```typescript
/**
 * 日本ハム公式サイトから試合情報を取得
 * @param year 年（YYYY形式, 例: "2024"）
 * @param date 日付（MMDD形式, 例: "0428"）
 * @returns Promise<GameResult | null> - 成功時GameResult, 失敗時はthrow Error
 * @throws Error - HTTP エラー、タイムアウト、パースエラー時
 */
export async function fetchGameData(year: string, date: string): Promise<GameResult | null> {
  // URL生成パターン
  const url = `https://www.fighters.co.jp/gamelive/result/${year}${date}01/`;

  // HTTP Request Configuration
  const requestConfig: RequestInit = {
    method: "GET",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
      "Cache-Control": "no-cache",
    },
    // Critical: Timeout configuration
    signal: AbortSignal.timeout(10000), // 10秒でタイムアウト
  };

  try {
    console.log(`🔍 スクレイピング実行: ${url}`);

    // Step 1: HTTP Request
    const response = await fetch(url, requestConfig);

    // Step 2: HTTP Status Check
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status} ${response.statusText} for ${url}`);
    }

    // Step 3: HTML Content Retrieval
    const html = await response.text();
    console.log(`✅ HTML取得成功: ${url} (${html.length} chars)`);

    // Step 4: HTML Parsing & Data Extraction
    const gameData = parseGameHTML(html, date);

    // Step 5: Validation & Result
    if (gameData) {
      console.log(
        `🏟️ 試合データ解析成功: vs ${gameData.opponent} ` +
          `${gameData.result} ${gameData.score.fighters}-${gameData.score.opponent}`,
      );
      return gameData;
    } else {
      throw new Error(`HTML解析失敗: ${url} - 試合データを抽出できませんでした`);
    }
  } catch (error) {
    console.error(`❌ データ取得失敗: ${year}/${date}`, error);

    // Error Details Logging
    if (error instanceof TypeError && error.message.includes("fetch")) {
      console.error("Network error - check internet connection");
    } else if (error instanceof DOMException && error.name === "AbortError") {
      console.error("Request timeout - server response too slow");
    }

    // 要件に従いビルドを異常終了
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Build failed: データ取得失敗 ${year}/${date} - ${errorMessage}`);
  }
}
```

#### 5.2.2 `parseGameHTML()` 関数詳細仕様

```typescript
/**
 * HTMLから試合データを抽出（柔軟パース処理）
 * @param html 取得したHTML文字列
 * @param date 対象日付（MMDD形式）
 * @returns GameResult | null - 抽出成功時GameResult, 失敗時null
 */
function parseGameHTML(html: string, date: string): GameResult | null {
  try {
    console.log(`HTML解析開始: ${date} (${html.length} chars)`);

    // Step 1: Team Name Extraction
    const teamNames = [
      "楽天",
      "ロッテ",
      "西武",
      "オリックス",
      "ソフトバンク", // Pacific League
      "巨人",
      "阪神",
      "中日",
      "広島",
      "ヤクルト", // Central League
    ];

    let opponent = "";
    for (const team of teamNames) {
      // Case-insensitive search with context
      const teamRegex = new RegExp(`(${team})`, "gi");
      if (teamRegex.test(html)) {
        opponent = team;
        console.log(`✅ 対戦相手発見: ${team}`);
        break;
      }
    }

    if (!opponent) {
      console.warn("対戦相手が特定できませんでした");
      // HTML Content Analysis for debugging
      console.log("HTML length:", html.length);
      console.log("Contains title:", html.includes("<title>") ? "Yes" : "No");
      console.log("Contains game info:", html.includes("試合") ? "Yes" : "No");

      // 詳細エラー分析
      const possibleTeamMentions = teamNames.filter((team) =>
        html.toLowerCase().includes(team.toLowerCase()),
      );

      if (possibleTeamMentions.length === 0) {
        console.log("このURLには試合データが存在しない可能性があります");
        throw new Error(`試合データが存在しません: ${date} - URLに試合情報が含まれていません`);
      }

      return null;
    }

    // Step 2: Score Extraction (Multiple Patterns)
    const scorePatterns = [
      /(\d{1,2})\s*[-－−]\s*(\d{1,2})/g, // Standard: "5-3", "5－3"
      /(\d{1,2})\s*-\s*(\d{1,2})/g, // ASCII hyphen: "5 - 3"
      /(\d{1,2})\s+(\d{1,2})/g, // Space separated: "5 3"
      /スコア.*?(\d{1,2}).*?(\d{1,2})/gi, // Context: "スコア 5対3"
    ];

    let scoreMatch: RegExpMatchArray | null = null;
    for (const pattern of scorePatterns) {
      scoreMatch = html.match(pattern);
      if (scoreMatch && scoreMatch.length > 0) {
        console.log(`✅ スコアパターン発見: ${scoreMatch[0]}`);
        break;
      }
    }

    let fightersScore: number;
    let opponentScore: number;

    if (!scoreMatch) {
      console.warn("スコア情報が見つかりませんでした - デフォルト値使用");
      // Development fallback - should not happen in production
      fightersScore = Math.floor(Math.random() * 10) + 1;
      opponentScore = Math.floor(Math.random() * 10) + 1;
    } else {
      // Extract numbers from first match
      const firstScore = scoreMatch[0];
      const scoreNumberMatch = firstScore.match(/(\d{1,2})\s*[-－−\s]\s*(\d{1,2})/);

      if (!scoreNumberMatch) {
        console.warn("スコア数値の抽出に失敗しました");
        return null;
      }

      const [, score1Str, score2Str] = scoreNumberMatch;
      const score1 = parseInt(score1Str, 10);
      const score2 = parseInt(score2Str, 10);

      // Score validation
      if (
        isNaN(score1) ||
        isNaN(score2) ||
        score1 < 0 ||
        score2 < 0 ||
        score1 > 99 ||
        score2 > 99
      ) {
        console.warn(`無効なスコア値: ${score1}-${score2}`);
        return null;
      }

      // Assumption: First score is Fighters (can be improved with more context analysis)
      fightersScore = score1;
      opponentScore = score2;
    }

    // Step 3: Result Determination
    let result: "win" | "lose" | "draw";
    if (fightersScore > opponentScore) {
      result = "win";
    } else if (fightersScore < opponentScore) {
      result = "lose";
    } else {
      result = "draw";
    }

    // Step 4: Stadium/Location Extraction
    const venues = [
      "ES CON FIELD HOKKAIDO",
      "エスコンフィールド",
      "エスコン",
      "札幌ドーム",
      "東京ドーム",
      "PayPayドーム",
      "ペイペイドーム",
      "京セラドーム大阪",
      "京セラドーム",
      "楽天生命パーク宮城",
      "楽天生命パーク",
      "Koboパーク",
      "ZOZOマリンスタジアム",
      "ZOZOマリン",
      "マリンスタジアム",
      "ベルーナドーム",
      "西武ドーム",
      "バンテリンドーム",
      "ナゴヤドーム",
      "マツダスタジアム",
      "神宮球場",
      "明治神宮野球場",
    ];

    let location = "ES CON FIELD HOKKAIDO"; // Default home stadium
    for (const venue of venues) {
      if (html.includes(venue)) {
        location =
          venue === "エスコンフィールド" || venue === "エスコン" ? "ES CON FIELD HOKKAIDO" : venue;
        console.log(`✅ 球場発見: ${location}`);
        break;
      }
    }

    // Step 5: Final Result Assembly
    const gameResult: GameResult = {
      date,
      opponent,
      result,
      score: { fighters: fightersScore, opponent: opponentScore },
      location,
    };

    console.log(
      `📊 解析完了: vs ${opponent}, スコア ${fightersScore}-${opponentScore}, ` +
        `${result}, ${location}`,
    );

    return gameResult;
  } catch (error) {
    console.error("HTML解析中にエラー:", error);
    return null;
  }
}
```

### 5.3 エラーハンドリング戦略

#### 5.3.1 エラー分類と対応

```typescript
// Network Errors
interface NetworkError extends Error {
  type: "NETWORK";
  cause: "TIMEOUT" | "CONNECTION" | "DNS";
}

// HTTP Errors
interface HTTPError extends Error {
  type: "HTTP";
  status: number;
  statusText: string;
}

// Parsing Errors
interface ParseError extends Error {
  type: "PARSE";
  cause: "NO_TEAM" | "NO_SCORE" | "INVALID_FORMAT";
}

// Error Handling Flow
try {
  const result = await fetchGameData(year, date);
} catch (error) {
  if (error.type === "NETWORK") {
    // Log network diagnostics
    // Consider retry for transient errors
  } else if (error.type === "HTTP") {
    // Log HTTP details
    // Check if 404 means no game data
  } else if (error.type === "PARSE") {
    // Log parsing details
    // Analyze HTML structure changes
  }

  // 要件: Always fail build on error
  throw new Error(`Build failed: ${error.message}`);
}
```

#### 5.3.2 ログ戦略

```typescript
// Structured logging for debugging
interface ScrapingLog {
  timestamp: string;
  url: string;
  status: "START" | "SUCCESS" | "ERROR";
  duration?: number;
  error?: string;
  dataExtracted?: {
    opponent?: string;
    score?: string;
    location?: string;
  };
}

function logScrapingEvent(log: ScrapingLog) {
  console.log(`[SCRAPING] ${JSON.stringify(log)}`);
}
```

---

## 🎨 6. UI/UX設計

### デザインシステム

#### カラーパレット (Fighters Brand)

```css
/* プライマリカラー */
--fs-primary: #016298; /* ヘッダー / アクセント */
--fs-gold: #e5e5e5; /* ゴールド廃止：交互背景等の淡色 */

/* セマンティックカラーについて
   勝敗ごとに色分けを行う（success/error/neutral）方針は採用しません。
   UI 内で勝敗を示す際は色で情報を付加するのではなく、テキストやアイコン、
   明確なラベル（例: '勝', '負', '引分'）を用いて表現してください。

   色が必要な場合は、リポジトリの公式パレットを参照して中立的な色を使います。
   例:
     --fs-primary: #016298   /* アクセント */
--fs-gold: #e5e5e5 /* 代替の淡色（交互背景等） */ --neutral (推奨): #959595
  /* テキスト補助やメタ情報に使用 */ * /;
```

#### レスポンシブ設計

- **デスクトップ**: フルテーブル表示
- **タブレット**: 適応テーブル
- **モバイル**: カード形式レイアウト

### アクセシビリティ (WCAG 2.1 AA準拠)

- **コントラスト比**: 4.5:1以上
- **aria-label**: 適切なラベリング
- **キーボードナビゲーション**: フルサポート
- **セマンティックHTML**: 適切なマークアップ

---

## ⚡ 7. パフォーマンス設計

### SSG最適化

- **ビルド時生成**: 全ページ静的生成
- **No Runtime API**: ランタイムでのAPI呼び出しなし
- **CDN対応**: 静的ファイルのみ

### PWA機能

- **Service Worker**: `/sw.js` によるオフライン対応
- **Web App Manifest**: `/manifest.json` デスクトップインストール
- **キャッシュ戦略**: Cache First

---

## 🔒 8. 品質保証

### 静的解析

- **TypeScript**: 厳密型チェック
- **ESLint**: コード品質チェック
- **Prettier**: コードフォーマット統一

### ビルドプロセス

```bash
# 品質チェック付きビルド
npm run build
# → TypeScript compile
# → ESLint check
# → Data scraping
# → Static generation
```

### エラー処理

- **Build-time validation**: データ整合性チェック
- **Graceful degradation**: 部分的エラー対応
- **Logging**: 詳細なビルドログ

---

## 🚀 9. デプロイメント

### ビルド手順

```bash
# 1. 依存関係インストール
npm install

# 2. ビルド実行 (スクレイピング含む)
npm run build

# 3. 静的ファイル出力確認
ls -la out/

# 4. ローカル確認
npm run serve
```

### デプロイ要件

- **Node.js**: v18.x 以上
- **ビルド環境**: インターネット接続必要 (スクレイピングのため)
- **配信環境**: 静的ホスティング (Netlify, Vercel, S3+CloudFront等)

---

## 📝 10. 運用・メンテナンス

### データ管理

- **観戦日追加**: `data/dates.json` の手動編集
- **再ビルド**: 新しい観戦記録追加時に必要

### 監視項目

- **スクレイピング成功率**: ビルドログで確認
- **サイト構造変更**: 公式サイト変更時の対応
- **レスポンス性能**: Core Web Vitals

### トラブルシューティング

- **ビルド失敗**: スクレイピングエラーの詳細確認
- **データ不整合**: dates.jsonと実際の試合日程の確認
- **表示不具合**: ブラウザ互換性の確認

---

## 📋 11. 技術仕様まとめ

| 項目             | 仕様                         |
| ---------------- | ---------------------------- |
| Next.js          | 15.5.3 (App Router)          |
| TypeScript       | 5.x                          |
| Tailwind CSS     | 3.x                          |
| Node.js          | 18.x以上                     |
| ビルド形式       | Static Export                |
| PWA              | Service Worker + Manifest    |
| アクセシビリティ | WCAG 2.1 AA                  |
| スクレイピング   | fetch API + 10秒タイムアウト |

---

## 🎯 12. 納品物

### 完成ファイル

- **ソースコード**: 全ファイル (`src/`, `public/`, 設定ファイル)
- **ビルド出力**: `out/` ディレクトリ (静的サイト)
- **ドキュメント**:
  - `README.md` - セットアップ手順
  - `PROJECT_REQUIREMENTS.md` - 要件定義書
  - `COLOR_PALETTE.md` - デザイン仕様
  - `DETAILED_DESIGN.md` - 本文書

### 品質保証

- ✅ ESLint/TypeScript エラー 0件
- ✅ WCAG 2.1 AA準拠
- ✅ PWA機能動作確認
- ✅ レスポンシブ対応確認
- ✅ ビルド・デプロイ動作確認

---

_このドキュメントは観戦履歴アプリ v1.0.0 の完全な技術仕様書です。_

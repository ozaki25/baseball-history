import { createFileRoute } from "@tanstack/react-router";
import type { GamesData } from "#/types/game";
import gamesData from "../../data/games.json";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { games } = gamesData as GamesData;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-fb-blue">観戦ノート</h1>
      <p className="mt-1 text-sm text-neutral-500">
        足場フェーズ: ダミーデータ {games.length} 件を読み込み
      </p>

      <ul className="mt-6 divide-y divide-neutral-200 border-y border-neutral-200">
        {games.map((game) => (
          <li key={game.id} className="flex items-center gap-3 py-2 font-mono text-sm">
            <span className="tabular-nums text-neutral-500">{game.date}</span>
            <span className="flex-1">vs {game.opponent || "—"}</span>
            <span className="text-neutral-400">{game.stadium}</span>
            <span className="w-14 text-right font-semibold">{game.result}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}

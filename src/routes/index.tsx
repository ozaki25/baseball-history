import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import type { GamesData, Game } from "#/types/game";
import gamesData from "../../data/games.json";
import { validateGameSearch, searchToFilter, filterToSearch } from "#/lib/search";
import { applyFilters, deriveOptions, type GameFilter } from "#/lib/filters";
import { StatsSummary } from "#/components/StatsSummary";
import { ScheduledList } from "#/components/ScheduledList";
import { Filters } from "#/components/Filters";
import { CrossStats } from "#/components/CrossStats";
import { GameTable } from "#/components/GameTable";

export const Route = createFileRoute("/")({
  validateSearch: validateGameSearch,
  component: Home,
});

const ALL_GAMES: Game[] = (gamesData as GamesData).games;
const FILTER_OPTIONS = deriveOptions(ALL_GAMES);

function Home() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const filter = searchToFilter(search);

  const { attended, scheduled } = useMemo(() => {
    const filtered = applyFilters(ALL_GAMES, filter);
    // 予定は結果フィルタを無視して、他の軸だけで抽出（別枠表示のため）
    const scheduledView = applyFilters(ALL_GAMES, { ...filter, results: [] }).filter(
      (g) => g.result === "scheduled",
    );
    return {
      attended: filtered.filter((g) => g.result !== "scheduled"),
      scheduled: scheduledView,
    };
  }, [search]);

  const setFilter = (next: GameFilter) => {
    void navigate({ search: filterToSearch(next) });
  };

  return (
    <div className="min-h-dvh">
      <header
        className="border-b"
        style={{ borderColor: "var(--line)", background: "var(--panel)" }}
      >
        <div className="h-1 w-full" style={{ background: "var(--brand)" }} aria-hidden />
        <div className="mx-auto flex max-w-3xl items-baseline gap-2 px-4 py-3">
          <h1 className="text-lg font-bold tracking-tight">観戦ノート</h1>
          <p className="text-xs text-[var(--muted)]">北海道日本ハムファイターズ 観戦記録</p>
        </div>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-4 pb-20">
        {scheduled.length > 0 && <ScheduledList games={scheduled} />}

        <StatsSummary games={attended} />

        <Filters filter={filter} options={FILTER_OPTIONS} onChange={setFilter} />

        <CrossStats games={attended} />

        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[var(--muted)]">
            観戦記録
            <span className="tnum ml-1.5 font-normal text-[var(--faint)]">{attended.length}件</span>
          </h2>
        </div>
        <GameTable games={attended} />
      </main>
    </div>
  );
}

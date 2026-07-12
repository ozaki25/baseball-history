import { createFileRoute, useNavigate } from "@tanstack/react-router";
import type { GamesData, Game, DatesData } from "#/domain/game";
import gamesData from "../../data/games.json";
import datesData from "../../data/dates.json";
import { validateGameSearch } from "#/domain/query/search";
import { HomeView } from "#/features/home/HomeView";

export const Route = createFileRoute("/")({
  validateSearch: validateGameSearch,
  component: RouteComponent,
});

const ALL_GAMES: Game[] = (gamesData as GamesData).games;
// dates.json の全年度（記録なしの空配列年を含む）を年度候補の源にする。
const ALL_YEARS: string[] = Object.keys(datesData as DatesData);

function RouteComponent() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  return (
    <HomeView
      games={ALL_GAMES}
      allYears={ALL_YEARS}
      search={search}
      // フィルタ変更で履歴を積まない（戻る連打を防ぐ）
      onNavigate={(next) => void navigate({ search: next, replace: true })}
    />
  );
}

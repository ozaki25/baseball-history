import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ALL_GAMES, ALL_YEARS } from "#/data/games";
import { validateGameSearch } from "#/domain/query/search";
import { HomeView } from "#/features/home/HomeView";

export const Route = createFileRoute("/")({
  validateSearch: validateGameSearch,
  component: RouteComponent,
});

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

import { describe, it, expect } from "vitest";
import { partitionGames } from "./derive";
import { emptyFilter } from "#/features/filters/model/filters";
import { makeGame } from "#/tests/helpers/makeGame";

const games = [
  makeGame({ id: "a", date: "2025-04-01", result: "win", stadium: "エスコンフィールド" }),
  makeGame({
    id: "b",
    date: "2025-05-01",
    result: "lose",
    stadium: "ZOZOマリン",
    homeAway: "away",
  }),
  makeGame({
    id: "c",
    date: "2026-08-10",
    result: "scheduled",
    opponent: "",
    stadium: "",
    homeAway: null,
    score: { fighters: null, opponent: null },
  }),
  makeGame({ id: "d", date: "2024-07-07", result: "win", stadium: "エスコンフィールド" }),
];

describe("partitionGames", () => {
  it("attended は scheduled を除き、scheduled は予定のみを別枠に集める", () => {
    const { attended, scheduled } = partitionGames(games, emptyFilter);
    expect(attended.map((g) => g.id)).toEqual(["a", "b", "d"]);
    expect(scheduled.map((g) => g.id)).toEqual(["c"]);
  });

  it("scheduled は球場など年度以外の条件を無視して残る（予定は別枠表示のため）", () => {
    const filter = { ...emptyFilter, stadiums: [games[0]!.stadiumId] }; // エスコンで絞る
    const { attended, scheduled } = partitionGames(games, filter);
    expect(attended.map((g) => g.id)).toEqual(["a", "d"]); // 観戦はエスコンのみ
    expect(scheduled.map((g) => g.id)).toEqual(["c"]); // 予定は球場条件を無視して残る
  });

  it("年度で絞ると attended も scheduled もその年度だけになる", () => {
    const y2025 = partitionGames(games, { ...emptyFilter, year: "2025" });
    expect(y2025.attended.map((g) => g.id)).toEqual(["a", "b"]);
    expect(y2025.scheduled).toEqual([]); // 予定は2026なので消える

    const y2026 = partitionGames(games, { ...emptyFilter, year: "2026" });
    expect(y2026.attended).toEqual([]);
    expect(y2026.scheduled.map((g) => g.id)).toEqual(["c"]);
  });
});

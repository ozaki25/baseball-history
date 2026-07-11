import { describe, it, expect } from "vitest";
import type { GamesData } from "#/types/game";
import gamesData from "../../data/games.json";
import { resolveTeam, resolveStadium } from "#/lib/masters";

describe("masters", () => {
  it("表記ゆれを同一IDに束ねる", () => {
    expect(resolveTeam("横浜").id).toBe(resolveTeam("横浜DeNA").id);
    expect(resolveStadium("西武ドーム").id).toBe(resolveStadium("ベルーナドーム").id);
    expect(resolveStadium("西武プリンス").id).toBe(resolveStadium("ベルーナドーム").id);
  });

  it("未知の名称はフォールバックで名前ベースのIDになる", () => {
    expect(resolveStadium("架空球場").id).toBe("架空球場");
  });
});

describe("games.json の安定IDが masters と整合（再解決と一致）", () => {
  const { games } = gamesData as GamesData;

  it("全レコードで opponentId/stadiumId が表示名の再解決と一致する", () => {
    for (const g of games) {
      expect(g.opponentId).toBe(g.opponent ? resolveTeam(g.opponent).id : "");
      expect(g.stadiumId).toBe(g.stadium ? resolveStadium(g.stadium).id : "");
    }
  });
});

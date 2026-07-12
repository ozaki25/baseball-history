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

describe("resolve の冪等性（往復の不動点）", () => {
  // search の filter⇔URL 往復は「安定IDが resolve の不動点である」ことに依存する。
  // ID に正規化で変わる文字（大文字/空白等）を持つマスタを足すと静かに壊れるため回帰で固定する。
  const teamNames = ["千葉ロッテ", "ロッテ", "日ハム", "横浜DeNA", "近鉄", "__未知の球団__"];
  const stadiumNames = ["エスコンフィールド", "西武ドーム", "ZOZOマリン", "__未知の球場__"];

  it("resolve(resolve(name).id).id === resolve(name).id（IDは往復で不変）", () => {
    for (const n of teamNames) {
      const id = resolveTeam(n).id;
      expect(resolveTeam(id).id).toBe(id);
    }
    for (const n of stadiumNames) {
      const id = resolveStadium(n).id;
      expect(resolveStadium(id).id).toBe(id);
    }
  });
});

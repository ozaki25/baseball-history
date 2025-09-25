export interface GameInfo {
  myTeam: string;
  vsTeam: string;
  myScore: number;
  vsScore: number;
  location: string;
  isHome: boolean;
}

export class ParseError extends Error {
  constructor(
    message: string,
    public readonly step: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ParseError';
  }
}

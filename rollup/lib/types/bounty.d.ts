export type Bounty = {
  title: string;
  endsAt: number;
  amount: number;
  problem: string;
  test: string;
  solution: string;
  status: "0" | "1";
  winner: string;
};

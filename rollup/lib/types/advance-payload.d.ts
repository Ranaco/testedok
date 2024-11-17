export type PayloadType = "create-bounty" | "request-bounty" | "update-bounty";

export type AdvancePayloadType = {
  title: string;
  endsAt: number;
  bountyId: string;
  amount: number;
  type: PayloadType;
  test: string;
  submission: string;
  payload: Record<string, any>;
  sender: string;
  createdAt: number | undefined;
  updatedAt: number | undefined;
  statement: string;
};

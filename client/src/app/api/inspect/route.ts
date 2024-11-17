import { NextResponse, NextRequest } from "next/server";
import { hex2str } from "@/lib/methods/bounties";

const ROLLUP_URL = process.env.ROLLUP_URL || "http://localhost:8080";

export const POST = async (req: NextRequest) => {
  const id = await req.json();
  const url = ROLLUP_URL + "/inspect" + "/get-bounty/" + id;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const response = await res.json();
  const { reports } = response;

  const parsedData = JSON.parse(hex2str(reports[0].payload));

  const { message } = parsedData;
  console.log("MessageFrom", id, message);

  return NextResponse.json(message ?? {}, {
    status: 200,
  });
};

export const GET = async () => {
  const url = "http://localhost:8080/inspect/list-bounties";

  const res = await fetch(url);

  const response = await res.json();

  const { reports } = response;

  const parsedData = JSON.parse(hex2str(reports[0].payload));

  const {
    message: { bounties: data },
  } = parsedData;

  console.log("Message", data, url);
  return NextResponse.json(data ?? {}, {
    status: 200,
  });
};

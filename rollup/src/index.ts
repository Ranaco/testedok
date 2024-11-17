import createClient from "openapi-fetch";
import { ethers } from "ethers";
import { components, paths } from "./schema";
import { cleanHeader, hex2str, generateRandomID } from "../lib/misc";
import { AdvancePayloadType, Bounty, PayloadType } from "../lib/types";
import RollUpRequest from "../lib/request";
import manager from "../lib/test_engine";

// Types for request and responses
type AdvanceRequestData = components["schemas"]["Advance"];
type InspectRequestData = components["schemas"]["Inspect"];
type RequestHandlerResult = components["schemas"]["Finish"]["status"];
type RollupsRequest = components["schemas"]["RollupRequest"];
type InspectRequestHandler = (data: InspectRequestData) => Promise<void>;
type AdvanceRequestHandler = (
  data: AdvanceRequestData,
) => Promise<RequestHandlerResult>;

// Constants
const bountyContract = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"; // Replace with actual contract address
const abiEncoder = new ethers.AbiCoder();
const rollupServer =
  process.env.ROLLUP_HTTP_SERVER_URL || "http://127.0.0.1:5004";

console.log("HTTP rollup_server URL is " + rollupServer);

// In-memory storage for bounties and test cases
const bounty: Record<string, Bounty> = {};

// -----------------------------------------
// HANDLE REQUEST-BOUNTY
// -----------------------------------------
const handleRequestBounty = async (
  bountyId: string,
  submissionId: string,
  submission: string,
  rollupRequest: RollUpRequest,
): Promise<{ success: boolean; message: string }> => {
  const cartesiManager = manager();

  try {
    const result = await cartesiManager.runTests(
      submission,
      bountyId,
      submissionId,
    );

    if (result.success) {
      console.log(`Tests passed for submission: ${submissionId}`);

      await rollupRequest.sendReport({
        type: "request-bounty",
        sender: "Cartesi VM",
        message: `Submission ${submissionId} passed tests for bounty ${bountyId}.`,
      });

      return { success: true, message: `Submission ${submissionId} passed.` };
    } else {
      console.error(`Tests failed for submission: ${submissionId}`);

      await rollupRequest.sendReport({
        type: "request-bounty",
        sender: "Cartesi VM",
        message: `Submission ${submissionId} failed tests for bounty ${bountyId}. Errors: ${result.logs?.join(", ")}`,
      });

      return { success: false, message: `Submission ${submissionId} failed.` };
    }
  } catch (error: any) {
    console.error(
      `Error handling request-bounty for submission: ${submissionId}`,
      error,
    );

    await rollupRequest.sendReport({
      type: "request-bounty",
      sender: "Cartesi VM",
      message: `Error processing submission ${submissionId} for bounty ${bountyId}: ${error.message}`,
    });

    return {
      success: false,
      message: `Error processing submission: ${error.message}`,
    };
  }
};

// -----------------------------------------
// HANDLE ADVANCE
// -----------------------------------------
const handleAdvance: AdvanceRequestHandler = async (data) => {
  try {
    const metadata = data.metadata;
    let bountyId = "";
    const rollupRequest = new RollUpRequest();
    const sender = metadata.msg_sender;
    const timestamp = metadata.timestamp;
    const rawPayload = data.payload;

    const payload: Partial<AdvancePayloadType> = JSON.parse(
      hex2str(rawPayload),
    );

    payload.sender = sender;
    payload.createdAt = timestamp;

    const { test, statement, title, endsAt } = payload;

    switch (payload.type as PayloadType) {
      case "create-bounty":
        const amount = payload.amount;
        if (!amount) {
          await rollupRequest.sendReport({
            type: "create-bounty",
            sender,
            message: "Bounty amount is missing.",
          });
          return "reject";
        }

        bountyId = generateRandomID();
        const cartesiManager = manager();

        const vmRes = await cartesiManager.createProject(
          bountyId,
          test ?? "",
          statement ?? "",
        );
        if (vmRes === "fail") {
          throw new Error("Failed to initialize the Cartesi VM project");
        }

        bounty[bountyId] = {
          title: title ?? "",
          endsAt: endsAt ?? 0,
          amount,
          problem: statement ?? "",
          test: test ?? "",
          solution: "",
          status: "0",
          winner: "",
        };

        const methodHeader = ethers
          .keccak256(ethers.toUtf8Bytes("createBounty(uint256,uint256)"))
          .slice(0, 10);
        const encodedParams = abiEncoder.encode(
          ["uint256", "uint256"],
          [amount, ethers.toBigInt(bountyId)],
        );
        const chainPayload = cleanHeader(methodHeader) + encodedParams.slice(2);

        await rollupRequest.sendVoucher({
          destination: bountyContract,
          payload: chainPayload,
        });

        await rollupRequest.sendNotice({
          type: "create-bounty",
          sender,
          message: `Bounty: ${bountyId}, created successfully.`,
          bountyId,
        });

        console.log(
          `Bounty ${bountyId} created successfully with amount: ${amount}`,
        );
        break;

      case "request-bounty":
        payload.updatedAt = timestamp;
        bountyId = payload.bountyId ?? "";
        const submissionId = generateRandomID();
        const submission = payload.submission;

        if (!bountyId || !submissionId || !submission) {
          throw new Error("Missing required data for request-bounty.");
        }

        const result = await handleRequestBounty(
          bountyId,
          submissionId,
          submission,
          rollupRequest,
        );
        if (result.success) {
          const updateBounty = bounty[bountyId]!;
          updateBounty.solution = submission;
          updateBounty.status = "1";
          updateBounty.winner = sender;
          bounty[bountyId] = updateBounty;

          console.log(`Request-bounty succeeded: ${result.message}`);
        } else {
          console.warn(`Request-bounty failed: ${result.message}`);
        }
        break;

      default:
        console.warn(`Unknown payload type: ${payload.type}`);
        await rollupRequest.sendException(payload);
        break;
    }

    return "accept";
  } catch (error) {
    console.error("Error in handleAdvance:", error);
    return "reject";
  }
};

// -----------------------------------------
// HANDLE INSPECT
// -----------------------------------------
const handleInspect: InspectRequestHandler = async (data) => {
  try {
    console.log("Received inspect request data:", JSON.stringify(data));

    const payload = data.payload;
    const query = hex2str(payload);

    const rollupRequest = new RollUpRequest();
    const [command, id] = query.split("/");

    if (command === "get-bounty") {
      if (id && bounty[id]) {
        const bountyData = bounty[id]!;
        const response = { id, ...bountyData };
        console.log(`Sharing bounty data for ID: ${id}`, response);
        await rollupRequest.sendReport({
          type: "inspect-state",
          message: response,
        });
      } else {
        await rollupRequest.sendReport({
          type: "inspect-state",
          message: { error: `Bounty not found for ID: ${id}` },
        });
      }
    } else if (command === "list-bounties") {
      const allBounties = Object.entries(bounty).map(([id, data]) => ({
        id,
        ...data,
      }));
      await rollupRequest.sendReport({
        type: "inspect-state",
        message: { bounties: allBounties },
      });
    } else {
      await rollupRequest.sendReport({
        type: "inspect-state",
        message: { error: `Unknown command: ${command}` },
      });
    }
  } catch (error) {
    console.error("Error in handleInspect:", error);
  }
};

// -----------------------------------------
// MAIN FUNCTION
// -----------------------------------------
const main = async () => {
  const { POST } = createClient<paths>({ baseUrl: rollupServer });
  let status: RequestHandlerResult = "accept";

  while (true) {
    const { response } = await POST("/finish", {
      body: { status },
      parseAs: "text",
    });

    if (response.status === 200) {
      const data = (await response.json()) as RollupsRequest;
      if (data.request_type === "advance_state") {
        status = await handleAdvance(data.data as AdvanceRequestData);
      } else if (data.request_type === "inspect_state") {
        await handleInspect(data.data as InspectRequestData);
      }
    } else if (response.status === 202) {
      console.log(await response.text());
    }
  }
};

main().catch((e) => {
  console.error("Error in main:", e);
  process.exit(1);
});

import { ROLLUP_ENDPOINT, str2hex } from "./misc";
import { AdvancePayloadType } from "./types";

interface IRollUpRequest {
  sendVoucher: (payload: { destination: string; payload: string }) => void;
  sendReport: (payload: { type: string; sender: string; message: any }) => void;
  sendNotice: (payload: any) => void;
  sendException: (payload: AdvancePayloadType) => void;
}

export default class RollUpRequest implements IRollUpRequest {
  private async sendPostRequest(
    type: "notice" | "voucher" | "report" | "exception",
    payload: AdvancePayloadType | any,
  ) {
    try {
      fetch(ROLLUP_ENDPOINT + "/" + type, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payload: str2hex(JSON.stringify(payload)),
        }),
      });
    } catch (err: any) {
      console.error(err);
      throw new Error(err);
    }
  }

  sendVoucher = (payload: { destination: string; payload: string }) =>
    this.sendPostRequest("voucher", payload);
  sendReport = (payload: { type: string; sender?: string; message: any }) =>
    this.sendPostRequest("report", payload);
  sendNotice = (payload: any) => this.sendPostRequest("notice", payload);
  sendException = (payload: Partial<AdvancePayloadType>) =>
    this.sendPostRequest("exception", payload);
}

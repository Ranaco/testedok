import axios from "axios";
import { ethers } from "ethers";

/**
 * Decode a hex string into a regular string
 * @param {string} hexStr - Input hex string
 * @returns {string} Decoded string
 */
export const hex2str = (hex: string) => {
  return ethers.toUtf8String(hex);
};

/**
 * Encode a string as a hex string
 * @param {string} str - Input string
 * @returns {string} Hex string representation
 */
export const str2hex = (payload: string) => {
  return ethers.hexlify(ethers.toUtf8Bytes(payload));
};

export async function fetchAllBounties() {
  try {
    const response = await axios.get("/api/inspect");
    return response.data?.filter((bounty: any) => bounty.status === "0");
  } catch (error) {
    console.error("Error fetching bounties:", error);
    throw error;
  }
}

export async function fetchBounty(id: string) {
  try {
    const response = await axios.post("/api/inspect", {
      body: JSON.stringify({ id }),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching bounties:", error);
    throw error;
  }
}

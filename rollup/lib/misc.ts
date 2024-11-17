import { ethers } from "ethers";
import zlib from "zlib";

const envOrDefault = (key: string, alt: string) => process.env[key] || alt;

/**
 * Encode a string as a hex string
 * @param {string} str - Input string
 * @returns {string} Hex string representation
 */
function str2hex(payload: string) {
  return ethers.hexlify(ethers.toUtf8Bytes(payload));
}

/**
 * Encode a string as a binary Buffer
 * @param {string} str - Input string
 * @returns {Buffer} Binary representation
 */
const str2binary = (str: string) => {
  return Buffer.from(str, "utf-8");
};

/**
 * Encode a binary Buffer as a hex string
 * @param {Buffer} binary - Input binary Buffer
 * @returns {string} Hex string representation
 */
const binary2hex = (binary: any) => {
  return "0x" + binary.toString("hex");
};

/**
 * Decode a hex string into a binary Buffer
 * @param {string} hexStr - Input hex string
 * @returns {Buffer} Binary Buffer representation
 */
const hex2binary = (hexStr: any) => {
  if (!hexStr.startsWith("0x")) {
    throw new Error("Hex string must start with '0x'");
  }
  return Buffer.from(hexStr.slice(2), "hex");
};

/**
 * Decode a hex string into a regular string
 * @param {string} hexStr - Input hex string
 * @returns {string} Decoded string
 */
function hex2str(hex: string) {
  return ethers.toUtf8String(hex);
}

/**
 * Decompress a hex string containing compressed data
 * @param {string} hexStr - Input hex string
 * @returns {Buffer} Decompressed data
 */
const decompress = (hexStr: string) => {
  const compressedData = hex2binary(hexStr);
  return zlib.inflateSync(compressedData);
};

/**
 * Clean the header of a mint function by removing '0x' and returning as Buffer
 * @param {string} mintHeader - Input header string
 * @returns {Buffer} Cleaned header
 */
const cleanHeader = (mintHeader: string) => {
  if (mintHeader.startsWith("0x")) {
    mintHeader = mintHeader.slice(2);
  }
  return Buffer.from(mintHeader, "hex");
};

function generateRandomID(): string {
  return Math.floor(Math.random() * 1e12).toString();
}

export {
  generateRandomID,
  str2hex,
  str2binary,
  binary2hex,
  hex2binary,
  hex2str,
  decompress,
  cleanHeader,
};

export const ROLLUP_ENDPOINT = envOrDefault(
  "ROLLUP_HTTP_SERVER_URL",
  "http://localhost:8080",
);

import { randomBytes } from "node:crypto";

export function generateSecret(length = 32): string {
  return randomBytes(length).toString("hex");
}

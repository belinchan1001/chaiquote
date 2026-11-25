/**
 * Dedicated /llms.txt handler for the Nitro / Vercel function.
 * Same rationale as server/routes/robots.txt.ts: keep the response
 * text/plain instead of an app-document 404.
 */
import { llmsTxtResponse } from "../llms-txt";

export default function llmsTxt() {
  return llmsTxtResponse();
}

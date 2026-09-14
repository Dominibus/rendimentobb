import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("orchestrator prioritizes the current parsed PDF over the previous executive report", async () => {
  const source = await readFile(
    new URL("../js/chatbot/core/chatbot-orchestrator.js", import.meta.url),
    "utf8"
  );

  const activeReportBlock = source.match(
    /activeReport:\s*([\s\S]*?)uploadedReports:/
  )?.[1] || "";

  assert.match(
    activeReportBlock,
    /rbDocumentManager\?\.getLast\?\.\(\)\?\.analysis/
  );
  assert.ok(
    activeReportBlock.indexOf("rbDocumentManager") <
      activeReportBlock.indexOf("lastExecutiveReport"),
    "the current parsed document must be checked before stale report memory"
  );
});

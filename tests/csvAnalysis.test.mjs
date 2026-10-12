import test from "node:test";
import assert from "node:assert/strict";
import { analyzeCsvText } from "../src/lib/csvAnalysis.ts";

test("groups affected products and sorts by severity", () => {
  const result = analyzeCsvText(
    "Item ID,Issue,Link\na,Warning,https://example.com/a\nb,Mismatched product price,https://example.com/b\nc,Mismatched product price,https://example.com/c",
  );
  assert.equal(result.rowsCount, 3);
  assert.deepEqual(
    result.issueGroups.map(({ issue, count, priority }) => ({
      issue,
      count,
      priority,
    })),
    [
      { issue: "Mismatched product price", count: 2, priority: "High" },
      { issue: "Warning", count: 1, priority: "Medium" },
    ],
  );
});
test("preserves commas and escaped quotes in quoted fields", () => {
  const result = analyzeCsvText('ID,Title,Issue\n1,"Cup, ""blue""",Warning');
  assert.equal(result.issueGroups[0].sample[0].Title, 'Cup, "blue"');
});
test("supports embedded line breaks and CRLF records", () => {
  const result = analyzeCsvText(
    'ID,Title,Issue\r\n1,"Two\r\nlines",Warning\r\n',
  );
  assert.equal(result.rowsCount, 1);
  assert.equal(result.issueGroups[0].sample[0].Title, "Two\nlines");
});
test("ignores empty lines", () => {
  assert.equal(analyzeCsvText("ID,Issue\n\n1,Warning\n\n").rowsCount, 1);
});
test("accepts UTF-8 BOM headers", () => {
  const result = analyzeCsvText("\uFEFFItem ID,Issue\n1,Warning");
  assert.equal(result.detectedColumns.id, "Item ID");
});
test("prefers an exact column alias to a longer partial label", () => {
  const result = analyzeCsvText(
    "Approval Status,Status,ID\nApproved,Disapproved,1",
  );
  assert.equal(result.detectedColumns.status, "Status");
  assert.equal(result.issueGroups.length, 0);
  assert.deepEqual(result.statusGroups, [{ status: "Disapproved", count: 1 }]);
});
test("does not mistake grid for ID", () => {
  assert.equal(
    analyzeCsvText("Grid,Issue\n123,Warning").detectedColumns.id,
    undefined,
  );
});
test("rejects duplicate headers instead of silently overwriting values", () => {
  const result = analyzeCsvText("ID,Issue,Issue\n1,Warning,Disapproved");
  assert.equal(result.rowsCount, 0);
  assert.match(result.warnings[0], /duplicate column names/);
});
test("also rejects duplicate headers that differ only in casing", () => {
  assert.match(
    analyzeCsvText("ID,Issue,issue\n1,Warning,Disapproved").warnings[0],
    /duplicate/,
  );
});
test("does not claim status-based grouping when neither column exists", () => {
  const result = analyzeCsvText("ID,Title\n1,Cup");
  assert.match(result.warnings[0], /No Issue or Status/);
  assert.equal(result.issueGroups.length, 0);
  assert.equal(result.rowClassification.unclassified, 1);
});
test("distinguishes an empty issue cell from a missing column", () => {
  const result = analyzeCsvText("ID,Issue\n1,");
  assert.equal(result.issueGroups.length, 0);
  assert.equal(result.rowClassification.withoutIssue, 1);
});
test("rejects unclosed quoted fields", () => {
  const result = analyzeCsvText('ID,Title,Issue\n1,"Cup,Warning');
  assert.equal(result.rowsCount, 0);
  assert.match(result.warnings[0], /unclosed quoted field/);
});
test("header-only files return a clear warning", () => {
  const result = analyzeCsvText("ID,Issue\n");
  assert.equal(result.rowsCount, 0);
  assert.match(result.warnings[0], /no product rows/);
});

test("rejects extra and missing cells instead of losing data", () => {
  for (const csv of ["ID,Issue\n1,Warning,Lost", "ID,Issue\n1"]) {
    const result = analyzeCsvText(csv);
    assert.equal(result.rowsCount, 0);
    assert.match(result.warnings[0], /number of cells/);
  }
});
test("rejects generated header collisions", () => {
  assert.match(analyzeCsvText(",column_1\n1,Warning").warnings[0], /duplicate/);
});
test("rejects malformed quote positions", () => {
  for (const csv of ['ID,Issue\n1,Warn"ing"', 'ID,Issue\n1,"Warning"junk'])
    assert.equal(analyzeCsvText(csv).rowsCount, 0);
});
test("retains prototype-named CSV columns as ordinary values", () => {
  const result = analyzeCsvText("__proto__,Issue\nProduct,Warning");
  assert.equal(result.issueGroups[0].sample[0].__proto__, "Product");
});
test("bounds input size before parsing", () => {
  assert.match(analyzeCsvText("x".repeat(2_000_001)).warnings[0], /limited/);
});

test("URL samples are distinct and include later unique products", () => {
  const result = analyzeCsvText(
    "Issue,Link\nWarning,https://example.com/a\nWarning,https://example.com/a\nWarning,https://example.com/b",
  );
  assert.equal(result.rowsCount, 3);
  assert.deepEqual(result.topUrls, [
    "https://example.com/a",
    "https://example.com/b",
  ]);
});

test("preserves raw field whitespace while normalizing issue grouping", () => {
  const result = analyzeCsvText('ID,Title,Issue\n1,"  Cup  "," Warning "');
  assert.equal(result.issueGroups[0].sample[0].Title, "  Cup  ");
  assert.equal(result.issueGroups[0].sample[0].Issue, " Warning ");
  assert.equal(result.issueGroups[0].issue, "Warning");
});

test("unrecognized issue text is Unrated while absent values create no group", () => {
  const result = analyzeCsvText("ID,Issue\n1,Custom issue\n2,");
  assert.deepEqual(
    result.issueGroups.map((group) => group.priority),
    ["Unrated"],
  );
  assert.equal(result.rowClassification.withoutIssue, 1);
});

test("status-only rows are not fabricated issue groups", () => {
  const result = analyzeCsvText(
    'ID,Status\n1,Approved\n2,Disapproved\n3,\n4," "',
  );
  assert.equal(result.rowsCount, 4);
  assert.deepEqual(result.issueGroups, []);
  assert.deepEqual(result.statusGroups, [
    { status: "Approved", count: 1 },
    { status: "Disapproved", count: 1 },
  ]);
  assert.deepEqual(result.rowClassification, {
    withIssue: 0,
    withoutIssue: 0,
    statusOnly: 2,
    unclassified: 2,
  });
});
test("Issue wins over Status and blank Issue never falls back to status", () => {
  const result = analyzeCsvText(
    'ID,Issue,Status\n1,Custom issue,Approved\n2,,Disapproved\n3," ",Pending\n4,Warning,',
  );
  assert.equal(result.rowsCount, 4);
  assert.deepEqual(result.statusGroups, []);
  assert.deepEqual(result.rowClassification, {
    withIssue: 2,
    withoutIssue: 2,
    statusOnly: 0,
    unclassified: 0,
  });
  assert.deepEqual(result.issueGroups.map((g) => g.issue).sort(), [
    "Custom issue",
    "Warning",
  ]);
});
test("all classified row counts sum to accepted product rows", () => {
  for (const csv of [
    "ID,Title\n1,Cup\n2,Bowl",
    "ID,Issue\n1,Warning\n2,",
    "ID,Status\n1,Approved\n2,",
    "ID,Issue",
    "ID,Issue\n1,Warning,extra",
  ]) {
    const result = analyzeCsvText(csv);
    assert.equal(
      Object.values(result.rowClassification).reduce(
        (total, count) => total + count,
        0,
      ),
      result.rowsCount,
    );
    assert.equal(
      result.issueGroups.reduce((total, group) => total + group.count, 0),
      result.rowClassification.withIssue,
    );
    if (!result.rowsCount) assert.deepEqual(result.statusGroups, []);
  }
});

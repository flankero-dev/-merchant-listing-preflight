type CsvRow = Record<string, string>;

type Priority = "High" | "Medium" | "Unrated";

export type CsvAnalysis = {
  fileName: string;
  rowsCount: number;
  headers: string[];
  detectedColumns: {
    issue?: string;
    title?: string;
    link?: string;
    id?: string;
    price?: string;
    availability?: string;
    status?: string;
  };
  rowClassification: {
    withIssue: number;
    withoutIssue: number;
    statusOnly: number;
    unclassified: number;
  };
  statusGroups: { status: string; count: number }[];
  issueGroups: {
    issue: string;
    count: number;
    priority: Priority;
    sample: CsvRow[];
  }[];
  warnings: string[];
  topUrls: string[];
};

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/^\uFEFF/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseCsv(text: string): string[][] {
  if (text.length > 2_000_000)
    throw new Error("CSV is limited to 2 million characters.");
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let state: "plain" | "quoted" | "closed" = "plain";
  const normalized = text
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
  const endField = () => {
    row.push(value);
    value = "";
    state = "plain";
  };
  const endRow = () => {
    endField();
    if (row.some((cell) => cell.length > 0)) rows.push(row);
    if (rows.length > 10_001)
      throw new Error("CSV is limited to 10,000 product rows.");
    row = [];
  };
  for (let i = 0; i < normalized.length; i += 1) {
    const char = normalized[i];
    if (state === "quoted") {
      if (char === '"') {
        if (normalized[i + 1] === '"') {
          value += '"';
          i += 1;
        } else state = "closed";
      } else value += char;
    } else if (char === ",") endField();
    else if (char === "\n") endRow();
    else if (state === "closed") {
      if (!/\s/.test(char))
        throw new Error("CSV contains unexpected text after a quoted field.");
    } else if (char === '"') {
      if (value.trim())
        throw new Error("CSV contains a quote inside an unquoted field.");
      value = "";
      state = "quoted";
    } else value += char;
  }
  if (state === "quoted")
    throw new Error("CSV contains an unclosed quoted field.");
  if (value.length || row.length || state === "closed") endRow();
  return rows;
}

function rowsToObjects(matrix: string[][]): {
  headers: string[];
  rows: CsvRow[];
} {
  const headers = matrix[0].map((header, index) => {
    const clean = header.replace(/^\uFEFF/, "").trim();
    return clean || `column_${index + 1}`;
  });

  const rows = matrix.slice(1).map((line) => {
    const row: CsvRow = Object.create(null);

    headers.forEach((header, index) => {
      row[header] = line[index] ?? "";
    });

    return row;
  });

  return { headers, rows };
}

function findColumn(
  headers: string[],
  candidates: string[],
): string | undefined {
  const normalizedCandidates = candidates.map(normalizeText);
  // Prefer exact aliases before trying whole phrases in longer labels.
  for (const candidate of normalizedCandidates) {
    const exact = headers.find((header) => normalizeText(header) === candidate);
    if (exact) return exact;
  }
  return headers.find((header) => {
    const padded = ` ${normalizeText(header)} `;
    return normalizedCandidates.some((candidate) =>
      padded.includes(` ${candidate} `),
    );
  });
}

function getPriority(issue: string): Priority {
  const clean = normalizeText(issue);

  if (
    clean.includes("disapproved") ||
    clean.includes("suspension") ||
    clean.includes("suspended") ||
    clean.includes("mismatched product price") ||
    clean.includes("mismatched product availability") ||
    clean.includes("mismatched domains") ||
    clean.includes("different product landing page")
  ) {
    return "High";
  }

  if (
    clean.includes("warning") ||
    clean.includes("pending") ||
    clean.includes("check") ||
    clean.includes("limited")
  ) {
    return "Medium";
  }

  return "Unrated";
}

export function analyzeCsvText(
  text: string,
  fileName = "demo-merchant-center-export.csv",
): CsvAnalysis {
  let matrix: string[][];
  try {
    matrix = parseCsv(text);
  } catch (error) {
    return {
      fileName,
      rowsCount: 0,
      headers: [],
      detectedColumns: {},
      rowClassification: {
        withIssue: 0,
        withoutIssue: 0,
        statusOnly: 0,
        unclassified: 0,
      },
      statusGroups: [],
      issueGroups: [],
      topUrls: [],
      warnings: [
        error instanceof Error ? error.message : "CSV could not be parsed.",
      ],
    };
  }

  const rawHeaders = matrix[0] ?? [];
  const normalizedHeaders = rawHeaders.map(normalizeText);
  const generatedHeaders = rawHeaders.map(
    (header, index) => header.trim() || `column_${index + 1}`,
  );
  const duplicate =
    normalizedHeaders.some(
      (header, index) =>
        header.length > 0 && normalizedHeaders.indexOf(header) !== index,
    ) ||
    new Set(generatedHeaders.map(normalizeText)).size !==
      generatedHeaders.length;
  const invalidRow = matrix
    .slice(1)
    .findIndex((row) => row.length !== rawHeaders.length);
  if (duplicate || invalidRow !== -1) {
    return {
      fileName,
      rowsCount: 0,
      headers: rawHeaders,
      detectedColumns: {},
      rowClassification: {
        withIssue: 0,
        withoutIssue: 0,
        statusOnly: 0,
        unclassified: 0,
      },
      statusGroups: [],
      issueGroups: [],
      topUrls: [],
      warnings: [
        duplicate
          ? "CSV contains duplicate column names. Rename the repeated headers before analyzing."
          : `CSV product row ${invalidRow + 1} has a different number of cells than the header. Check delimiters and quotes.`,
      ],
    };
  }

  if (matrix.length < 2) {
    return {
      fileName,
      rowsCount: 0,
      headers: matrix[0] ?? [],
      detectedColumns: {},
      rowClassification: {
        withIssue: 0,
        withoutIssue: 0,
        statusOnly: 0,
        unclassified: 0,
      },
      statusGroups: [],
      issueGroups: [],
      topUrls: [],
      warnings: ["CSV looks empty or has no product rows."],
    };
  }

  const { headers, rows } = rowsToObjects(matrix);

  const detectedColumns = {
    issue: findColumn(headers, [
      "issue",
      "issues",
      "problem",
      "diagnostic issue",
      "what needs attention",
    ]),
    title: findColumn(headers, [
      "title",
      "item title",
      "product title",
      "name",
    ]),
    link: findColumn(headers, [
      "link",
      "url",
      "landing page",
      "final url",
      "product url",
    ]),
    id: findColumn(headers, ["id", "item id", "offer id", "product id", "sku"]),
    price: findColumn(headers, ["price", "sale price", "current price"]),
    availability: findColumn(headers, [
      "availability",
      "stock",
      "stock status",
    ]),
    status: findColumn(headers, ["status", "approval status", "item status"]),
  };

  const rowClassification = {
    withIssue: 0,
    withoutIssue: 0,
    statusOnly: 0,
    unclassified: 0,
  };
  const grouped = new Map<string, CsvRow[]>();
  const statuses = new Map<string, number>();

  rows.forEach((row) => {
    if (detectedColumns.issue) {
      const issue = row[detectedColumns.issue].trim();
      if (issue) {
        rowClassification.withIssue += 1;
        const current = grouped.get(issue) ?? [];
        current.push(row);
        grouped.set(issue, current);
      } else rowClassification.withoutIssue += 1;
    } else {
      const status = detectedColumns.status
        ? row[detectedColumns.status].trim()
        : "";
      if (status) {
        rowClassification.statusOnly += 1;
        statuses.set(status, (statuses.get(status) ?? 0) + 1);
      } else rowClassification.unclassified += 1;
    }
  });
  const statusGroups = Array.from(statuses, ([status, count]) => ({
    status,
    count,
  }));

  const issueGroups = Array.from(grouped.entries())
    .map(([issue, groupRows]) => ({
      issue,
      count: groupRows.length,
      priority: getPriority(issue),
      sample: groupRows.slice(0, 3),
    }))
    .sort((a, b) => {
      const priorityOrder: Record<Priority, number> = {
        High: 0,
        Medium: 1,
        Unrated: 2,
      };

      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }

      return b.count - a.count;
    });

  const warnings: string[] = [];

  if (!detectedColumns.issue) {
    warnings.push(
      detectedColumns.status
        ? "No Issue column was detected. Status values are grouped separately; they do not identify product issues."
        : "No Issue or Status column was detected. These rows cannot be classified by issue.",
    );
  }

  if (!detectedColumns.link) {
    warnings.push(
      "No product URL column was detected. Supply URLs separately if comparing landing pages manually.",
    );
  }

  if (!detectedColumns.price) {
    warnings.push(
      "No price column was detected. Price comparisons remain a manual step; this checker groups recorded issue text.",
    );
  }

  if (!detectedColumns.availability) {
    warnings.push(
      "No availability column was detected. Stock comparisons remain a manual step; this checker groups recorded issue text.",
    );
  }

  const topUrls = detectedColumns.link
    ? Array.from(
        new Set(
          rows
            .map((row) => row[detectedColumns.link as string]?.trim())
            .filter(Boolean),
        ),
      ).slice(0, 5)
    : [];

  return {
    fileName,
    rowsCount: rows.length,
    headers,
    detectedColumns,
    rowClassification,
    statusGroups,
    issueGroups,
    warnings,
    topUrls,
  };
}

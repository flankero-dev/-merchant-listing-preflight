import ReferencePage from "../components/ReferencePage";

export default function AffectedProductsCsvCheckerPage() {
  return (
    <ReferencePage
      title="Read a product CSV export"
      intro="Group recorded issue text without uploading the export."
      sections={[
        {
          title: "Choose an export",
          items: [
            "Use a comma-separated file with one header row and one row per product.",
            "Use an Issue column for issue grouping. When it is absent, a recognised Status column is grouped separately without inferring product issues.",
            "The file limit is 2 MB and 10,000 product rows.",
          ],
        },
        {
          title: "Read the result",
          items: [
            "Product rows counts accepted rows; repeated product URLs still count as separate rows.",
            "Issue groups counts distinct nonempty Issue values. Blank values and rows without an Issue column do not create issue groups. Suggested priority is a heuristic; unrecognised text is Unrated.",
            "Row counts distinguish supplied issue text, blank Issue values, status-only rows and unclassified rows. Detected columns maps readable fields to your CSV headers; sample URLs lists up to five distinct values.",
          ],
        },
        {
          title: "If analysis fails",
          items: [
            "Check delimiters, duplicate headers, quoted fields and row lengths.",
            "A quoted value can contain commas and newlines; doubled quotes represent a literal quote.",
            "No issue groups is not an all-clear. Read the warnings and compare the original export.",
          ],
        },
      ]}
    />
  );
}

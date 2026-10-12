import ReferencePage from "../components/ReferencePage";

export default function AffectedProductsCsvCheckerPage() {
  return <ReferencePage
    title="Read a product CSV export"
    intro="Group recorded issue text without uploading the export."
    sections={[
  {
    "title": "Choose an export",
    "items": [
      "Use a comma-separated file with one header row and one row per product.",
      "An Issue column is preferred. If it is absent, a recognised Status column is used and the result explains that fallback.",
      "The file limit is 2 MB and 10,000 product rows."
    ]
  },
  {
    "title": "Read the result",
    "items": [
      "Product rows counts accepted rows; repeated product URLs still count as separate rows.",
      "Issue groups counts distinct supplied issue text. The priority is a heuristic, not a new diagnosis.",
      "Detected columns shows the matched aliases; sample URLs shows up to five distinct values from the export."
    ]
  },
  {
    "title": "If analysis fails",
    "items": [
      "Check delimiters, duplicate headers, quoted fields and row lengths.",
      "A quoted value can contain commas and newlines; doubled quotes represent a literal quote.",
      "No issue groups is not an all-clear. Read the warnings and compare the original export."
    ]
  }
]}
  />;
}

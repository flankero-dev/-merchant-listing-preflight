import ReferencePage from "../components/ReferencePage";

export default function MerchantCenterDiagnosticReportPage() {
  return (
    <ReferencePage
      title="Product-data evidence checklist"
      intro="Keep these details in your own notes when investigating a reported issue."
      sections={[
        {
          title: "Define the affected item",
          items: [
            "Record the product ID, variant, target country and currency.",
            "Keep the original issue text and the export date.",
            "Choose a few affected URLs and a comparable unaffected item.",
          ],
        },
        {
          title: "Compare source values",
          items: [
            "Record the feed value, visible page value and Product / Offer value for the same variant.",
            "Note redirects, regional settings and sale dates that could explain a difference.",
            "Separate an observed mismatch from a hypothesis about its cause.",
          ],
        },
        {
          title: "Verify a change",
          items: [
            "Confirm the authoritative value, correct the inconsistent source, then collect the same evidence again.",
            "Record what changed, when it changed and what remains uncertain.",
            "Check the issue-specific official instructions before requesting a platform review; a local result cannot confirm approval.",
          ],
        },
      ]}
    />
  );
}

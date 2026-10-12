import ReferencePage from "../components/ReferencePage";

export default function MerchantCenterDiagnosticReportPage() {
  return (
    <ReferencePage
      title="Record a product-data investigation"
      intro="A short evidence worksheet for a manual investigation. The checker does not generate a diagnostic report."
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
            "Change the relevant source, then collect the same evidence again.",
            "Record what changed, when it changed and what remains uncertain.",
            "Use the official guide for the issue before requesting a platform review.",
          ],
        },
      ]}
    />
  );
}

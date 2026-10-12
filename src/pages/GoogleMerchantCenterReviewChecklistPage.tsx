import ReferencePage from "../components/ReferencePage";

export default function GoogleMerchantCenterReviewChecklistPage() {
  return (
    <ReferencePage
      title="Check your evidence before a review"
      intro="A manual checklist to use alongside the issue-specific official reference."
      sections={[
        {
          title: "Reproduce the issue",
          items: [
            "Record the exact issue text and affected item IDs.",
            "Open the submitted URL for the intended country and variant.",
            "Compare feed, visible page and markup values.",
          ],
        },
        {
          title: "Verify the correction",
          items: [
            "Check the same items after updating their source data.",
            "Confirm that redirects and regional settings still open the intended product.",
            "Keep dated observations of the remaining differences.",
          ],
        },
        {
          title: "Check the official requirements",
          paragraphs: [
            "Use the guide for the specific issue and its official reference. A local checker result alone cannot establish whether a platform review is appropriate or whether an account will be approved.",
          ],
        },
      ]}
    />
  );
}

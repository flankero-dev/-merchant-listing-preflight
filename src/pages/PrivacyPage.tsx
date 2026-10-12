import ReferencePage from "../components/ReferencePage";

export default function PrivacyPage() {
  return (
    <ReferencePage
      title="Privacy and data"
      intro="How the current application handles the data you choose to inspect."
      sections={[
        {
          title: "Files and pasted markup",
          paragraphs: [
            "The checker reads files and markup in this browser. It does not upload them, visit product URLs or connect to a Google account.",
            "Inputs and results remain in memory while you browse reference pages. Reloading or closing the page clears them. The application does not save analysis data to localStorage or cookies.",
          ],
        },
        {
          title: "Contact is separate from analysis",
          paragraphs: [
            "The contact link opens your email app. This website does not send mail or attach checker inputs. Your email provider handles any message you choose to send.",
          ],
        },
        {
          title: "Website hosting",
          paragraphs: [
            "Cloudflare Pages serves the site and its static assets. The published site also loads Cloudflare Web Analytics for website traffic and performance measurement. This hosting script is separate from the checker code that processes your files and markup locally.",
          ],
        },
        {
          title: "Choose what to share",
          paragraphs: [
            "Use fictional or redacted data when demonstrating the tool. Do not include passwords, recovery codes or account credentials in an email. For a question about an email you already sent, reply to that conversation.",
          ],
        },
      ]}
    />
  );
}

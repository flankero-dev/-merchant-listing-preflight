import { useState } from "react";
const email = "flankero4697@gmail.com";

export default function DeveloperContact() {
  const [status, setStatus] = useState("");
  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(email);
      setStatus("Email copied.");
    } catch {
      setStatus(`Copy manually: ${email}`);
    }
  }
  return (
    <section id="order" className="pw-contact" aria-label="Developer contact">
      <h2>Feedback</h2>
      <p>
        Found a problem with the tool? <a href={`mailto:${email}`}>{email}</a>
      </p>
      <button onClick={copyEmail}>Copy email</button>
      <span role="status">{status}</span>
    </section>
  );
}

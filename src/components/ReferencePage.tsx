import { Link } from "react-router-dom";

type Section = { title: string; paragraphs?: string[]; items?: string[] };

export default function ReferencePage({ title, intro, sections }: {
  title: string;
  intro: string;
  sections: Section[];
}) {
  return (
    <main className="content-page" id="content" tabIndex={-1}>
      <section className="content-hero">
        <div className="breadcrumbs"><Link to="/">Checker</Link><span>/</span><span>{title}</span></div>
        <h1>{title}</h1>
        <p>{intro}</p>
      </section>
      <div className="reference-sections">
        {sections.map(section => (
          <section className="article-card" key={section.title}>
            <h2>{section.title}</h2>
            {section.paragraphs?.map(text => <p key={text}>{text}</p>)}
            {section.items && <ul className="step-list">{section.items.map(text => <li key={text}>{text}</li>)}</ul>}
          </section>
        ))}
      </div>
      <div className="hero-actions">
        <Link className="btn primary" to="/#checker">Open checker</Link>
        <Link className="btn secondary" to="/sample-report">View worked example</Link>
      </div>
    </main>
  );
}

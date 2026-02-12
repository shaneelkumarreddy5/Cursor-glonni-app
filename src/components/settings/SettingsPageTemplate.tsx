import { PageIntro } from "../ui/PageIntro";

type SettingsPageTemplateProps = {
  title: string;
  description: string;
  bullets: string[];
};

export function SettingsPageTemplate({
  title,
  description,
  bullets,
}: SettingsPageTemplateProps) {
  return (
    <div className="stack">
      <PageIntro badge="Settings" title={title} description={description} />
      <section className="card">
        <header className="section-header">
          <h2>Coming soon</h2>
        </header>
        <ul className="bullet-list">
          {bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

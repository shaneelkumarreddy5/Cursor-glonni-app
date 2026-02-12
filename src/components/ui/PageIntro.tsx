import { type ReactNode } from "react";

type PageIntroProps = {
  badge?: string;
  title: string;
  description: string;
  actions?: ReactNode;
};

export function PageIntro({ badge, title, description, actions }: PageIntroProps) {
  return (
    <section className="page-intro card">
      {badge ? <span className="badge">{badge}</span> : null}
      <h1>{title}</h1>
      <p>{description}</p>
      {actions ? <div className="page-intro-actions">{actions}</div> : null}
    </section>
  );
}

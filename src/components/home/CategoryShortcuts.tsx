import { Link } from "react-router-dom";

export type CategoryShortcut = {
  title: "Electronics" | "Fashion" | "Home" | "Mobile" | "Grocery";
  to: string;
  imageUrl: string;
};

type CategoryShortcutsProps = {
  shortcuts: CategoryShortcut[];
};

export function CategoryShortcuts({ shortcuts }: CategoryShortcutsProps) {
  return (
    <section className="home-section-card">
      <header className="home-section-header-row">
        <h2>Categories</h2>
      </header>
      <div className="home-category-shortcuts">
        {shortcuts.map((shortcut) => (
          <Link key={shortcut.title} to={shortcut.to} className="home-category-shortcut">
            <span className="home-category-circle">
              <img src={shortcut.imageUrl} alt={shortcut.title} loading="lazy" />
            </span>
            <span>{shortcut.title}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

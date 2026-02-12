import { PageIntro } from "../components/ui/PageIntro";
import { PlaceholderCards } from "../components/ui/PlaceholderCards";

export function CategoryPage() {
  return (
    <div className="stack">
      <PageIntro
        badge="PLP"
        title="Category Listing"
        description="Responsive product listing page structure with placeholders for filters, sorting, and paginated catalog cards."
      />
      <section className="card">
        <header className="section-header">
          <h2>Filters (UI only)</h2>
        </header>
        <div className="chip-row">
          {["Price", "Size", "Color", "Brand", "In Stock", "Rating"].map((chip) => (
            <button key={chip} type="button" className="chip">
              {chip}
            </button>
          ))}
        </div>
      </section>
      <PlaceholderCards
        title="Products"
        items={[
          "Minimal Runner",
          "Trail Fusion",
          "Urban Canvas",
          "Retro Pulse",
          "Cloud Knit",
          "Street Pivot",
        ]}
      />
    </div>
  );
}

import { PageIntro } from "../components/ui/PageIntro";
import { PlaceholderCards } from "../components/ui/PlaceholderCards";

export function HomePage() {
  return (
    <div className="stack">
      <PageIntro
        badge="Landing page"
        title="Welcome to Glonni"
        description="Modern storefront foundation with reusable components, clean routing, and responsive placeholders for key commerce journeys."
        actions={
          <div className="inline-actions">
            <button type="button" className="btn btn-primary">
              Shop New Arrivals
            </button>
            <button type="button" className="btn btn-secondary">
              Explore Categories
            </button>
          </div>
        }
      />
      <PlaceholderCards
        title="Featured Collections"
        items={["Sneakers", "Streetwear", "Accessories", "Tech Essentials"]}
      />
      <PlaceholderCards
        title="Trending Today"
        items={["Limited Drops", "Best Sellers", "Editor Picks", "Seasonal Offers"]}
      />
    </div>
  );
}

import { type FormEvent } from "react";
import { FilterIcon } from "../ui/FilterIcon";

type SearchBarProps = {
  placeholder?: string;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
};

export function SearchBar({
  placeholder = "Search products, brands...",
  onSubmit,
}: SearchBarProps) {
  return (
    <form
      className="app-searchbar"
      role="search"
      aria-label="Search products"
      onSubmit={(event) => {
        if (onSubmit) {
          onSubmit(event);
          return;
        }
        event.preventDefault();
      }}
    >
      <input type="search" placeholder={placeholder} />
      <button
        type="button"
        className="app-filter-button"
        aria-label="Open filters"
        title="Filters"
      >
        <FilterIcon />
      </button>
    </form>
  );
}

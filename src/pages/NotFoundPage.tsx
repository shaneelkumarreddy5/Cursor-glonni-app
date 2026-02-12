import { NavLink } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="card not-found">
      <span className="badge">404</span>
      <h1>Page not found</h1>
      <p>The page you requested does not exist in this frontend scaffold.</p>
      <NavLink to="/" className="btn btn-primary">
        Return Home
      </NavLink>
    </section>
  );
}

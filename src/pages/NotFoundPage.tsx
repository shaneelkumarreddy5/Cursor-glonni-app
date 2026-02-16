import { NavLink, useNavigate } from "react-router-dom";

export function NotFoundPage() {
  const navigate = useNavigate();

  function handleBackNavigation() {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/");
  }

  return (
    <section className="card not-found">
      <span className="badge">404</span>
      <h1>Page not found</h1>
      <p>The page you requested does not exist in this frontend scaffold.</p>
      <div className="inline-actions">
        <button type="button" className="btn btn-secondary" onClick={handleBackNavigation}>
          <span aria-hidden="true">←</span>
          <span>Back</span>
        </button>
        <NavLink to="/" className="btn btn-primary">
          Return Home
        </NavLink>
      </div>
    </section>
  );
}

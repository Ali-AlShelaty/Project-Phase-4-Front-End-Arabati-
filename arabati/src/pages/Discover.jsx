import React, { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import {
  CITIES,
  CATEGORIES,
  dateAt,
  isFuture,
  localDate,
  money,
  prettyDate,
  ratingFor,
  searchCarts,
  isPublic,
  unavailable,
  RuleError,
} from "../domain/rules.js";
import {
  Button,
  Field,
  FormAlert,
  Empty,
  Link,
  Tabs,
  Modal,
  Check,
  Notice,
  Stars,
  Badge,
  navigate,
  useAction,
  Pagination,
} from "../components/UI.jsx";
import { Icon } from "../components/Icons.jsx";
import { CartArt } from "../components/CartArt.jsx";
import { CartMap } from "../components/CartMap.jsx";

const defaults = () => ({
  date: dateAt(6),
  city: "Al Khobar",
  category: "",
  budget: "",
  query: "",
});

function loadFilters() {
  try {
    return {
      ...defaults(),
      ...JSON.parse(sessionStorage.getItem("arabati.filters") || "null"),
    };
  } catch {
    return defaults();
  }
}

export function CartCard({ cart, state, date }) {
  const rating = ratingFor(state, cart.id),
    price = Math.min(...cart.packages.map((p) => Number(p.price)));

  return (
    <article className="cart-card">
      <Link
        to={`/cart/${cart.id}`}
        className="cart-image-link"
        aria-label={`View ${cart.name}`}
      >
        <CartArt {...cart} />
        <span className="image-category">
          <Icon
            name={
              cart.category === "Coffee"
                ? "coffee"
                : cart.category === "Food"
                  ? "food"
                  : "dessert"
            }
            size={15}
          />
          {cart.category}
        </span>
      </Link>

      <div className="cart-card-body">
        <div className="card-meta">
          <span className="verified">
            <Icon name="verified" size={15} />
            Verified cart
          </span>
          <span className="rating">
            <Icon name="star" size={14} fill="currentColor" />
            {rating.average || "New"}
            <span className="muted">
              {rating.count ? ` (${rating.count})` : ""}
            </span>
          </span>
        </div>

        <h3>
          <Link to={`/cart/${cart.id}`}>{cart.name}</Link>
        </h3>
        <p>{cart.tagline}</p>

        <div className="cart-location">
          <Icon name="pin" size={15} />
          {cart.cities.slice(0, 3).join(" · ")}
        </div>

        <div className="cart-card-bottom">
          <span className="price">
            <small>Packages from</small>
            <strong>{money(price)}</strong>
            <span> / event</span>
          </span>
          <Link
            to={`/cart/${cart.id}`}
            className="round-link"
            aria-label={`View ${cart.name} packages`}
          >
            <Icon name="arrow" />
          </Link>
        </div>

        {date && (
          <span className="available-label">
            <i />
            Available {prettyDate(date, true)}
          </span>
        )}
      </div>
    </article>
  );
}

export function Discover() {
  const { state } = useApp();
  const [draft, setDraft] = useState(loadFilters),
    [filters, setFilters] = useState(loadFilters),
    [searched, setSearched] = useState(false),
    [errors, setErrors] = useState({}),
    [sort, setSort] = useState("featured"),
    [view, setView] = useState("List"),
    [selected, setSelected] = useState(null),
    [page, setPage] = useState(1);

  const update = (key, value) => setDraft((v) => ({ ...v, [key]: value }));

  function apply(e) {
    e?.preventDefault();
    const errs = {};

    if (draft.date && !isFuture(draft.date))
      errs.date = "Choose a date from tomorrow.";

    if (draft.budget && !(Number(draft.budget) > 0))
      errs.budget = "Enter a positive budget.";

    if (draft.city && !CITIES.includes(draft.city))
      errs.city = "Choose a supported city.";

    setErrors(errs);
    if (Object.keys(errs).length) return;

    setFilters(draft);
    setSearched(true);
    setPage(1);
    sessionStorage.setItem("arabati.filters", JSON.stringify(draft));

    document
      .getElementById("cart-results")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  let carts = searchCarts(state, filters);

  if (sort === "price")
    carts.sort(
      (a, b) =>
        Math.min(...a.packages.map((p) => p.price)) -
        Math.min(...b.packages.map((p) => p.price)),
    );

  if (sort === "rating")
    carts.sort(
      (a, b) =>
        Number(ratingFor(state, b.id).average || 0) -
        Number(ratingFor(state, a.id).average || 0),
    );

  const chooseCategory = (category) => {
    const next = { ...filters, category };
    setFilters(next);
    setDraft((v) => ({ ...v, category }));
    setPage(1);
    sessionStorage.setItem("arabati.filters", JSON.stringify(next));
  };

  const clear = () => {
    const next = { date: "", city: "", category: "", budget: "", query: "" };
    setFilters(next);
    setDraft(next);
    setErrors({});
    setPage(1);
    sessionStorage.setItem("arabati.filters", JSON.stringify(next));
  };

  const visibleCarts = carts.slice((page - 1) * 20, page * 20);
  const mapped = visibleCarts.find((c) => c.id === selected) || visibleCarts[0];

  return (
    <>
      <section className="hero container">
        <div className="hero-copy">
          <p className="eyebrow">
            <span />
            GATHER A LITTLE DIFFERENTLY
          </p>
          <h1>
            Good carts.
            <br />
            <em>Great gatherings.</em>
          </h1>
          <p className="hero-description">
            Your favourite people. A little something delicious.
            <br className="desktop-only" /> Find the perfect coffee, food or
            dessert cart
            <br className="desktop-only" /> for your next occasion.
          </p>
          <div className="hero-trust">
            <span className="trust-icon">
              <Icon name="verified" size={22} />
            </span>
            <span>
              <strong>Local carts. Verified with care.</strong>
              <small>Serving Saudi Arabia’s Eastern Province</small>
            </span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-art-frame">
            <CartArt hero name="arabati" />
            <span className="hero-stamp">
              made for
              <br />
              <em>your moments</em>
              <Icon name="spark" size={20} />
            </span>
          </div>
          <div className="hero-caption">
            <span className="caption-dot" />
            Coffee, connection & a reason to celebrate.
            <Icon name="heart" size={15} />
          </div>
        </div>
      </section>

      <section
        className="container search-section"
        aria-label="Find a cart for your event"
      >
        <form className="event-search" onSubmit={apply} noValidate>
          <Field label="YOUR EVENT DATE" error={errors.date}>
            <div className="input-icon">
              <Icon name="calendar" />
              <input
                aria-label="Your event date"
                type="date"
                min={dateAt(1)}
                value={draft.date}
                onChange={(e) => update("date", e.target.value)}
              />
            </div>
          </Field>

          <Field label="WHERE’S THE GATHERING?" error={errors.city}>
            <div className="input-icon">
              <Icon name="pin" />
              <select
                aria-label="Event city"
                value={draft.city}
                onChange={(e) => update("city", e.target.value)}
              >
                <option value="">All service cities</option>
                {CITIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </Field>

          <Field label="A LITTLE SOMETHING…">
            <select
              aria-label="Cart category"
              value={draft.category}
              onChange={(e) => update("category", e.target.value)}
            >
              <option value="">All kinds of good</option>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>

          <Field label="YOUR BUDGET" error={errors.budget}>
            <input
              aria-label="Maximum package price in SAR"
              type="number"
              min="1"
              placeholder="Any budget · SAR"
              value={draft.budget}
              onChange={(e) => update("budget", e.target.value)}
            />
          </Field>

          <Button type="submit" icon="search">
            Find my cart
          </Button>
        </form>

        <div className="search-footnote">
          <Icon name="info" size={13} />
          <span>
            No payment needed. Your booking is confirmed after vendor
            acceptance.
          </span>
        </div>
      </section>

      <section className="container discover-results" id="cart-results">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">A TASTE OF WHAT’S AROUND</p>
            <h2>
              {searched
                ? "Carts for your gathering"
                : "Find your kind of gathering"}
            </h2>
            <p className="muted">
              Thoughtfully chosen carts. Unforgettable little details.
            </p>
          </div>
          <span className="region-note">
            <Icon name="pin" size={16} />
            Eastern Province, Saudi Arabia
          </span>
        </div>

        <div className="results-toolbar">
          <Tabs
            label="Filter carts by category"
            value={filters.category}
            onChange={chooseCategory}
            items={[
              { value: "", label: "All carts", icon: "grid" },
              ...CATEGORIES.map((c) => ({
                value: c,
                label: c,
                icon:
                  c === "Coffee" ? "coffee" : c === "Food" ? "food" : "dessert",
              })),
            ]}
          />

          <div className="results-controls">
            <label className="sort-label">
              Sort by
              <select
                aria-label="Sort carts"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="featured">Recommended</option>
                <option value="price">Price: low to high</option>
                <option value="rating">Highest rated</option>
              </select>
            </label>

            <Tabs
              label="Results layout"
              value={view}
              onChange={setView}
              items={[
                { value: "List", label: "List", icon: "list" },
                { value: "Map", label: "Map", icon: "pin" },
              ]}
            />
          </div>
        </div>

        <div className="results-summary">
          <span>
            {carts.length} {carts.length === 1 ? "cart" : "carts"}
            {filters.city ? ` in ${filters.city}` : ""}
            {filters.date ? ` · ${prettyDate(filters.date, true)}` : ""}
            {filters.budget ? ` · up to ${money(filters.budget)}` : ""}
          </span>
          <button type="button" className="text-button" onClick={clear}>
            Clear filters
          </button>
        </div>

        {view === "Map" && carts.length > 0 && (
          <div className="map-panel">
            <div className="map-selection">
              <p className="eyebrow">EXPLORE THE AREA</p>
              <h3>Good things nearby</h3>
              <p className="muted small">
                Illustrative cart locations in the service area. Select a cart
                to preview its neighbourhood, or a map pin to open its profile.
              </p>

              {visibleCarts.map((c, i) => (
                <button
                  type="button"
                  className={mapped?.id === c.id ? "selected" : ""}
                  key={c.id}
                  onClick={() => setSelected(c.id)}
                >
                  <span>{i + 1}</span>
                  <div>
                    <strong>{c.name}</strong>
                    <small>
                      {c.baseCity} · {c.category}
                    </small>
                  </div>
                  <Icon name="pin" size={17} />
                </button>
              ))}

              <Button variant="secondary" onClick={() => setView("List")}>
                Map unavailable? Use list
              </Button>
            </div>

            <CartMap
              carts={visibleCarts}
              city={filters.city}
              selectedId={mapped?.id}
            />
          </div>
        )}

        {carts.length ? (
          <>
            <div className="cart-grid">
              {visibleCarts.map((c) => (
                <CartCard
                  key={c.id}
                  cart={c}
                  state={state}
                  date={filters.date}
                />
              ))}
            </div>
            <Pagination total={carts.length} page={page} onChange={setPage} />
          </>
        ) : (
          <Empty
            title="A little change could find your cart"
            action={<Button onClick={clear}>Clear filters</Button>}
          >
            No available carts match this date, city and budget. Try another
            date or a wider search.
          </Empty>
        )}
      </section>

      <section className="gather-banner container">
        <div className="gather-icon">
          <Icon name="spark" size={40} />
        </div>
        <div>
          <p className="eyebrow">FROM SMALL MOMENTS TO BIG MILESTONES</p>
          <h2>There’s always a reason to gather.</h2>
          <p>
            Weddings, graduations, office days or just because. We’ll bring the
            cart.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            document.querySelector(".event-search input")?.focus();
            document
              .querySelector(".search-section")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          Plan your gathering
          <Icon name="arrow" size={17} />
        </Button>
      </section>
    </>
  );
}

export function ReportDialog({
  cart,
  targetType = "listing",
  targetId,
  onClose,
}) {
  const { run, flash } = useApp();
  const [reason, setReason] = useState("Misleading information"),
    [details, setDetails] = useState(""),
    action = useAction();

  return (
    <Modal title={`Report ${targetType}`} onClose={onClose}>
      <p className="muted">
        {cart.name} ·{" "}
        {targetType === "review" ? "Review " + targetId : "Cart listing"}
      </p>

      <Notice>
        Your evidence stays private and is reviewed by administrators.
      </Notice>

      <form
        className="stack"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          action.execute(async () => {
            const id = await run("report", {
              cartId: cart.id,
              targetType,
              targetId,
              reason,
              details,
            });
            flash(`Report ${id} submitted. Thank you for letting us know.`);
            onClose();
          });
        }}
      >
        <FormAlert error={action.error} />

        <Field label="Reason" required error={action.fields.reason}>
          <select value={reason} onChange={(e) => setReason(e.target.value)}>
            {[
              "Misleading information",
              "Inappropriate content",
              "Service concern",
              "Other",
            ].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </Field>

        <Field
          label="What should we know?"
          required
          hint={`${details.length}/1,000 characters · At least 20 characters`}
          error={action.fields.details}
        >
          <textarea
            rows="5"
            maxLength={1000}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Describe the issue so we can review it fairly…"
          />
        </Field>

        <Button type="submit" busy={action.busy}>
          Submit report
        </Button>
      </form>
    </Modal>
  );
}

export function CartProfile({ id }) {
  const { state, user } = useApp();
  const cart = state.carts.find((c) => c.id === id);
  const [tab, setTab] = useState("Packages"),
    [packageId, setPackageId] = useState(null),
    [date, setDate] = useState(() => loadFilters().date || dateAt(6)),
    [report, setReport] = useState(null);

  if (
    !cart ||
    (!isPublic(state, cart) &&
      user?.role !== "admin" &&
      cart.vendorId !== user?.id)
  )
    return (
      <Empty
        icon="cart"
        title="This cart is taking a little break"
        action={
          <Link to="/" className="button primary">
            Find another cart
          </Link>
        }
      >
        The listing is not currently available. Your existing bookings remain in
        My bookings.
      </Empty>
    );

  const pkg = cart.packages.find((p) => p.id === packageId) || cart.packages[0],
    rating = ratingFor(state, id),
    reviews = state.reviews.filter((r) => r.cartId === id && !r.hidden),
    blocked = !!date && unavailable(state, id, date),
    dateInvalid = !isFuture(date);

  const openReport = (targetType, targetId) => {
    if (!user) {
      navigate(`/signin?next=${encodeURIComponent(`/cart/${id}`)}`);
      return;
    }
    setReport({ targetType, targetId });
  };

  return (
    <>
      <Link to="/" className="back-link">
        <Icon name="back" />
        All carts
      </Link>

      <div className="profile-top">
        <div>
          <div className="inline-meta">
            <span className="verified">
              <Icon name="verified" size={17} />
              Verified cart
            </span>
            <span>·</span>
            <span>{cart.category}</span>
          </div>

          <h1>{cart.name}</h1>
          <p className="profile-tagline">{cart.tagline}</p>

          <div className="inline-meta">
            <span className="rating">
              <Icon name="star" fill="currentColor" size={17} />
              {rating.average || "New"}{" "}
              <span className="muted">({rating.count} verified reviews)</span>
            </span>
            <span>·</span>
            <span>
              <Icon name="pin" size={16} />
              {cart.cities.join(", ")}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="text-button muted report-link"
          onClick={() => openReport("listing", id)}
        >
          <Icon name="flag" size={16} />
          Report listing
        </button>
      </div>

      <div className="profile-layout">
        <div className="profile-main">
          <div className="profile-art">
            <CartArt {...cart} />
            <span className="photo-caption">
              A little preview of the good to come · Cart illustration
            </span>
          </div>

          <section className="profile-about">
            <p className="eyebrow">MEET YOUR NEXT EVENT FAVOURITE</p>
            <h2>Made for good company.</h2>
            <p>{cart.description}</p>
            <div className="feature-pills">
              <span>
                <Icon name="check" size={16} />
                Verified local vendor
              </span>
              <span>
                <Icon name="users" size={16} />
                Events big & small
              </span>
              <span>
                <Icon name="coffee" size={16} />
                Setup included
              </span>
            </div>
          </section>

          <Tabs
            value={tab}
            onChange={setTab}
            items={["Packages", "Menu", "Reviews"]}
            label="Cart details"
          />

          {tab === "Packages" && (
            <section className="package-list" aria-label="Available packages">
              {cart.packages.map((p) => (
                <button
                  type="button"
                  className={`package-card ${p.id === pkg?.id ? "selected" : ""}`}
                  key={p.id}
                  aria-pressed={p.id === pkg?.id}
                  onClick={() => setPackageId(p.id)}
                >
                  <div className="package-radio">
                    <span />
                  </div>
                  <div className="package-info">
                    <h3>{p.name}</h3>
                    <p>{p.description}</p>
                    <div className="inline-meta">
                      <span>
                        <Icon name="users" size={16} />
                        {p.capacity} guests
                      </span>
                      <span>
                        <Icon name="clock" size={16} />
                        {p.duration} hours
                      </span>
                    </div>
                  </div>
                  <strong>{money(p.price)}</strong>
                </button>
              ))}
            </section>
          )}

          {tab === "Menu" && (
            <section className="panel menu-list">
              <h3>A taste of the menu</h3>
              <p className="muted small">
                Individual item prices for reference. Your booking uses the
                selected package’s total price.
              </p>
              {cart.menu.map((i) => (
                <div key={i.id}>
                  <span>{i.name}</span>
                  <strong>{money(i.price)}</strong>
                </div>
              ))}
            </section>
          )}

          {tab === "Reviews" && (
            <section className="reviews-list">
              <div className="review-overview">
                <strong>{rating.average || "New"}</strong>
                <div>
                  <Stars rating={Number(rating.average)} />
                  <p>{rating.count} verified event reviews</p>
                </div>
              </div>

              {reviews.length ? (
                reviews.map((r) => (
                  <article className="panel review-card" key={r.id}>
                    <div className="heading-row">
                      <div className="review-author">
                        <span className="avatar">{r.author[0]}</span>
                        <div>
                          <strong>{r.author}</strong>
                          <small>
                            {prettyDate(r.createdAt.slice(0, 10), true)} ·
                            Verified event
                          </small>
                        </div>
                      </div>
                      <Stars rating={r.rating} />
                    </div>
                    <p>{r.text}</p>
                    <button
                      type="button"
                      className="text-button muted small"
                      onClick={() => openReport("review", r.id)}
                    >
                      Report review
                    </button>
                  </article>
                ))
              ) : (
                <Empty title="The first review could be yours">
                  Reviews are available after a completed event.
                </Empty>
              )}
            </section>
          )}
        </div>

        <aside className="booking-aside panel">
          <span className="eyebrow">LET’S MAKE IT AN OCCASION</span>
          <h2>
            Your gathering,
            <br />
            <em>their good stuff.</em>
          </h2>

          {pkg ? (
            <>
              <div className="selected-package-summary">
                <small>Your selected package</small>
                <h3>{pkg.name}</h3>
                <div className="inline-meta">
                  <span>{pkg.capacity} guests</span>
                  <span>·</span>
                  <span>{pkg.duration} hours</span>
                </div>
                <strong>
                  {money(pkg.price)}
                  <small> / event</small>
                </strong>
              </div>

              <Field
                label="Event date"
                error={
                  dateInvalid
                    ? "Choose a future date."
                    : blocked
                      ? "This date is booked or blocked. Try another date."
                      : null
                }
              >
                <input
                  type="date"
                  min={dateAt(1)}
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    try {
                      sessionStorage.setItem(
                        "arabati.filters",
                        JSON.stringify({
                          ...loadFilters(),
                          date: e.target.value,
                        }),
                      );
                    } catch {}
                  }}
                />
              </Field>

              {!blocked && !dateInvalid && (
                <span className="available-label">
                  <i />
                  Available for your gathering
                </span>
              )}

              <Button
                className="full-width"
                disabled={
                  blocked ||
                  dateInvalid ||
                  (user && user.role !== "customer") ||
                  !isPublic(state, cart)
                }
                onClick={() => {
                  const next = `/request/${id}?package=${pkg.id}&date=${date}`;
                  navigate(
                    user ? next : `/signin?next=${encodeURIComponent(next)}`,
                  );
                }}
              >
                Request booking
                <Icon name="arrow" size={18} />
              </Button>

              <p className="aside-note">
                <Icon name="lock" size={13} />
                {user && user.role !== "customer"
                  ? "Sign in as a customer to request a booking."
                  : "No payment collected. Vendor confirmation required."}
              </p>
            </>
          ) : (
            <Notice>This vendor has not added a package yet.</Notice>
          )}

          <div className="aside-footer">
            <Icon name="message" />
            <p>
              A few details now. A memorable
              <br />
              gathering soon.
            </p>
          </div>
        </aside>
      </div>

      {report && (
        <ReportDialog cart={cart} {...report} onClose={() => setReport(null)} />
      )}
    </>
  );
}

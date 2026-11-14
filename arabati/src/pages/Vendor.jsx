import React, { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import {
  Badge,
  Button,
  Check,
  Empty,
  Field,
  FormAlert,
  Link,
  Modal,
  Notice,
  PageHeading,
  Tabs,
  navigate,
  useAction,
  Pagination,
} from "../components/UI.jsx";
import { Icon } from "../components/Icons.jsx";
import { CartArt } from "../components/CartArt.jsx";
import { BookingCard, ContactDialog } from "./Bookings.jsx";
import {
  CATEGORIES,
  CITIES,
  dateAt,
  eventStart,
  eventEnd,
  isFuture,
  localDate,
  money,
  prettyDate,
  prettyTime,
} from "../domain/rules.js";
export function StatCard({ icon, label, value, to }) {
  const body = (
    <>
      <span className="stat-icon">
        <Icon name={icon} size={22} />
      </span>
      <strong>{value}</strong>
      <span>{label}</span>
      {to && <Icon name="arrow" className="stat-arrow" size={17} />}
    </>
  );
  return to ? (
    <Link to={to} className="stat-card">
      {body}
    </Link>
  ) : (
    <div className="stat-card">{body}</div>
  );
}
export function VendorDashboard() {
  const { state, user } = useApp();
  const [tab, setTab] = useState("Pending"),
    [page, setPage] = useState(1);
  const cart = state.carts.find((c) => c.vendorId === user.id),
    all = state.bookings.filter((b) => b.vendorId === user.id),
    pending = all.filter(
      (b) => b.status === "Pending" && eventStart(b) > Date.now(),
    ),
    accepted = all.filter((b) => b.status === "Accepted"),
    records = all
      .filter((b) =>
        tab === "Pending"
          ? pending.includes(b)
          : tab === "Accepted"
            ? b.status === "Accepted"
            : !["Pending", "Accepted"].includes(b.status) ||
              (b.status === "Pending" && eventStart(b) <= Date.now()),
      )
      .sort((a, b) => eventStart(a) - eventStart(b));
  return (
    <>
      <PageHeading
        eyebrow="BEHIND EVERY GOOD GATHERING"
        title="Your cart, in good company."
        action={
          <Link to="/listing" className="button secondary">
            <Icon name="edit" size={17} />
            Edit my listing
          </Link>
        }
      >
        {cart?.name || "Your new cart"} · Your requests, events and little
        details.
      </PageHeading>
      {cart && (
        <div className="dashboard-listing-bar">
          <span>
            <Icon name="cart" />
            {cart.name || "New listing"}
          </span>
          <Badge status={cart.suspended ? "Suspended" : cart.status} />
          {cart.status === "Approved" && !cart.suspended && (
            <Link to={`/cart/${cart.id}`} className="text-button">
              View public profile
              <Icon name="external" size={14} />
            </Link>
          )}
          {cart.status === "Rejected" && (
            <span className="small error-text">{cart.rejectionReason}</span>
          )}
        </div>
      )}
      <div className="stat-grid">
        <StatCard icon="mail" label="New requests" value={pending.length} />
        <StatCard
          icon="calendar"
          label="Upcoming events"
          value={accepted.filter((b) => eventEnd(b) > Date.now()).length}
        />
        <StatCard
          icon="check"
          label="Completed events"
          value={all.filter((b) => b.status === "Completed").length}
        />
        <StatCard
          icon="star"
          label="Verified reviews"
          value={
            state.reviews.filter((r) => r.cartId === cart?.id && !r.hidden)
              .length
          }
        />
      </div>
      <div className="section-title-row">
        <div>
          <h2>Your requests & events</h2>
          <p className="muted">
            A little planning makes every event feel effortless.
          </p>
        </div>
        <Link to="/calendar" className="text-button">
          <Icon name="calendar" size={17} />
          Manage availability
        </Link>
      </div>
      <Tabs
        label="Vendor bookings"
        value={tab}
        onChange={(v) => {
          setTab(v);
          setPage(1);
        }}
        items={[
          { value: "Pending", label: "New requests", count: pending.length },
          {
            value: "Accepted",
            label: "Accepted events",
            count: accepted.length,
          },
          { value: "Past", label: "History" },
        ]}
      />
      <div className="record-count">{records.length} records</div>
      {records.length ? (
        <>
          <div className="booking-list">
            {records.slice((page - 1) * 20, page * 20).map((b) => (
              <BookingCard
                key={b.id}
                booking={b}
                cart={state.carts.find((c) => c.id === b.cartId)}
                customerName={
                  state.users.find((u) => u.id === b.customerId)?.name ||
                  b.customerName
                }
                to={`/vendor/request/${b.id}`}
              />
            ))}
          </div>
          <Pagination page={page} total={records.length} onChange={setPage} />
        </>
      ) : (
        <Empty icon="calendar" title="A little breathing room">
          No{" "}
          {tab === "Pending"
            ? "new requests"
            : tab === "Accepted"
              ? "accepted events"
              : "past events"}{" "}
          here. Keep your listing and availability up to date.
        </Empty>
      )}
    </>
  );
}
export function VendorRequest({ id }) {
  const { state, user, run, flash } = useApp();
  const [note, setNote] = useState(""),
    [decision, setDecision] = useState(null),
    [contact, setContact] = useState(false),
    action = useAction();
  const b = state.bookings.find((v) => v.id === id && v.vendorId === user.id);
  if (!b)
    return (
      <Empty
        title="This request is not available"
        action={
          <Link to="/vendor" className="button primary">
            Vendor dashboard
          </Link>
        }
      />
    );
  const customer = state.users.find((u) => u.id === b.customerId),
    canComplete = b.status === "Accepted" && eventEnd(b) <= Date.now(),
    canDecide = b.status === "Pending" && eventStart(b) > Date.now(),
    competing = state.bookings.filter(
      (v) =>
        v.id !== b.id &&
        v.cartId === b.cartId &&
        v.date === b.date &&
        v.status === "Pending",
    ).length;
  return (
    <>
      <PageHeading
        back="/vendor"
        eyebrow="A GATHERING TO LOOK FORWARD TO"
        title={b.id}
        action={<Badge status={b.status} />}
      >
        {customer?.name || b.customerName || "Event customer"} ·{" "}
        {prettyDate(b.date)}
      </PageHeading>
      <div className="form-aside-layout">
        <div className="stack">
          <section className="panel">
            <h2>The event at a glance</h2>
            <dl className="event-facts">
              <div>
                <dt>Customer</dt>
                <dd>{customer?.name || b.customerName}</dd>
              </div>
              <div>
                <dt>Event date & time</dt>
                <dd>
                  {prettyDate(b.date)}
                  <small>{b.time} · Saudi Arabia time</small>
                </dd>
              </div>
              <div>
                <dt>Venue</dt>
                <dd>
                  {b.venue}
                  <small>{b.city}</small>
                </dd>
              </div>
              <div>
                <dt>Guests & service</dt>
                <dd>
                  {b.guests} guests · {b.duration} hours
                </dd>
              </div>
              <div>
                <dt>Selected package</dt>
                <dd>
                  {b.package.name}
                  <small>
                    {money(b.package.price)} · Maximum {b.package.capacity}{" "}
                    guests
                  </small>
                </dd>
              </div>
              <div>
                <dt>Customer budget</dt>
                <dd>{money(b.budget)}</dd>
              </div>
            </dl>
            <div className="setup-notes">
              <span className="small muted">SETUP NOTES</span>
              <p>{b.notes || "No extra instructions provided."}</p>
            </div>
          </section>
          <section className="panel">
            <h2>Event history</h2>
            <ol className="timeline">
              {b.history.map((h, i) => (
                <li key={i}>
                  <span className="timeline-dot" />
                  <div>
                    <strong>{h.status}</strong>
                    <time>{prettyTime(h.at)}</time>
                    <p>{h.note}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
        <aside className="panel booking-actions">
          <h2>{canDecide ? "Make it a date." : "Every detail, together."}</h2>
          {canDecide ? (
            <>
              <p className="muted">
                Accepting reserves your cart for this full date. Other pending
                requests for the same date will be declined.
              </p>
              <Field
                label="A note for the customer"
                hint="Optional · Included in the booking history"
              >
                <textarea
                  rows="4"
                  maxLength={1000}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="We’d love to be part of your gathering…"
                />
              </Field>
              <div className="stack">
                <Button onClick={() => setDecision("Accepted")} icon="check">
                  Accept request
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setDecision("Declined")}
                >
                  Decline request
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="muted">
                {b.status === "Accepted"
                  ? "Stay in touch and mark the event complete after its scheduled end."
                  : "This record stays here with its full history."}
              </p>
              {["Accepted", "Completed"].includes(b.status) && (
                <Button
                  variant="secondary"
                  icon="message"
                  className="full-width"
                  onClick={() => setContact(true)}
                >
                  Contact customer
                </Button>
              )}
              {b.status === "Accepted" && (
                <>
                  <Button
                    className="full-width"
                    disabled={!canComplete}
                    onClick={() => setDecision("Completed")}
                  >
                    Mark event completed
                  </Button>
                  {!canComplete && (
                    <p className="small muted">
                      Available after the event’s scheduled end.
                    </p>
                  )}
                </>
              )}
            </>
          )}
        </aside>
      </div>
      {decision && (
        <Modal
          title={
            decision === "Accepted"
              ? "Accept this gathering?"
              : decision === "Declined"
                ? "Decline this request?"
                : "Mark this event completed?"
          }
          onClose={() => setDecision(null)}
        >
          <p>
            {b.id} · {prettyDate(b.date)} · {b.time}
          </p>
          <Notice>
            {decision === "Accepted"
              ? `The full date will be reserved. ${competing ? `${competing} competing pending request(s) will be declined.` : "There are no competing pending requests."}`
              : decision === "Declined"
                ? "The customer will see your decision and note in their booking history."
                : "The customer will be able to publish one verified review."}
          </Notice>
          <FormAlert error={action.error} />
          <div className="button-row">
            <Button variant="secondary" onClick={() => setDecision(null)}>
              Go back
            </Button>
            <Button
              busy={action.busy}
              onClick={() =>
                action.execute(async () => {
                  await run(
                    decision === "Completed"
                      ? "completeBooking"
                      : "decideBooking",
                    { bookingId: id, status: decision, note },
                  );
                  flash(`Booking ${decision.toLowerCase()}.`);
                  navigate("/vendor");
                })
              }
            >
              Confirm{" "}
              {decision === "Completed"
                ? "completion"
                : decision === "Accepted"
                  ? "acceptance"
                  : "decline"}
            </Button>
          </div>
        </Modal>
      )}
      {contact && (
        <ContactDialog booking={b} onClose={() => setContact(false)} />
      )}
    </>
  );
}

export function AvailabilityCalendar() {
  const { state, user, run, flash } = useApp();
  const cart = state.carts.find((c) => c.vendorId === user.id),
    today = localDate();
  const [month, setMonth] = useState(
      () => new Date(`${today.slice(0, 7)}-01T12:00:00Z`),
    ),
    [selected, setSelected] = useState(dateAt(1)),
    [confirm, setConfirm] = useState(false),
    action = useAction();
  if (!cart) return <Empty title="Create your listing first" />;
  const year = month.getUTCFullYear(),
    m = month.getUTCMonth(),
    days = new Date(Date.UTC(year, m + 1, 0)).getUTCDate(),
    start = (new Date(Date.UTC(year, m, 1)).getUTCDay() + 6) % 7,
    ym = `${year}-${String(m + 1).padStart(2, "0")}`;
  const accepted = state.bookings.filter(
      (b) => b.cartId === cart.id && b.status === "Accepted",
    ),
    booked = accepted.find((b) => b.date === selected),
    blocked = cart.blockedDates.includes(selected),
    pending = state.bookings.filter(
      (b) =>
        b.cartId === cart.id && b.date === selected && b.status === "Pending",
    ).length;
  return (
    <>
      <PageHeading
        eyebrow="LEAVE A LITTLE ROOM FOR THE GOOD STUFF"
        title="Your availability"
      >
        One accepted event reserves the full date. Pending requests leave it
        open.
      </PageHeading>
      <div className="calendar-layout">
        <section className="panel calendar-panel">
          <div className="calendar-month">
            <h2>
              {new Intl.DateTimeFormat("en-GB", {
                month: "long",
                year: "numeric",
                timeZone: "UTC",
              }).format(month)}
            </h2>
            <div>
              <button
                type="button"
                className="icon-button"
                aria-label="Previous month"
                onClick={() => setMonth(new Date(Date.UTC(year, m - 1, 1, 12)))}
              >
                <Icon name="back" />
              </button>
              <button
                type="button"
                className="icon-button"
                aria-label="Next month"
                onClick={() => setMonth(new Date(Date.UTC(year, m + 1, 1, 12)))}
              >
                <Icon name="arrow" />
              </button>
            </div>
          </div>
          <div className="calendar-weekdays">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="calendar-grid">
            {Array.from({ length: start }, (_, i) => (
              <span key={`blank-${i}`} />
            ))}
            {Array.from({ length: days }, (_, i) => {
              const date = `${ym}-${String(i + 1).padStart(2, "0")}`,
                isBooked = accepted.some((b) => b.date === date),
                isBlocked = cart.blockedDates.includes(date);
              return (
                <button
                  type="button"
                  key={date}
                  disabled={date <= today}
                  aria-pressed={selected === date}
                  aria-label={`${prettyDate(date)}, ${isBooked ? "booked" : isBlocked ? "blocked" : "available"}`}
                  className={`${selected === date ? "selected" : ""} ${isBooked ? "booked" : isBlocked ? "blocked" : "free"} ${date === today ? "today" : ""}`}
                  onClick={() => {
                    setSelected(date);
                    action.setError(null);
                  }}
                >
                  <span>{i + 1}</span>
                  {(isBooked || isBlocked) && <i />}
                </button>
              );
            })}
          </div>
          <div className="calendar-legend">
            <span>
              <i className="free" />
              Available
            </span>
            <span>
              <i className="booked" />
              Booked
            </span>
            <span>
              <i className="blocked" />
              Blocked
            </span>
          </div>
        </section>
        <aside className="panel calendar-detail">
          <p className="eyebrow">YOUR SELECTED DATE</p>
          <h2>{prettyDate(selected)}</h2>
          <Badge
            status={booked ? "Accepted" : blocked ? "Cancelled" : "Active"}
          >
            {booked ? "Booked" : blocked ? "Blocked" : "Available"}
          </Badge>
          <p className="muted">
            {booked
              ? "An accepted event reserves this full date. It cannot be blocked."
              : blocked
                ? "You’re taking this date off. Remove the block to welcome new requests."
                : `No accepted event on this date.${pending ? ` ${pending} pending request(s) would be declined if you block it.` : " Your cart can receive booking requests."}`}
          </p>
          {booked ? (
            <Link
              className="button secondary"
              to={`/vendor/request/${booked.id}`}
            >
              View accepted event
              <Icon name="arrow" size={16} />
            </Link>
          ) : (
            <Button
              icon={blocked ? "calendar" : "lock"}
              disabled={!isFuture(selected)}
              onClick={() => setConfirm(true)}
            >
              {blocked ? "Remove date block" : "Block this date"}
            </Button>
          )}
          <div className="aside-footer">
            <Icon name="info" />
            <p>
              All dates use Saudi Arabia time. Past dates cannot be changed.
            </p>
          </div>
        </aside>
      </div>
      {confirm && (
        <Modal
          title={
            blocked ? "Welcome requests on this date?" : "Block this date?"
          }
          onClose={() => setConfirm(false)}
        >
          <p>{prettyDate(selected)}</p>
          <Notice>
            {blocked
              ? "The date will become available if no accepted booking reserves it."
              : `New requests will be unavailable.${pending ? ` ${pending} pending request(s) will be declined and customers will be notified.` : " No pending requests will be affected."}`}
          </Notice>
          <FormAlert error={action.error} />
          <div className="button-row">
            <Button variant="secondary" onClick={() => setConfirm(false)}>
              Go back
            </Button>
            <Button
              busy={action.busy}
              onClick={() =>
                action.execute(async () => {
                  await run("blockDate", { date: selected });
                  flash(
                    blocked
                      ? "Date block removed."
                      : "Date blocked. Affected requests have been updated.",
                  );
                  setConfirm(false);
                })
              }
            >
              {blocked ? "Remove block" : "Confirm block"}
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}

const itemId = () =>
  globalThis.crypto?.randomUUID?.() ||
  `item-${Date.now()}-${Math.random().toString(36).slice(2)}`;
export function ListingEditor() {
  const { state, user, run, flash } = useApp();
  const current = state.carts.find((c) => c.vendorId === user.id);
  const [cart, setCart] = useState(() => structuredClone(current)),
    [tab, setTab] = useState("Profile"),
    [imageError, setImageError] = useState(""),
    action = useAction();
  if (!cart) return <Empty title="No vendor listing found" />;
  const update = (key, value) => setCart((c) => ({ ...c, [key]: value }));
  const editRow = (key, id, field, value) =>
    update(
      key,
      cart[key].map((i) =>
        i.id === id
          ? {
              ...i,
              [field]: ["price", "duration", "capacity"].includes(field)
                ? value === ""
                  ? ""
                  : Number(value)
                : value,
            }
          : i,
      ),
    );
  const save = (submit) =>
    action.execute(async () => {
      await run("saveListing", { cart, submit });
      flash(
        submit && current.status !== "Approved"
          ? "Listing submitted for verification."
          : "Your listing changes are saved.",
      );
    });
  const upload = async (e) => {
    const file = e.target.files?.[0];
    setImageError("");
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setImageError("Please choose a JPG or PNG image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError("The image must be 5 MB or smaller.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => update("photo", reader.result);
    reader.onerror = () =>
      setImageError("This image could not be read. Please try another.");
    reader.readAsDataURL(file);
  };
  return (
    <>
      <PageHeading
        eyebrow="YOUR CART’S LITTLE CORNER OF THE WORLD"
        title="Make a good first impression."
        action={
          <Badge status={current.suspended ? "Suspended" : current.status} />
        }
      >
        Keep your profile, menu and packages ready for your next gathering.
      </PageHeading>
      {current.status === "Rejected" && (
        <Notice tone="danger">
          Your listing needs a little more work: {current.rejectionReason}
        </Notice>
      )}
      {current.status === "Pending" && (
        <Notice>
          Your application is waiting for administrator review. It will stay
          hidden until approved.
        </Notice>
      )}
      {current.suspended && (
        <Notice tone="danger">
          Your listing is suspended. Existing bookings are preserved; new
          booking requests are unavailable.
        </Notice>
      )}
      <div className="listing-layout">
        <div className="panel listing-editor">
          <Tabs
            value={tab}
            onChange={setTab}
            items={["Profile", "Menu", "Packages"]}
            label="Listing editor"
          />
          <FormAlert error={action.error} />
          {action.fields.menu && (
            <Notice tone="danger">
              {action.fields.menu} Open the Menu tab to fix it.
            </Notice>
          )}
          {action.fields.packages && (
            <Notice tone="danger">
              {action.fields.packages} Open the Packages tab to fix it.
            </Notice>
          )}
          {tab === "Profile" && (
            <div className="stack editor-body">
              <h2>The story behind your cart</h2>
              <div className="upload-row">
                <div className="upload-preview">
                  <CartArt {...cart} />
                </div>
                <div className="stack">
                  <label className="button secondary upload-label">
                    <Icon name="upload" size={17} />
                    Upload cart photo
                    <input
                      aria-label="Upload cart photo"
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={upload}
                    />
                  </label>
                  <small className="muted">JPG or PNG · Up to 5 MB</small>
                  {cart.photo && (
                    <button
                      type="button"
                      className="text-button"
                      onClick={() => update("photo", null)}
                    >
                      Remove uploaded photo
                    </button>
                  )}
                  {imageError && (
                    <span className="error-text" role="alert">
                      {imageError}
                    </span>
                  )}
                </div>
              </div>
              <Field label="Cart name" required error={action.fields.name}>
                <input
                  value={cart.name}
                  maxLength={60}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="The name your guests will remember"
                />
              </Field>
              <div className="form-grid">
                <Field label="Category" required error={action.fields.category}>
                  <select
                    value={cart.category}
                    onChange={(e) => update("category", e.target.value)}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                <Field
                  label="Base city"
                  required
                  error={action.fields.baseCity}
                >
                  <select
                    value={cart.baseCity}
                    onChange={(e) => update("baseCity", e.target.value)}
                  >
                    {CITIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field
                label="A little tagline"
                hint="Optional · A short line that feels like your cart"
              >
                <input
                  value={cart.tagline}
                  maxLength={90}
                  onChange={(e) => update("tagline", e.target.value)}
                  placeholder="Good coffee. Good company."
                />
              </Field>
              <Field
                label="About your cart"
                required
                hint="At least 20 characters"
                error={action.fields.description}
              >
                <textarea
                  rows="5"
                  value={cart.description}
                  minLength={20}
                  maxLength={1500}
                  onChange={(e) => update("description", e.target.value)}
                />
              </Field>
              <fieldset className="city-checkboxes">
                <legend>Service cities *</legend>
                <p className="muted small">
                  Choose at least one city, including your base city.
                </p>
                <div>
                  {CITIES.map((c) => (
                    <Check
                      key={c}
                      checked={cart.cities.includes(c)}
                      onChange={(e) =>
                        update(
                          "cities",
                          e.target.checked
                            ? [...cart.cities, c]
                            : cart.cities.filter((v) => v !== c),
                        )
                      }
                    >
                      {c}
                    </Check>
                  ))}
                </div>
                {action.fields.cities && (
                  <p className="error-text">{action.fields.cities}</p>
                )}
              </fieldset>
            </div>
          )}
          {tab === "Menu" && (
            <div className="stack editor-body">
              <div className="heading-row">
                <div>
                  <h2>A taste of what you do</h2>
                  <p className="muted small">
                    Item prices are shown as a menu reference.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  icon="plus"
                  onClick={() =>
                    update("menu", [
                      ...cart.menu,
                      { id: itemId(), name: "", price: "" },
                    ])
                  }
                >
                  Add item
                </Button>
              </div>
              {cart.menu.length ? (
                cart.menu.map((item, i) => (
                  <div className="editable-row" key={item.id}>
                    <span className="row-number">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <Field label="Item name">
                      <input
                        aria-label={`Menu item ${i + 1} name`}
                        value={item.name}
                        maxLength={80}
                        onChange={(e) =>
                          editRow("menu", item.id, "name", e.target.value)
                        }
                      />
                    </Field>
                    <Field label="Price in SAR">
                      <input
                        aria-label={`Menu item ${i + 1} price`}
                        type="number"
                        min="1"
                        value={item.price}
                        onChange={(e) =>
                          editRow("menu", item.id, "price", e.target.value)
                        }
                      />
                    </Field>
                    <button
                      type="button"
                      className="icon-button danger-text"
                      aria-label={`Remove menu item ${i + 1}`}
                      onClick={() =>
                        update(
                          "menu",
                          cart.menu.filter((v) => v.id !== item.id),
                        )
                      }
                    >
                      <Icon name="trash" size={18} />
                    </button>
                  </div>
                ))
              ) : (
                <Empty icon="coffee" title="What’s on your menu?">
                  Add your first item with a name and price.
                </Empty>
              )}
            </div>
          )}
          {tab === "Packages" && (
            <div className="stack editor-body">
              <div className="heading-row">
                <div>
                  <h2>Something for every gathering</h2>
                  <p className="muted small">
                    Prices are the total package price in SAR.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  icon="plus"
                  onClick={() =>
                    update("packages", [
                      ...cart.packages,
                      {
                        id: itemId(),
                        name: "",
                        price: "",
                        capacity: "",
                        duration: "",
                        description: "",
                      },
                    ])
                  }
                >
                  Add package
                </Button>
              </div>
              {cart.packages.length ? (
                cart.packages.map((p, i) => (
                  <section className="editable-package" key={p.id}>
                    <div className="heading-row">
                      <h3>Package {i + 1}</h3>
                      <button
                        type="button"
                        className="icon-button danger-text"
                        aria-label={`Remove package ${i + 1}`}
                        onClick={() =>
                          update(
                            "packages",
                            cart.packages.filter((v) => v.id !== p.id),
                          )
                        }
                      >
                        <Icon name="trash" size={18} />
                      </button>
                    </div>
                    <Field label="Package name">
                      <input
                        aria-label={`Package ${i + 1} name`}
                        value={p.name}
                        maxLength={80}
                        onChange={(e) =>
                          editRow("packages", p.id, "name", e.target.value)
                        }
                      />
                    </Field>
                    <div className="form-grid three">
                      <Field label="Total price in SAR">
                        <input
                          aria-label={`Package ${i + 1} price`}
                          type="number"
                          min="1"
                          value={p.price}
                          onChange={(e) =>
                            editRow("packages", p.id, "price", e.target.value)
                          }
                        />
                      </Field>
                      <Field label="Maximum guests">
                        <input
                          aria-label={`Package ${i + 1} guest capacity`}
                          type="number"
                          min="1"
                          step="1"
                          value={p.capacity}
                          onChange={(e) =>
                            editRow(
                              "packages",
                              p.id,
                              "capacity",
                              e.target.value,
                            )
                          }
                        />
                      </Field>
                      <Field label="Service hours">
                        <input
                          aria-label={`Package ${i + 1} duration`}
                          type="number"
                          min="0.5"
                          max="24"
                          step="0.5"
                          value={p.duration}
                          onChange={(e) =>
                            editRow(
                              "packages",
                              p.id,
                              "duration",
                              e.target.value,
                            )
                          }
                        />
                      </Field>
                    </div>
                    <Field label="Package description">
                      <textarea
                        aria-label={`Package ${i + 1} description`}
                        rows="2"
                        value={p.description}
                        maxLength={500}
                        onChange={(e) =>
                          editRow(
                            "packages",
                            p.id,
                            "description",
                            e.target.value,
                          )
                        }
                      />
                    </Field>
                  </section>
                ))
              ) : (
                <Empty icon="cart" title="Make your first package">
                  Add a name, total price, guest capacity and service duration.
                </Empty>
              )}
              <Notice>
                Editing or removing a package never changes details already
                saved in a booking.
              </Notice>
            </div>
          )}
          <div className="editor-footer">
            <Button
              variant="secondary"
              busy={action.busy}
              onClick={() => save(false)}
            >
              {current.status === "Approved" ? "Save changes" : "Save draft"}
            </Button>
            {current.status !== "Approved" && (
              <Button busy={action.busy} onClick={() => save(true)}>
                Submit for verification
                <Icon name="arrow" size={17} />
              </Button>
            )}
          </div>
        </div>
        <aside className="panel listing-preview">
          <p className="eyebrow">A LITTLE PREVIEW</p>
          <CartArt {...cart} />
          <Badge status={current.status} />
          <h2>{cart.name || "Your cart name"}</h2>
          <p className="muted">
            {cart.tagline || "Your cart’s one-line introduction"}
          </p>
          <div className="inline-meta">
            <Icon name="pin" size={16} />
            {cart.cities.join(" · ") || "Add your service cities"}
          </div>
          <div className="aside-footer">
            <Icon name="shield" />
            <p>
              New listings stay private until an administrator verifies them.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}

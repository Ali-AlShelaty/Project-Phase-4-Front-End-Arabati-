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
import { StatCard } from "./Vendor.jsx";
import { money, prettyDate, prettyTime, STATUSES } from "../domain/rules.js";
export function AdminDashboard() {
  const { state } = useApp();
  const pending = state.carts.filter((c) => c.status === "Pending"),
    reports = state.reports.filter((r) => r.status === "Open"),
    suspended = state.carts.filter((c) => c.suspended);
  return (
    <>
      <PageHeading
        eyebrow="A LITTLE CARE GOES A LONG WAY"
        title="Keep good gatherings possible."
      >
        Verify vendors, review concerns and keep the marketplace trusted.
      </PageHeading>
      <div className="stat-grid">
        <StatCard
          icon="cart"
          value={pending.length}
          label="Vendor applications"
          to="/applications"
        />
        <StatCard
          icon="flag"
          value={reports.length}
          label="Open reports"
          to="/moderation"
        />
        <StatCard
          icon="shield"
          value={suspended.length}
          label="Suspended listings"
          to="/records?tab=Listings&status=Suspended"
        />
        <StatCard
          icon="calendar"
          value={state.bookings.length}
          label="Booking records"
          to="/records?tab=Bookings"
        />
      </div>
      <div className="admin-columns">
        <section className="panel">
          <div className="heading-row">
            <h2>Needs your attention</h2>
            <Icon name="spark" />
          </div>
          {pending.length || reports.length ? (
            <div className="attention-list">
              {pending.map((c) => (
                <Link key={c.id} to={`/application/${c.id}`}>
                  <span className="attention-icon">
                    <Icon name="cart" />
                  </span>
                  <div>
                    <strong>{c.name}</strong>
                    <small>Vendor application · Awaiting verification</small>
                  </div>
                  <Icon name="arrow" size={17} />
                </Link>
              ))}
              {reports.map((r) => (
                <Link key={r.id} to={`/moderation?report=${r.id}`}>
                  <span className="attention-icon">
                    <Icon name="flag" />
                  </span>
                  <div>
                    <strong>Report {r.id}</strong>
                    <small>
                      {r.reason} · {r.targetType}
                    </small>
                  </div>
                  <Icon name="arrow" size={17} />
                </Link>
              ))}
            </div>
          ) : (
            <Empty icon="check" title="All caught up">
              The marketplace is in good hands.
            </Empty>
          )}
          <Link to="/records" className="text-button">
            Users, listings & bookings
            <Icon name="arrow" size={16} />
          </Link>
        </section>
        <section className="panel">
          <h2>Recent moderation activity</h2>
          {state.audit.length ? (
            <ul className="activity-list">
              {state.audit.slice(0, 8).map((a) => (
                <li key={a.id}>
                  <Icon name="shield" size={17} />
                  <div>
                    <strong>{a.action}</strong>
                    <span>
                      {a.target} · {a.actorName}
                    </span>
                    <small>{prettyTime(a.createdAt)}</small>
                    <p>{a.reason}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <Empty icon="shield" title="A fresh start">
              Verification and moderation decisions will appear here with their
              actor, reason and time.
            </Empty>
          )}
        </section>
      </div>
    </>
  );
}
export function Applications() {
  const { state } = useApp();
  const records = state.carts.filter((c) => c.status === "Pending");
  return (
    <>
      <PageHeading
        back="/admin"
        eyebrow="LOCAL VENDORS, VERIFIED WITH CARE"
        title="Vendor applications"
      >
        Review each profile, menu, package and service area before publication.
      </PageHeading>
      {records.length ? (
        <div className="application-grid">
          {records.map((c) => (
            <article key={c.id} className="panel application-card">
              <CartArt {...c} />
              <Badge status={c.status} />
              <h2>{c.name}</h2>
              <p className="muted">
                {c.category} · {c.cities.join(", ")}
              </p>
              <Link to={`/application/${c.id}`} className="button primary">
                Review application
                <Icon name="arrow" size={17} />
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <Empty icon="check" title="Every application has a little attention">
          There are no pending applications right now.
        </Empty>
      )}
    </>
  );
}
export function VerifyListing({ id }) {
  const { state, run, flash } = useApp();
  const cart = state.carts.find((c) => c.id === id);
  const [checks, setChecks] = useState([false, false, false]),
    [reason, setReason] = useState(""),
    [decision, setDecision] = useState(null),
    action = useAction();
  if (!cart) return <Empty title="Listing not found" />;
  const vendor = state.users.find((u) => u.id === cart.vendorId);
  return (
    <>
      <PageHeading
        back="/applications"
        eyebrow="BUILDING A TRUSTED LITTLE MARKETPLACE"
        title={cart.name || "Vendor listing"}
        action={<Badge status={cart.status} />}
      >
        Vendor profile, menu and package review
      </PageHeading>
      <div className="form-aside-layout">
        <div className="stack">
          <section className="panel application-detail">
            <CartArt {...cart} />
            <h2>{cart.name}</h2>
            <p>{cart.description}</p>
            <dl>
              <div>
                <dt>Vendor</dt>
                <dd>
                  {vendor?.name} · {vendor?.email}
                </dd>
              </div>
              <div>
                <dt>Contact</dt>
                <dd>{vendor?.mobile}</dd>
              </div>
              <div>
                <dt>Base city</dt>
                <dd>{cart.baseCity}</dd>
              </div>
              <div>
                <dt>Service cities</dt>
                <dd>{cart.cities.join(", ")}</dd>
              </div>
              <div>
                <dt>Category</dt>
                <dd>{cart.category}</dd>
              </div>
            </dl>
          </section>
          <section className="panel">
            <h2>Menu & packages</h2>
            <div className="menu-list">
              {cart.menu.map((i) => (
                <div key={i.id}>
                  <span>{i.name}</span>
                  <strong>{money(i.price)}</strong>
                </div>
              ))}
            </div>
            <div className="stack">
              {cart.packages.map((p) => (
                <div className="package-review" key={p.id}>
                  <h3>{p.name}</h3>
                  <p>{p.description}</p>
                  <span>
                    {money(p.price)} · {p.capacity} guests · {p.duration} hours
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
        <aside className="panel verification-checklist">
          <h2>Check the little details.</h2>
          {cart.status === "Pending" ? (
            <>
              <p className="muted">
                Complete all three checks to approve. A rejection needs a clear
                reason.
              </p>
              <div className="stack">
                {[
                  "Profile and contact are complete",
                  "Menu and package prices are valid",
                  "Base and service cities are reviewed",
                ].map((label, i) => (
                  <Check
                    key={i}
                    checked={checks[i]}
                    onChange={(e) =>
                      setChecks((s) =>
                        s.map((v, j) => (i === j ? e.target.checked : v)),
                      )
                    }
                  >
                    {label}
                  </Check>
                ))}
              </div>
              <Field
                label="Decision reason"
                hint="Required if rejecting"
                error={action.fields.reason}
              >
                <textarea
                  rows="4"
                  value={reason}
                  maxLength={1000}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain the decision or changes needed…"
                />
              </Field>
              <div className="stack">
                <Button icon="check" onClick={() => setDecision("Approved")}>
                  Approve listing
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setDecision("Rejected")}
                >
                  Reject with reason
                </Button>
              </div>
            </>
          ) : (
            <Notice>
              {cart.status === "Rejected"
                ? cart.rejectionReason
                : "This application has already been decided. Its status is preserved."}
            </Notice>
          )}
          <div className="aside-footer">
            <Icon name="shield" />
            <p>
              Every decision records the actor, reason and time, and notifies
              the vendor.
            </p>
          </div>
        </aside>
      </div>
      {decision && (
        <Modal
          title={
            decision === "Approved"
              ? "Approve this listing?"
              : "Return this listing for changes?"
          }
          onClose={() => setDecision(null)}
        >
          <p>
            {decision === "Approved"
              ? "The listing will become public if the vendor account and listing are active."
              : "The listing stays hidden. The vendor will receive your reason."}
          </p>
          <FormAlert error={action.error} />
          <div className="button-row">
            <Button variant="secondary" onClick={() => setDecision(null)}>
              Go back
            </Button>
            <Button
              busy={action.busy}
              onClick={() =>
                action.execute(async () => {
                  await run("verifyListing", {
                    cartId: id,
                    status: decision,
                    reason,
                    checks,
                  });
                  flash(`Listing ${decision.toLowerCase()}. Vendor notified.`);
                  navigate("/admin");
                })
              }
            >
              Confirm {decision === "Approved" ? "approval" : "rejection"}
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
export function Moderation({ query }) {
  const { state } = useApp();
  const [status, setStatus] = useState("Open"),
    [search, setSearch] = useState(query.get("report") || ""),
    [page, setPage] = useState(1);
  const records = state.reports.filter(
    (r) =>
      (!status || r.status === status) &&
      `${r.id} ${r.reason} ${r.targetId} ${r.details}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <>
      <PageHeading
        eyebrow="CARE FOR THE COMMUNITY"
        title="A fair look at every concern."
      >
        Review evidence privately and explain every moderation decision.
      </PageHeading>
      <Tabs
        value="Reports"
        onChange={(v) => v !== "Reports" && navigate(`/records?tab=${v}`)}
        items={["Reports", "Users", "Listings"]}
        label="Moderation records"
      />
      <div className="record-filters">
        <Field label="Search reports">
          <input
            type="search"
            placeholder="Reference, reason or content"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </Field>
        <Field label="Status">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option>Open</option>
            <option>Resolved</option>
            <option value="">All statuses</option>
          </select>
        </Field>
      </div>
      <div className="record-count">{records.length} reports</div>
      {records.length ? (
        <div className="stack">
          {records.slice((page - 1) * 20, page * 20).map((r) => (
            <ReportReview key={r.id} report={r} />
          ))}
        </div>
      ) : (
        <Empty icon="flag" title="Nothing waiting in this view">
          Try a different search or report status.
        </Empty>
      )}
      <Pagination total={records.length} page={page} onChange={setPage} />
    </>
  );
}
function ReportReview({ report }) {
  const { state, run, flash } = useApp();
  const [reason, setReason] = useState(""),
    [choice, setChoice] = useState(null),
    action = useAction(),
    cart = state.carts.find((c) => c.id === report.cartId),
    review = state.reviews.find((r) => r.id === report.targetId),
    reporter = state.users.find((u) => u.id === report.reporterId);
  return (
    <article className="panel report-review">
      <div className="heading-row">
        <div>
          <p className="eyebrow">PRIVATE ADMINISTRATOR REVIEW</p>
          <h2>
            {report.id} · {report.reason}
          </h2>
        </div>
        <Badge status={report.status} />
      </div>
      <div className="report-evidence-grid">
        <div>
          <span className="small muted">REPORTED CONTENT</span>
          <h3>
            {cart?.name} · {report.targetType}
          </h3>
          <p className="evidence-text">
            {report.targetSnapshot ||
              (report.targetType === "review"
                ? review?.text
                : cart?.description) ||
              "Original content is no longer available."}
          </p>
          <p className="small muted">
            Target: {report.targetId}
            {review?.hidden ? " · Currently hidden" : ""}
          </p>
        </div>
        <div>
          <span className="small muted">REPORTER’S EVIDENCE</span>
          <p>{report.details}</p>
          <p className="small muted">
            Reported by {reporter?.name || report.reporterId} ·{" "}
            {prettyTime(report.createdAt)}
          </p>
        </div>
      </div>
      {report.status === "Open" ? (
        <>
          <Field
            label="Resolution reason"
            required
            error={action.fields.reason}
          >
            <textarea
              rows="3"
              maxLength={1000}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain the evidence and why this action is appropriate…"
            />
          </Field>
          <div className="button-row">
            {report.targetType === "review" && (
              <Button onClick={() => setChoice("hide")}>
                Hide review & resolve
              </Button>
            )}
            <Button variant="secondary" onClick={() => setChoice("dismiss")}>
              Dismiss report
            </Button>
            <Button variant="text-danger" onClick={() => setChoice("suspend")}>
              Suspend listing & resolve
            </Button>
          </div>
        </>
      ) : (
        <Notice tone="success" icon="check">
          <strong>{report.resolution?.action}</strong> ·{" "}
          {report.resolution?.reason}
          <br />
          <small>{report.resolution && prettyTime(report.resolution.at)}</small>
        </Notice>
      )}
      {choice && (
        <Modal title="Confirm this resolution?" onClose={() => setChoice(null)}>
          <p>
            {choice === "hide"
              ? "The review will be hidden and excluded from the public average."
              : choice === "suspend"
                ? "The listing will be hidden and new requests blocked. Existing bookings are preserved."
                : "The content stays as it is. The report will be marked resolved."}
          </p>
          <FormAlert error={action.error} />
          <div className="button-row">
            <Button variant="secondary" onClick={() => setChoice(null)}>
              Go back
            </Button>
            <Button
              busy={action.busy}
              onClick={() =>
                action.execute(async () => {
                  await run("resolveReport", {
                    reportId: report.id,
                    reason,
                    action: choice,
                  });
                  flash(`Report ${report.id} resolved. Decision recorded.`);
                  setChoice(null);
                })
              }
            >
              Confirm resolution
            </Button>
          </div>
        </Modal>
      )}
    </article>
  );
}
function StatusDialog({ target, targetType, onClose }) {
  const { run, flash } = useApp();
  const [reason, setReason] = useState(""),
    action = useAction(),
    suspended =
      targetType === "user" ? target.status === "Suspended" : target.suspended;
  return (
    <Modal
      title={`${suspended ? "Restore" : "Suspend"} ${targetType === "user" ? "account" : "listing"}?`}
      onClose={onClose}
    >
      <p>{target.name}</p>
      <Notice>
        {suspended
          ? "Restoration returns the active state. A listing still needs approval before it can be public."
          : "New access or booking requests will be blocked as applicable. Existing booking records and history are preserved."}
      </Notice>
      <form
        className="stack"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          action.execute(async () => {
            await run("moderate", {
              targetType,
              targetId: target.id,
              action: suspended ? "restore" : "suspend",
              reason,
            });
            flash(
              `${targetType === "user" ? "Account" : "Listing"} ${suspended ? "restored" : "suspended"}.`,
            );
            onClose();
          });
        }}
      >
        <FormAlert error={action.error} />
        <Field label="Moderation reason" required error={action.fields.reason}>
          <textarea
            rows="4"
            maxLength={1000}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="This reason is saved to the audit history…"
          />
        </Field>
        <div className="button-row">
          <Button variant="secondary" onClick={onClose}>
            Go back
          </Button>
          <Button
            type="submit"
            variant={suspended ? "primary" : "danger"}
            busy={action.busy}
          >
            Confirm {suspended ? "restoration" : "suspension"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
export function Records({ query }) {
  const { state, user } = useApp();
  const [tab, setTab] = useState(
      ["Users", "Listings", "Bookings"].includes(query.get("tab"))
        ? query.get("tab")
        : "Users",
    ),
    [search, setSearch] = useState(query.get("q") || ""),
    [status, setStatus] = useState(query.get("status") || ""),
    [role, setRole] = useState(""),
    [date, setDate] = useState(""),
    [page, setPage] = useState(1),
    [target, setTarget] = useState(null);
  const switchTab = (v) => {
    setTab(v);
    setStatus("");
    setSearch("");
    setRole("");
    setDate("");
    setPage(1);
  };
  const statuses =
    tab === "Users"
      ? ["Active", "Suspended"]
      : tab === "Listings"
        ? ["Approved", "Pending", "Rejected", "Draft", "Suspended"]
        : STATUSES;
  let records = (
    tab === "Users"
      ? state.users
      : tab === "Listings"
        ? state.carts
        : state.bookings
  ).filter((r) => {
    const text =
      tab === "Users"
        ? `${r.name} ${r.email} ${r.id}`
        : tab === "Listings"
          ? `${r.name} ${r.category} ${r.id} ${r.vendorId}`
          : `${r.id} ${r.cartName} ${state.users.find((u) => u.id === r.customerId)?.name || ""} ${r.customerId} ${r.vendorId}`;
    return (
      text.toLowerCase().includes(search.toLowerCase()) &&
      (!status ||
        (tab === "Listings"
          ? status === "Suspended"
            ? r.suspended
            : !r.suspended && r.status === status
          : r.status === status)) &&
      (!role || tab !== "Users" || r.role === role) &&
      (!date || tab !== "Bookings" || r.date === date)
    );
  });
  return (
    <>
      <PageHeading
        eyebrow="A CLEAR VIEW OF THE MARKETPLACE"
        title="Platform records"
      >
        Inspect accounts, listings and booking history. Every moderation action
        keeps an audit record.
      </PageHeading>
      <Tabs
        value={tab}
        onChange={switchTab}
        items={["Users", "Listings", "Bookings"]}
        label="Platform record type"
      />
      <div className="record-filters">
        <Field label="Search records">
          <input
            type="search"
            value={search}
            placeholder={
              tab === "Bookings"
                ? "Booking ID, cart or customer"
                : "Name, email or reference"
            }
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </Field>
        <Field label="Status">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            {statuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
        {tab === "Users" && (
          <Field label="Account role">
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All roles</option>
              <option value="customer">Customer</option>
              <option value="vendor">Vendor</option>
              <option value="admin">Administrator</option>
            </select>
          </Field>
        )}
        {tab === "Bookings" && (
          <Field label="Event date">
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setPage(1);
              }}
            />
          </Field>
        )}
      </div>
      {tab === "Bookings" && (
        <Notice>
          Read only oversight. Administrators cannot accept, cancel or complete
          participant bookings.
        </Notice>
      )}
      <div className="record-count">
        {records.length} {tab.toLowerCase()}
      </div>
      {records.length ? (
        <div className="record-list">
          {records.slice((page - 1) * 20, page * 20).map((r) => (
            <article className="panel record-card" key={r.id}>
              <div className="record-identity">
                <span className="record-icon">
                  <Icon
                    name={
                      tab === "Users"
                        ? "user"
                        : tab === "Listings"
                          ? "cart"
                          : "calendar"
                    }
                    size={23}
                  />
                </span>
                <div>
                  <h3>
                    {tab === "Bookings"
                      ? `${r.id} · ${r.cartName}`
                      : r.name || "Untitled cart"}
                  </h3>
                  <p>
                    {tab === "Users"
                      ? `${r.email} · ${r.role}`
                      : tab === "Listings"
                        ? `${r.category} · ${r.cities.join(", ")}`
                        : `${prettyDate(r.date, true)} · ${r.time} · ${state.users.find((u) => u.id === r.customerId)?.name || "Customer"}`}
                  </p>
                  <small>
                    {tab === "Bookings"
                      ? `${r.package.name} · ${money(r.package.price)}`
                      : r.id}
                  </small>
                </div>
              </div>
              <div className="record-card-actions">
                <Badge
                  status={
                    tab === "Listings" && r.suspended ? "Suspended" : r.status
                  }
                />
                {tab === "Users" ? (
                  <>
                    <Button
                      variant="secondary"
                      disabled={r.id === user.id}
                      onClick={() =>
                        setTarget({ target: r, targetType: "user" })
                      }
                    >
                      {r.status === "Suspended" ? "Restore" : "Suspend"}
                    </Button>
                    {r.role === "vendor" && (
                      <Link
                        className="text-button small"
                        to={`/records?tab=Listings&q=${encodeURIComponent(r.id)}`}
                      >
                        View listing
                      </Link>
                    )}
                  </>
                ) : tab === "Listings" ? (
                  <>
                    <Link className="text-button" to={`/application/${r.id}`}>
                      {r.status === "Pending"
                        ? "Review application"
                        : "Inspect listing"}
                    </Link>
                    <Button
                      variant="secondary"
                      onClick={() =>
                        setTarget({ target: r, targetType: "listing" })
                      }
                    >
                      {r.suspended ? "Restore" : "Suspend"}
                    </Button>
                  </>
                ) : (
                  <Link to={`/oversight/${r.id}`} className="button secondary">
                    View history
                    <Icon name="arrow" size={15} />
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Empty title="No records match this view">
          Adjust the search or filters to try again.
        </Empty>
      )}
      <Pagination total={records.length} page={page} onChange={setPage} />
      {target && <StatusDialog {...target} onClose={() => setTarget(null)} />}
    </>
  );
}

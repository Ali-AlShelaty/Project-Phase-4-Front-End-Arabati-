import React, { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import {
  Badge,
  Button,
  Empty,
  Field,
  FormAlert,
  Link,
  Notice,
  PageHeading,
  Tabs,
  navigate,
  useAction,
  Pagination,
} from "../components/UI.jsx";
import { Icon } from "../components/Icons.jsx";
import { prettyTime } from "../domain/rules.js";
export function Account() {
  const { user, run, signOut, flash } = useApp();
  const [name, setName] = useState(user.name),
    [mobile, setMobile] = useState(user.mobile),
    [current, setCurrent] = useState(""),
    [password, setPassword] = useState(""),
    [confirm, setConfirm] = useState(""),
    profile = useAction(),
    security = useAction();
  return (
    <>
      <PageHeading eyebrow="YOUR OWN LITTLE CORNER" title="Your account">
        Keep your details up to date for the gatherings ahead.
      </PageHeading>
      <div className="account-layout">
        <aside className="panel account-summary">
          <span className="avatar avatar-large">{user.name[0]}</span>
          <h2>{user.name}</h2>
          <p className="muted">{user.email}</p>
          <Badge status="neutral">
            {user.role === "admin" ? "Administrator" : user.role}
          </Badge>
          <div className="aside-footer">
            <Icon name="lock" />
            <p>Your account role and email cannot be changed here.</p>
          </div>
          <Button
            variant="secondary"
            className="full-width"
            icon="logout"
            onClick={() => {
              signOut();
              flash("You’re signed out. See you at the next gathering.");
              navigate("/signin");
            }}
          >
            Sign out
          </Button>
        </aside>
        <div className="stack">
          <form
            className="panel stack"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              profile.execute(async () => {
                await run("saveProfile", { name, mobile });
                flash("Your profile is saved.");
              });
            }}
          >
            <h2>The details that matter</h2>
            <FormAlert error={profile.error} />
            <Field label="Full name" required error={profile.fields.name}>
              <input
                autoComplete="name"
                maxLength={80}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <Field
              label="Saudi mobile number"
              required
              hint="05XXXXXXXX or +9665XXXXXXXX"
              error={profile.fields.mobile}
            >
              <input
                type="tel"
                autoComplete="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
            </Field>
            <Button type="submit" busy={profile.busy}>
              Save profile
            </Button>
          </form>
          <form
            className="panel stack"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              security.execute(async () => {
                await run("changePassword", { current, password, confirm });
                signOut();
                flash("Password changed. Please sign in again.");
                navigate("/signin");
              });
            }}
          >
            <h2>A little account security</h2>
            <FormAlert error={security.error} />
            <Field
              label="Current password"
              required
              error={security.fields.current}
            >
              <input
                type="password"
                autoComplete="current-password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
              />
            </Field>
            <Field
              label="New password"
              required
              hint="At least 12 characters"
              error={security.fields.password}
            >
              <input
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            <Field
              label="Confirm new password"
              required
              error={security.fields.confirm}
            >
              <input
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </Field>
            <Button type="submit" variant="secondary" busy={security.busy}>
              Change password
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
export function Alerts() {
  const { state, user, run, flash } = useApp();
  const [tab, setTab] = useState("All"),
    [page, setPage] = useState(1),
    action = useAction();
  const own = state.notifications.filter((n) => n.userId === user.id),
    records = own.filter((n) => tab === "All" || !n.read);
  const open = async (n) => {
    await run("readNotifications", { id: n.id });
    if (n.bookingId)
      navigate(
        user.role === "vendor"
          ? `/vendor/request/${n.bookingId}`
          : user.role === "admin"
            ? `/oversight/${n.bookingId}`
            : `/booking/${n.bookingId}`,
      );
    else if (n.cartId)
      navigate(user.role === "admin" ? `/application/${n.cartId}` : "/listing");
    else if (n.reportId && user.role === "admin")
      navigate(`/moderation?report=${n.reportId}`);
    else flash("Marked as read.");
  };
  return (
    <>
      <PageHeading
        eyebrow="GOOD NEWS, ALL TOGETHER"
        title="Your little updates"
        action={
          <Button
            variant="secondary"
            disabled={!own.some((n) => !n.read)}
            busy={action.busy}
            onClick={() =>
              action.execute(async () => {
                await run("readNotifications");
                flash("All caught up. Notifications marked as read.");
              })
            }
          >
            Mark all read
            <Icon name="check" size={17} />
          </Button>
        }
      >
        Booking decisions, listing updates and the details in between.
      </PageHeading>
      <Tabs
        label="Notification filter"
        items={[
          { value: "All", label: "All updates", count: own.length },
          {
            value: "Unread",
            label: "Unread",
            count: own.filter((n) => !n.read).length,
          },
        ]}
        value={tab}
        onChange={(v) => {
          setTab(v);
          setPage(1);
        }}
      />
      <FormAlert error={action.error} />
      {records.length ? (
        <div className="notification-list">
          {records.slice((page - 1) * 20, page * 20).map((n) => (
            <button
              type="button"
              key={n.id}
              className={`notification-card ${n.read ? "" : "unread"}`}
              onClick={() => action.execute(() => open(n))}
            >
              <span className="attention-icon">
                <Icon
                  name={n.bookingId ? "calendar" : n.cartId ? "cart" : "bell"}
                />
              </span>
              <span>
                <strong>{n.title}</strong>
                <span>{n.body}</span>
                <small>{prettyTime(n.createdAt)}</small>
              </span>
              <span className="notification-end">
                {!n.read && <i />}
                <Icon name="arrow" size={17} />
              </span>
            </button>
          ))}
        </div>
      ) : (
        <Empty icon="bell" title="A peaceful little pause">
          No {tab === "Unread" ? "unread " : ""}updates here. New activity will
          appear automatically.
        </Empty>
      )}
      <Pagination total={records.length} page={page} onChange={setPage} />
      <p className="small muted notifications-disclaimer">
        This prototype stores in-app alerts only. Email delivery will be
        connected in the back-end phase.
      </p>
    </>
  );
}

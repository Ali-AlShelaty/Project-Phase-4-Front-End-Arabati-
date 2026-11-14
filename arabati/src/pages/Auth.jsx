import React, { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import {
  Button,
  Field,
  FormAlert,
  Link,
  Modal,
  Check,
  Notice,
  Tabs,
  navigate,
  useAction,
} from "../components/UI.jsx";
import { Icon } from "../components/Icons.jsx";
import { CartArt } from "../components/CartArt.jsx";
import { DEMO_PASSWORD } from "../domain/rules.js";
export const homeFor = (user) =>
  user.role === "vendor"
    ? "/vendor"
    : user.role === "admin"
      ? "/admin"
      : "/bookings";
function AuthLayout({ eyebrow, title, children }) {
  return (
    <div className="auth-layout">
      <div className="auth-story">
        <p className="eyebrow">A CART FOR EVERY OCCASION</p>
        <h2>
          The best moments
          <br />
          are <em>shared.</em>
        </h2>
        <CartArt name="arabati" hero />
        <p>
          Good coffee. Beautiful details.
          <br />A gathering that feels like you.
        </p>
      </div>
      <div className="auth-form-wrap">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {children}
      </div>
    </div>
  );
}
export function SignIn({ query }) {
  const { signIn, user, signOut, flash } = useApp();
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [show, setShow] = useState(false),
    [reset, setReset] = useState(false),
    action = useAction();
  const finish = async (e, p) => {
    const u = await signIn(e, p);
    flash(
      `Welcome${u.role === "customer" ? `, ${u.name.split(" ")[0]}` : " back"}.`,
    );
    const next = query.get("next");
    navigate(
      u.role === "customer" && next?.startsWith("/") && !next.startsWith("//")
        ? next
        : homeFor(u),
    );
  };
  return (
    <AuthLayout eyebrow="WELCOME BACK" title="Your next gathering awaits.">
      <p className="muted">Sign in to pick up where you left off.</p>
      {user && (
        <Notice>
          You are signed in as {user.name}.{" "}
          <button
            className="text-button"
            type="button"
            onClick={() => {
              signOut();
              flash("Signed out. Choose another account.");
            }}
          >
            Switch account
          </button>
        </Notice>
      )}
      <form
        className="stack"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          action.execute(() => finish(email, password));
        }}
      >
        <FormAlert error={action.error} />
        <Field label="Email address" required>
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </Field>
        <Field label="Password" required>
          <div className="password-input">
            <input
              aria-label="Password"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              aria-label={show ? "Hide password" : "Show password"}
              onClick={() => setShow(!show)}
            >
              <Icon name="eye" size={18} />
            </button>
          </div>
        </Field>
        <button
          type="button"
          className="text-button align-end"
          onClick={() => setReset(true)}
        >
          Forgot password?
        </button>
        <Button type="submit" busy={action.busy} className="full-width">
          Sign in
          <Icon name="arrow" size={17} />
        </Button>
      </form>
      <p className="auth-switch">
        New to Arabati? <Link to="/register">Create an account</Link>
      </p>
      <div className="divider-label">Or explore the front-end demo</div>
      <div className="demo-role-grid">
        {[
          ["customer", "user", "Customer"],
          ["vendor", "cart", "Vendor"],
          ["admin", "shield", "Administrator"],
        ].map(([role, icon, label]) => (
          <button
            type="button"
            key={role}
            disabled={action.busy}
            onClick={() =>
              action.execute(() =>
                finish(`${role}@arabati.demo`, DEMO_PASSWORD),
              )
            }
          >
            <Icon name={icon} size={22} />
            <strong>{label}</strong>
            <span>
              Explore
              <Icon name="arrow" size={13} />
            </span>
          </button>
        ))}
      </div>
      <p className="demo-disclaimer">
        Demo accounts share example data on this browser.
        <br />
        No real booking or email is sent.
      </p>
      {reset && <RecoveryDialog onClose={() => setReset(false)} />}
    </AuthLayout>
  );
}
export function Register() {
  const { run, flash } = useApp();
  const [values, setValues] = useState({
      role: "customer",
      name: "",
      email: "",
      mobile: "",
      password: "",
      terms: false,
    }),
    [terms, setTerms] = useState(false),
    action = useAction();
  const update = (k, v) => setValues((s) => ({ ...s, [k]: v }));
  return (
    <AuthLayout
      eyebrow="MAKE ROOM FOR GOOD MOMENTS"
      title="A warm welcome starts here."
    >
      <p className="muted">Create your Arabati account.</p>
      <Tabs
        value={values.role}
        onChange={(v) => update("role", v)}
        label="Account role"
        items={[
          { value: "customer", label: "I’m planning an event", icon: "user" },
          { value: "vendor", label: "I’m a cart vendor", icon: "cart" },
        ]}
      />
      <form
        className="stack"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          action.execute(async () => {
            await run("register", values);
            flash("Account created. You can sign in now.");
            navigate("/signin");
          });
        }}
      >
        <FormAlert error={action.error} />
        <Field label="Full name" required error={action.fields.name}>
          <input
            autoComplete="name"
            maxLength={80}
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
          />
        </Field>
        <Field label="Email address" required error={action.fields.email}>
          <input
            type="email"
            autoComplete="email"
            maxLength={160}
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </Field>
        <Field
          label="Saudi mobile number"
          required
          hint="05XXXXXXXX or +9665XXXXXXXX"
          error={action.fields.mobile}
        >
          <input
            type="tel"
            autoComplete="tel"
            value={values.mobile}
            onChange={(e) => update("mobile", e.target.value)}
            placeholder="0500000000"
          />
        </Field>
        <Field
          label="Password"
          required
          hint="At least 12 characters"
          error={action.fields.password}
        >
          <input
            type="password"
            minLength={12}
            autoComplete="new-password"
            value={values.password}
            onChange={(e) => update("password", e.target.value)}
          />
        </Field>
        <Check
          checked={values.terms}
          onChange={(e) => update("terms", e.target.checked)}
          error={action.fields.terms}
        >
          I agree to the{" "}
          <button
            type="button"
            className="text-button inline"
            onClick={() => setTerms(true)}
          >
            terms and privacy notice
          </button>
          .
        </Check>
        <Button type="submit" busy={action.busy}>
          Create account
          <Icon name="arrow" size={17} />
        </Button>
      </form>
      <p className="auth-switch">
        Already part of the gathering? <Link to="/signin">Sign in</Link>
      </p>
      {terms && (
        <Modal title="Terms and privacy notice" onClose={() => setTerms(false)}>
          <p>
            This front-end demo saves sample account and booking information on
            this browser. Use fictional information. Vendors must be approved
            before their cart is public. A booking is confirmed only after
            acceptance, and no online payment is collected.
          </p>
          <p>
            Contacts are available after acceptance. Only completed events can
            be reviewed; reports are private to administrators. No automatic
            email or WhatsApp message is sent.
          </p>
          <Button
            onClick={() => {
              update("terms", true);
              setTerms(false);
            }}
          >
            Agree and continue
          </Button>
        </Modal>
      )}
    </AuthLayout>
  );
}
export function RecoveryDialog({ onClose }) {
  const { run } = useApp();
  const [email, setEmail] = useState(""),
    [token, setToken] = useState(null),
    action = useAction();
  return (
    <Modal title="A fresh start for your password" onClose={onClose}>
      {token ? (
        <div className="stack">
          <Notice tone="success" icon="check">
            If an account exists, a reset link would be emailed to it.
          </Notice>
          <p className="muted">
            For this front-end demo, you can open the local reset link below. It
            expires after 30 minutes and can be used once. No email was sent.
          </p>
          <Link
            className="button primary"
            to={`/reset?token=${encodeURIComponent(token)}`}
            onClick={onClose}
          >
            Open demo reset link
            <Icon name="arrow" size={17} />
          </Link>
        </div>
      ) : (
        <form
          className="stack"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            action.execute(async () =>
              setToken(await run("requestReset", { email })),
            );
          }}
        >
          <p className="muted">
            Enter your email address. The response is the same whether or not an
            account exists.
          </p>
          <FormAlert error={action.error} />
          <Field label="Email address" required error={action.fields.email}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </Field>
          <Button type="submit" busy={action.busy}>
            Request reset link
          </Button>
        </form>
      )}
    </Modal>
  );
}
export function ResetPassword({ query }) {
  const { run, signOut, flash } = useApp();
  const [password, setPassword] = useState(""),
    [confirm, setConfirm] = useState(""),
    [resend, setResend] = useState(false),
    action = useAction();
  return (
    <AuthLayout eyebrow="LET’S GET YOU BACK IN" title="Choose a new password.">
      <form
        className="stack"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          action.execute(async () => {
            await run("resetPassword", {
              token: query.get("token"),
              password,
              confirm,
            });
            signOut();
            flash("Password reset. Sign in with your new password.");
            navigate("/signin");
          });
        }}
      >
        <FormAlert error={action.error} />
        <Field
          label="New password"
          required
          hint="At least 12 characters"
          error={action.fields.password}
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
          error={action.fields.confirm}
        >
          <input
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </Field>
        <Button type="submit" busy={action.busy}>
          Save new password
        </Button>
        <button
          type="button"
          className="text-button"
          onClick={() => setResend(true)}
        >
          Link expired? Request another
        </button>
      </form>
      {resend && <RecoveryDialog onClose={() => setResend(false)} />}
    </AuthLayout>
  );
}

// ======================================================
// File Name : auth.ts
// Purpose   : Defines HTTP route handlers for auth
// ======================================================

import { Router } from 'express';
import { createUser, emailTaken, markInactive, verifyLogin } from '../db/repo.js';

// ======================================================
// START: Route Handlers
// ======================================================

// In-memory feed for the notification bell on the header (Administrators
// only — see Header.jsx): recent sign-ins AND new self-registration
// requests waiting on approval, newest first. Prototype-only: resets
// when the server restarts, same as the rest of this app's in-memory
// caches. Capped so it can't grow unbounded.
const FEED_LIMIT = 30;
type FeedEvent = { id: string; name: string; email: string; role: string; at: string; type: 'login' | 'registration' };
let notificationFeed: FeedEvent[] = [];
function pushEvent(event: FeedEvent) {
  notificationFeed.unshift(event);
  if (notificationFeed.length > FEED_LIMIT) notificationFeed = notificationFeed.slice(0, FEED_LIMIT);
}

export const authRouter = Router();

// ======================================================
// Function : POST /login
// Purpose  : Check email + password against the stored user row. This
//            is what ProtectedRoute now actually gates access behind —
//            there's no more "any password works" client-side mock.
// Input    : req.body { email, password }
// Output   : res (HTTP response, JSON) — the signed-in user (no password),
//            or 401 with { error }
// ======================================================

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }
  const user = await verifyLogin(String(email), String(password));
  if (user === 'PENDING') {
    res.status(403).json({ error: 'Your account is awaiting admin approval. Try again once an admin has approved it.' });
    return;
  }
  if (!user) {
    res.status(401).json({ error: 'Incorrect email or password.' });
    return;
  }
  pushEvent({
    id: String(user.id),
    name: String(user.name),
    email: String(user.email),
    role: String(user.role),
    at: new Date().toISOString(),
    type: 'login'
  });
  res.json(user);
});

// ======================================================
// END: POST /login
// ======================================================

// ======================================================
// Function : POST /logout
// Purpose  : Flip the signed-out user's status to "Inactive", mirroring
//            how a successful /login flips it to "Active". Best-effort:
//            the client clears its own session either way, so a missing
//            id just returns { ok: true } with no row changed.
// Input    : req.body { id }
// Output   : res (HTTP response, JSON) — { ok: true }
// ======================================================

authRouter.post('/logout', async (req, res) => {
  const { id } = req.body ?? {};
  if (id) {
    await markInactive(String(id));
  }
  res.json({ ok: true });
});

// ======================================================
// END: POST /logout
// ======================================================

// ======================================================
// Function : POST /register
// Purpose  : Public self-registration from the Login page. Creates the
//            user with status "Pending" and no menu access — they can't
//            log in yet (see verifyLogin's PENDING check above). An
//            Administrator sees a notification, opens User Management,
//            assigns a role / Page Access via the existing Edit User
//            modal and saves, which flips status to "Active". From then
//            on this email + password signs them in normally.
// Input    : req.body { name, email, password }
// Output   : res (HTTP response, JSON) — { ok: true } on success
// ======================================================

authRouter.post('/register', async (req, res) => {
  const { name, email, password } = req.body ?? {};
  if (!name || !String(name).trim() || !email || !String(email).trim() || !password) {
    res.status(400).json({ error: 'Name, email and password are required.' });
    return;
  }
  const cleanEmail = String(email).trim();
  if (await emailTaken(cleanEmail)) {
    res.status(409).json({ error: 'An account with that email already exists.' });
    return;
  }
  const user = {
    id: 'u' + Date.now().toString(36),
    name: String(name).trim(),
    email: cleanEmail,
    role: 'Read-Only',
    lastActive: 'Never',
    status: 'Pending',
    password: String(password),
    menuAccess: {}
  };
  await createUser(user);
  pushEvent({ id: user.id, name: user.name, email: user.email, role: user.role, at: new Date().toISOString(), type: 'registration' });
  res.status(201).json({ ok: true });
});

// ======================================================
// END: POST /register
// ======================================================

// ======================================================
// Function : GET /notifications
// Purpose  : Combined sign-in / registration-request feed for the
//            header notification bell. Not filtered server-side by who's
//            asking (this prototype has no session/auth token to check)
//            — the client only shows the bell to Administrators (see
//            Header.jsx).
// Output   : res (HTTP response, JSON) — array, newest first
// ======================================================

authRouter.get('/notifications', (_req, res) => {
  res.json(notificationFeed);
});

// ======================================================
// END: GET /notifications
// ======================================================

// ======================================================
// END: Route Handlers
// ======================================================

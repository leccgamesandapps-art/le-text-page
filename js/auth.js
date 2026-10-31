// Auth with basic password hashing (demo-level security improvement)

const AUTH_KEY = "le_text_user";
const USERS_KEY = "le_text_users";

// Simple hash for demo (not crypto-secure production, but better than plain text)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "le_text_salt_v1");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

function getCurrentUser() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setCurrentUser(user) {
  if (user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_KEY);
  }
}

function getUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

async function register(username, password) {
  const users = getUsers();
  const clean = username.trim().toLowerCase();

  if (!clean || clean.length < 3) {
    return { ok: false, error: "Username must be at least 3 characters" };
  }
  if (!/^[a-z0-9_]+$/.test(clean)) {
    return { ok: false, error: "Username can only contain letters, numbers and underscore" };
  }
  if (password.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters" };
  }
  if (users.some(u => u.username === clean)) {
    return { ok: false, error: "Username already taken" };
  }

  const passwordHash = await hashPassword(password);
  const user = {
    userId: "u_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8),
    username: clean,
    passwordHash,
    createdAt: new Date().toISOString()
  };
  users.push(user);
  saveUsers(users);
  setCurrentUser({ userId: user.userId, username: user.username });
  return { ok: true, user };
}

async function login(username, password) {
  const users = getUsers();
  const clean = username.trim().toLowerCase();
  const passwordHash = await hashPassword(password);

  // Support both old plain-text and new hashed users
  const found = users.find(u => {
    if (u.username !== clean) return false;
    if (u.passwordHash) return u.passwordHash === passwordHash;
    if (u.password) return u.password === password; // legacy
    return false;
  });

  if (!found) {
    return { ok: false, error: "Invalid username or password" };
  }

  // Upgrade legacy user to hashed if needed
  if (found.password && !found.passwordHash) {
    found.passwordHash = passwordHash;
    delete found.password;
    saveUsers(users);
  }

  setCurrentUser({ userId: found.userId, username: found.username });
  return { ok: true, user: found };
}

function logout() {
  setCurrentUser(null);
}

function requireAuth(redirectTo = "/start") {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = redirectTo;
    return null;
  }
  return user;
}

function redirectIfLoggedIn(target = "/dashboard") {
  if (getCurrentUser()) {
    window.location.href = target;
  }
}

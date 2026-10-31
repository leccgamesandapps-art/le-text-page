// Simple auth using localStorage (demo). Replace with real backend later.

const AUTH_KEY = "le_text_user";
const USERS_KEY = "le_text_users";

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

function register(username, password) {
  const users = getUsers();
  const clean = username.trim().toLowerCase();
  if (!clean || clean.length < 3) {
    return { ok: false, error: "Username must be at least 3 characters" };
  }
  if (password.length < 4) {
    return { ok: false, error: "Password must be at least 4 characters" };
  }
  if (users.some(u => u.username === clean)) {
    return { ok: false, error: "Username already taken" };
  }
  const user = {
    userId: "u_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8),
    username: clean,
    password: password,
    createdAt: new Date().toISOString()
  };
  users.push(user);
  saveUsers(users);
  setCurrentUser({ userId: user.userId, username: user.username });
  return { ok: true, user };
}

function login(username, password) {
  const users = getUsers();
  const clean = username.trim().toLowerCase();
  const found = users.find(u => u.username === clean && u.password === password);
  if (!found) {
    return { ok: false, error: "Invalid username or password" };
  }
  setCurrentUser({ userId: found.userId, username: found.username });
  return { ok: true, user: found };
}

function logout() {
  setCurrentUser(null);
}

function requireAuth(redirectTo = "start.html") {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = redirectTo;
    return null;
  }
  return user;
}

function redirectIfLoggedIn(target = "dashboard.html") {
  if (getCurrentUser()) {
    window.location.href = target;
  }
}

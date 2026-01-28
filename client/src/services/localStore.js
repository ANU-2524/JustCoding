const STORAGE_KEY = "justcoding:v1";

const defaultState = {
  profile: {
    displayName: "Guest",
    bio: "",
    photoURL: "",
    githubUrl: "",
    linkedinUrl: "",
  },
  snippets: [],
  sessions: [],
  stats: {
    runs: 0,
    visualizes: 0,
    aiExplains: 0,
    aiDebugs: 0,
    snippetsCreated: 0,
    sessionsJoined: 0,
    lastActiveAt: null,
  },
};

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function getNowIso() {
  return new Date().toISOString();
}

function makeId(prefix = "id") {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  const parsed = raw ? safeParse(raw) : null;

  if (!parsed || typeof parsed !== "object") {
    return structuredClone ? structuredClone(defaultState) : JSON.parse(JSON.stringify(defaultState));
  }

  return {
    ...defaultState,
    ...parsed,
    profile: { ...defaultState.profile, ...(parsed.profile || {}) },
    stats: { ...defaultState.stats, ...(parsed.stats || {}) },
    snippets: Array.isArray(parsed.snippets) ? parsed.snippets : [],
    sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
  };
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function touchLastActive() {
  const state = loadState();
  state.stats.lastActiveAt = getNowIso();
  saveState(state);
}

export function getProfileLocal() {
  return loadState().profile;
}

export function updateProfileLocal(partial) {
  const state = loadState();
  state.profile = { ...state.profile, ...partial };
  state.stats.lastActiveAt = getNowIso();
  saveState(state);
  return state.profile;
}

export function listSnippets() {
  const state = loadState();
  return [...state.snippets].sort((a, b) => (b.updatedAt || b.createdAt || "").localeCompare(a.updatedAt || a.createdAt || ""));
}

export function addSnippet({ title, language, code }) {
  const state = loadState();
  const now = getNowIso();
  const snippet = {
    id: makeId("snip"),
    title: String(title || "Untitled").slice(0, 120),
    language: language || "javascript",
    code: code || "",
    createdAt: now,
    updatedAt: now,
  };
  state.snippets.push(snippet);
  state.stats.snippetsCreated = (state.stats.snippetsCreated || 0) + 1;
  state.stats.lastActiveAt = now;
  saveState(state);
  return snippet;
}

export function updateSnippet(id, patch) {
  const state = loadState();
  const idx = state.snippets.findIndex((s) => s.id === id);
  if (idx < 0) {
return null;
}

  const now = getNowIso();
  state.snippets[idx] = {
    ...state.snippets[idx],
    ...patch,
    updatedAt: now,
  };
  state.stats.lastActiveAt = now;
  saveState(state);
  return state.snippets[idx];
}

export function deleteSnippet(id) {
  const state = loadState();
  const before = state.snippets.length;
  state.snippets = state.snippets.filter((s) => s.id !== id);
  if (state.snippets.length !== before) {
    state.stats.lastActiveAt = getNowIso();
    saveState(state);
    return true;
  }
  return false;
}

export function listSessions() {
  const state = loadState();
  return [...state.sessions].sort((a, b) => (b.startedAt || "").localeCompare(a.startedAt || ""));
}

export function startSession({ roomId, username }) {
  const state = loadState();
  const now = getNowIso();
  const session = {
    id: makeId("sess"),
    roomId: roomId || "",
    username: username || "",
    startedAt: now,
    endedAt: null,
  };
  state.sessions.push(session);
  state.stats.sessionsJoined = (state.stats.sessionsJoined || 0) + 1;
  state.stats.lastActiveAt = now;
  saveState(state);
  return session.id;
}

export function endSession(sessionId) {
  if (!sessionId) {
return;
}
  const state = loadState();
  const idx = state.sessions.findIndex((s) => s.id === sessionId);
  if (idx < 0) {
return;
}
  if (state.sessions[idx].endedAt) {
return;
}

  const now = getNowIso();
  state.sessions[idx] = { ...state.sessions[idx], endedAt: now };
  state.stats.lastActiveAt = now;
  saveState(state);
}

export function incrementStat(name, amount = 1) {
  const state = loadState();
  state.stats[name] = (state.stats[name] || 0) + amount;
  state.stats.lastActiveAt = getNowIso();
  saveState(state);
}

export function getStats() {
  return loadState().stats;
}

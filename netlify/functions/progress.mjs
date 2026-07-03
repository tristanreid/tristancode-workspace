// Synced from daily-learning-puzzles — edit there, then run scripts/sync-web.sh.
// Tracks each learner's spot in the /learn/ puzzle path, plus answer outcomes.
//
// Storage: Netlify Blobs (a built-in key/value store). One JSON record per token:
//   key = token (a long random id that lives in the bookmarkable ?u=<token> URL)
//   val = { version: 2, lastCompleted: <number>, updated: <iso8601>, events: [...] }
// v1 records ({ lastCompleted, updated }) are read compatibly and upgraded on
// the next write.
//
// Events are small outcome records the client logs per answer interaction
// (mcq first-try, numeric attempts, estimate hit/miss, difficulty rating).
// The weekly generator reads them to adapt difficulty; see PROPOSAL.md Part 4.
//
// GET  /api/progress?token=T            -> { lastCompleted }
// GET  /api/progress?token=T&full=1     -> the whole record (for the routine)
// POST /api/progress {token, completed} -> { lastCompleted }  (server keeps the max)
// POST /api/progress {token, set}       -> { lastCompleted }  (explicit override)
// POST /api/progress {token, event}     -> { lastCompleted }  (append an outcome event)
//
// The token is a bearer credential: anyone with it can read/write that one
// record. That's acceptable for low-stakes learning progress. Use a long
// random token.
import { getStore } from '@netlify/blobs';

const STORE = 'learn-progress';
const MAX_EVENTS = 400; // oldest events drop off; per-tag aggregation is a later phase
const MAX_EVENT_BYTES = 1024;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...CORS },
  });

// Normalize whatever is stored (v1 or v2, or nothing) into a v2 record.
async function readRecord(store, token) {
  const rec = await store.get(token, { type: 'json' });
  return {
    version: 2,
    lastCompleted: rec && typeof rec.lastCompleted === 'number' ? rec.lastCompleted : 0,
    updated: (rec && rec.updated) || null,
    events: rec && Array.isArray(rec.events) ? rec.events : [],
  };
}

export default async (req) => {
  if (req.method === 'OPTIONS') return new Response('', { status: 204, headers: CORS });

  // Strong consistency: a read always reflects the latest write. Without this,
  // Blobs defaults to eventual consistency and a GET right after a POST can
  // return a stale value for tens of seconds — wrong for live progress.
  const store = getStore({ name: STORE, consistency: 'strong' });

  if (req.method === 'GET') {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    if (!token) return json({ error: 'missing token' }, 400);
    const rec = await readRecord(store, token);
    if (url.searchParams.get('full')) return json(rec);
    return json({ lastCompleted: rec.lastCompleted });
  }

  if (req.method === 'POST') {
    let body;
    try {
      body = await req.json();
    } catch {
      return json({ error: 'invalid json body' }, 400);
    }
    const token = body && body.token;
    if (!token) return json({ error: 'missing token' }, 400);

    const rec = await readRecord(store, token);
    let changed = false;

    if (body.event !== undefined && body.event !== null) {
      if (typeof body.event !== 'object' || Array.isArray(body.event)) {
        return json({ error: 'invalid event' }, 400);
      }
      const evt = { ...body.event, ts: new Date().toISOString() };
      if (JSON.stringify(evt).length > MAX_EVENT_BYTES) {
        return json({ error: 'event too large' }, 400);
      }
      rec.events.push(evt);
      if (rec.events.length > MAX_EVENTS) rec.events = rec.events.slice(-MAX_EVENTS);
      changed = true;
    }

    if (body.set !== undefined && body.set !== null) {
      // Explicit override (the "Start from this lesson" button) — may move down.
      const s = parseInt(body.set, 10);
      if (Number.isNaN(s)) return json({ error: 'invalid set' }, 400);
      rec.lastCompleted = Math.max(0, s);
      changed = true;
    } else if (body.completed !== undefined && body.completed !== null) {
      // Normal advance ("Mark complete") — high-water mark, never regresses.
      const completed = parseInt(body.completed, 10);
      if (Number.isNaN(completed)) return json({ error: 'invalid completed' }, 400);
      rec.lastCompleted = Math.max(rec.lastCompleted, completed);
      changed = true;
    }

    if (!changed) return json({ error: 'missing completed, set, or event' }, 400);

    rec.updated = new Date().toISOString();
    await store.setJSON(token, rec);
    return json({ lastCompleted: rec.lastCompleted });
  }

  return json({ error: 'method not allowed' }, 405);
};

// Netlify Functions v2 routing: serve this function directly at /api/progress.
export const config = { path: '/api/progress' };

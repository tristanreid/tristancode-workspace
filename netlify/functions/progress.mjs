// Synced from daily-learning-puzzles — edit there, then run scripts/sync-web.sh. 
// Tracks each learner's spot in the /learn/ puzzle path.
//
// Storage: Netlify Blobs (a built-in key/value store). One JSON record per token:
//   key = token (a long random id that lives in the bookmarkable ?u=<token> URL)
//   val = { lastCompleted: <number>, updated: <iso8601> }
//
// GET  /api/progress?token=T           -> { lastCompleted }
// POST /api/progress  {token, completed}-> { lastCompleted }   (server keeps the max)
//
// The token is a bearer credential: anyone with it can read/bump that one counter.
// That's acceptable for low-stakes learning progress. Use a long random token.
import { getStore } from '@netlify/blobs';

const STORE = 'learn-progress';

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

async function readRecord(store, token) {
  const rec = await store.get(token, { type: 'json' });
  return rec && typeof rec.lastCompleted === 'number' ? rec.lastCompleted : 0;
}

export default async (req) => {
  if (req.method === 'OPTIONS') return new Response('', { status: 204, headers: CORS });

  // Strong consistency: a read always reflects the latest write. Without this,
  // Blobs defaults to eventual consistency and a GET right after a POST can
  // return a stale value for tens of seconds — wrong for live progress.
  const store = getStore({ name: STORE, consistency: 'strong' });

  if (req.method === 'GET') {
    const token = new URL(req.url).searchParams.get('token');
    if (!token) return json({ error: 'missing token' }, 400);
    return json({ lastCompleted: await readRecord(store, token) });
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

    const current = await readRecord(store, token);
    let next;
    if (body.set !== undefined && body.set !== null) {
      // Explicit override (the "Start from this lesson" button) — may move down.
      const s = parseInt(body.set, 10);
      if (Number.isNaN(s)) return json({ error: 'invalid set' }, 400);
      next = Math.max(0, s);
    } else {
      // Normal advance ("Mark complete") — high-water mark, never regresses.
      const completed = parseInt(body.completed, 10);
      if (Number.isNaN(completed)) return json({ error: 'missing completed or set' }, 400);
      next = Math.max(current, completed);
    }
    await store.setJSON(token, { lastCompleted: next, updated: new Date().toISOString() });
    return json({ lastCompleted: next });
  }

  return json({ error: 'method not allowed' }, 405);
};

// Netlify Functions v2 routing: serve this function directly at /api/progress.
export const config = { path: '/api/progress' };

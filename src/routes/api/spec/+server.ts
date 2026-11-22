// POST /api/spec  { "text": "I want a blue 70% with Demon Slayer keycaps" }
// → 200 { "spec": { "layout": "70%", "caseColor": "blue", "theme": "demon slayer" } }

import { json } from '@sveltejs/kit';
import { OPENROUTER_API_KEY, OPENROUTER_MODEL } from '$app/env/private';
import { AiError, wordsToSpec } from '../../../lib/server/ai';
import type { RequestHandler } from './$types';

const MAX_LENGTH = 500;

// Per-visitor limits so one person (or bot) can't burn through your AI credit:
// at most 6 requests a minute and 40 a day. They reset if Vercel restarts the
// server; your OpenRouter key's spending limit is the final safety net.
const LIMITS = [
	{ windowMs: 60_000, max: 6 },
	{ windowMs: 24 * 60 * 60_000, max: 40 }
];
const recent = new Map<string, number[]>();

function tooMany(ip: string): boolean {
	const now = Date.now();
	const day = LIMITS[1].windowMs;
	const times = (recent.get(ip) ?? []).filter((t) => now - t < day);
	const over = LIMITS.some(({ windowMs, max }) => times.filter((t) => now - t < windowMs).length >= max);
	if (!over) times.push(now);
	recent.set(ip, times);
	if (recent.size > 5000) recent.clear(); // keep memory small
	return over;
}

/** Only accept requests sent by this website's own pages, not by other sites or scripts. */
function fromOurSite(request: Request, url: URL): boolean {
	const origin = request.headers.get('origin');
	return origin !== null && origin === url.origin;
}

export const POST: RequestHandler = async ({ request, url, getClientAddress }) => {
	if (!fromOurSite(request, url)) {
		return json({ error: 'Requests must come from the KeyCraze website.' }, { status: 403 });
	}
	if (!OPENROUTER_API_KEY) {
		return json({ error: 'The AI is not set up yet (no OpenRouter key).' }, { status: 503 });
	}

	const body = await request.json().catch(() => null);
	const text = typeof body?.text === 'string' ? body.text.trim() : '';
	if (!text) return json({ error: 'Describe the keyboard you want first.' }, { status: 400 });
	if (text.length > MAX_LENGTH) {
		return json({ error: `Please keep it under ${MAX_LENGTH} characters.` }, { status: 400 });
	}

	if (tooMany(getClientAddress())) {
		return json(
			{ error: "You've asked a lot in a short time. Please wait a bit and try again." },
			{ status: 429 }
		);
	}

	try {
		const spec = await wordsToSpec(text, { apiKey: OPENROUTER_API_KEY, model: OPENROUTER_MODEL });
		return json({ spec });
	} catch (err) {
		if (err instanceof AiError) return json({ error: err.message }, { status: err.status });
		console.error('AI request crashed', err);
		return json({ error: 'Something went wrong talking to the AI.' }, { status: 500 });
	}
};

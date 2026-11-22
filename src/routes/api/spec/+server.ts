// POST /api/spec  { "text": "I want a blue 70% with Demon Slayer keycaps" }
// → 200 { "spec": { "layout": "70%", "caseColor": "blue", "theme": "demon slayer" } }

import { json } from '@sveltejs/kit';
import { OPENROUTER_API_KEY, OPENROUTER_MODEL } from '$app/env/private';
import { AiError, wordsToSpec } from '../../../lib/server/ai';
import type { RequestHandler } from './$types';

const MAX_LENGTH = 500;

// Simple per-visitor limit so one person can't burn through your AI credit.
// (It resets when Vercel restarts the server; your OpenRouter spending limit
// is the real safety net.)
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 10;
const recent = new Map<string, number[]>();

function tooMany(ip: string): boolean {
	const now = Date.now();
	const times = (recent.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
	times.push(now);
	recent.set(ip, times);
	return times.length > MAX_PER_WINDOW;
}

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
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
		return json({ error: 'Too many requests. Wait a minute and try again.' }, { status: 429 });
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

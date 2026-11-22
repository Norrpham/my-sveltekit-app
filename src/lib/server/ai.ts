// Server-only: talks to OpenRouter. Files in src/lib/server can never be
// imported by browser code, so the API key can't leak to visitors.

import { SPEC_JSON_SCHEMA, parseSpec } from '../spec';
import type { Spec } from '../matching';

const SYSTEM_PROMPT = `You turn a shopper's description of a dream mechanical keyboard into a search spec.
Fill only what the shopper actually said; use null (or [] for features) for everything else.
- "base", "case", "board" colors go in caseColor; keycap colors go in keycapColor.
- theme is the keycap theme: an anime, game, character or style, in lowercase (e.g. "demon slayer").
- Pick the closest allowed color word (navy -> blue, gray -> grey).
- Sizes: "60", "65", "70", "75" percent. Anything else (TKL, full size) -> null.
- budgetUsd is the total for keyboard + keycaps, in US dollars.
Never invent details the shopper didn't give.`;

export class AiError extends Error {
	constructor(
		message: string,
		public status: number
	) {
		super(message);
	}
}

interface Options {
	apiKey: string;
	model: string;
	fetch?: typeof fetch; // swappable so tests can fake the AI
}

/** Ask the AI to turn plain words into a Spec. Throws AiError on failure. */
export async function wordsToSpec(text: string, opts: Options): Promise<Spec> {
	const doFetch = opts.fetch ?? fetch;
	const res = await doFetch('https://openrouter.ai/api/v1/chat/completions', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${opts.apiKey}`,
			'Content-Type': 'application/json',
			'X-Title': 'Keyboard AI'
		},
		body: JSON.stringify({
			model: opts.model,
			messages: [
				{ role: 'system', content: SYSTEM_PROMPT },
				{ role: 'user', content: text }
			],
			response_format: {
				type: 'json_schema',
				json_schema: { name: 'keyboard_spec', strict: true, schema: SPEC_JSON_SCHEMA }
			},
			// Only use providers that actually enforce the schema.
			provider: { require_parameters: true },
			temperature: 0,
			max_tokens: 1500
		})
	});

	if (!res.ok) {
		if (res.status === 401) throw new AiError('The OpenRouter key is wrong or revoked.', 502);
		if (res.status === 402) throw new AiError('The OpenRouter account is out of credit.', 502);
		if (res.status === 429) throw new AiError('The AI is busy. Try again in a minute.', 503);
		throw new AiError(`The AI request failed (status ${res.status}).`, 502);
	}

	const data = await res.json();
	const content: unknown = data?.choices?.[0]?.message?.content;
	if (typeof content !== 'string') throw new AiError('The AI sent back an empty answer.', 502);

	let raw: unknown;
	try {
		raw = JSON.parse(content);
	} catch {
		throw new AiError("The AI's answer wasn't valid JSON.", 502);
	}
	return parseSpec(raw);
}

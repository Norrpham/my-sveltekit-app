// Run with: npm test   (no AI credit used: the AI is faked here)
import { describe, expect, it, vi } from 'vitest';
import { parseSpec } from './spec';
import { AiError, wordsToSpec } from './server/ai';

describe('parseSpec', () => {
	it('keeps good values', () => {
		expect(
			parseSpec({
				layout: '70%',
				caseColor: 'blue',
				theme: ' Demon Slayer ',
				keycapColor: null,
				budgetUsd: 149.6,
				wireless: true,
				features: ['knob', 'knob']
			})
		).toEqual({
			layout: '70%',
			caseColor: 'blue',
			theme: 'demon slayer',
			budgetUsd: 150,
			wireless: true,
			features: ['knob']
		});
	});

	it('drops anything strange the AI might send', () => {
		expect(
			parseSpec({
				layout: 'TKL',
				caseColor: 'rainbow',
				theme: '',
				budgetUsd: -5,
				wireless: 'yes',
				features: ['laser'],
				hack: 'ignore me'
			})
		).toEqual({});
		expect(parseSpec(null)).toEqual({});
		expect(parseSpec('nonsense')).toEqual({});
	});

	it('maps color words like navy to a color family', () => {
		expect(parseSpec({ caseColor: 'navy' }).caseColor).toBe('blue');
	});
});

/** A fake fetch that answers like OpenRouter would. */
function fakeAi(content: string, status = 200) {
	return vi.fn(async () =>
		new Response(JSON.stringify({ choices: [{ message: { content } }] }), { status })
	) as unknown as typeof fetch;
}

describe('wordsToSpec', () => {
	const opts = { apiKey: 'test-key', model: 'test/model' };

	it("turns the AI's JSON answer into a spec", async () => {
		const fetch = fakeAi(
			JSON.stringify({
				layout: '70%',
				caseColor: 'blue',
				theme: 'demon slayer',
				keycapColor: null,
				budgetUsd: null,
				wireless: null,
				features: []
			})
		);
		const spec = await wordsToSpec('demon slayer keycaps, blue 70% base', { ...opts, fetch });
		expect(spec).toEqual({ layout: '70%', caseColor: 'blue', theme: 'demon slayer' });
	});

	it('sends the schema and the key to OpenRouter', async () => {
		const fetch = fakeAi('{}');
		await wordsToSpec('anything', { ...opts, fetch });
		const [url, init] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
		expect(url).toBe('https://openrouter.ai/api/v1/chat/completions');
		expect(init.headers.Authorization).toBe('Bearer test-key');
		const body = JSON.parse(init.body);
		expect(body.model).toBe('test/model');
		expect(body.response_format.type).toBe('json_schema');
		expect(body.provider.require_parameters).toBe(true);
	});

	it('gives a clear error when credit runs out', async () => {
		await expect(wordsToSpec('x', { ...opts, fetch: fakeAi('', 402) })).rejects.toThrow(
			'out of credit'
		);
	});

	it('gives a clear error when the answer is not JSON', async () => {
		await expect(wordsToSpec('x', { ...opts, fetch: fakeAi('sure! here you go') })).rejects.toBeInstanceOf(
			AiError
		);
	});
});

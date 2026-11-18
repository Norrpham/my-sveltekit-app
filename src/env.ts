// Settings read from the environment (a .env file locally, the Vercel
// dashboard in production). Private ones never reach the browser.
import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	// Your OpenRouter key. Leave unset and the AI box shows a "not set up" message.
	OPENROUTER_API_KEY: {
		schema: (value) => value ?? ''
	},
	// Which model turns words into a spec. Change it without touching code.
	OPENROUTER_MODEL: {
		schema: (value) => value || 'openai/gpt-oss-20b'
	}
});

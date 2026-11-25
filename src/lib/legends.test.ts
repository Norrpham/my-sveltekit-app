import { describe, expect, it } from 'vitest';
import { legendFor } from './legends';

describe('legends', () => {
	it('number keys show the shifted symbol above', () => {
		expect(legendFor('1')).toEqual({ main: '1', shift: '!', kana: undefined });
		expect(legendFor('/')).toMatchObject({ main: '/', shift: '?' });
	});
	it('modifiers use words, icons, or both', () => {
		expect(legendFor('Back').main).toBe('Backspace');
		expect(legendFor('Back', { position: 'top', mods: 'icons' }).main).toBe('⟵');
		expect(legendFor('Shift', { position: 'top', mods: 'icons+words' }).main).toBe('⇧ Shift');
	});
	it('kana only appear when the set has them', () => {
		expect(legendFor('Q').kana).toBeUndefined();
		expect(legendFor('Q', { position: 'top', mods: 'words', kana: true }).kana).toBe('た');
	});
});

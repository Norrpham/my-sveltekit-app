// "Recipes" for the detailed 3D boards: how big the case is, where the keys
// sit in it, and which case shape to draw. All sizes are in millimetres.
//
// Where the numbers come from:
// - Mode Sonnet / Encore (2026): key positions and plate size from Mode's
//   plate CAD files (CERN-OHL-P-2.0); case size, heights and typing angle from
//   Mode's product pages; case shape traced from Mode's official drawings (CC BY 4.0).
// - Bakeneko65: the case is kkatano's own 3D file (MIT), converted to a small
//   web model (static/models/bakeneko65-case.glb).

export type CaseKind = 'sonnet' | 'encore' | 'glb';

export interface BoardRecipe {
	caseKind: CaseKind;
	/** Outside size of the case. */
	width: number;
	depth: number;
	/** Height at the front and back edge (sitting on a desk). */
	frontHeight: number;
	backHeight: number;
	/** Gap from the front edge of the case to the front edge of the keys. */
	frontBezel: number;
	/** How far the bottom of the keycaps sits above the case rim. */
	keysAboveRim: number;
	/** Plate color seen between the keys. */
	plateColor: string;
	/** Only for caseKind 'glb'. */
	glbUrl?: string;
	/** Tilt baked out of the 3D file (the file is drawn with a flat top). */
	glbTiltDeg?: number;
}

export const boardRecipes: Record<string, BoardRecipe> = {
	'mode-sonnet-2026': {
		caseKind: 'sonnet',
		width: 315,
		depth: 143,
		frontHeight: 19,
		backHeight: 24,
		frontBezel: 6,
		keysAboveRim: 1.2,
		plateColor: '#2a2a2c'
	},
	'mode-encore-2026': {
		caseKind: 'encore',
		width: 326,
		depth: 125,
		frontHeight: 12.5,
		backHeight: 24.5,
		frontBezel: 12,
		keysAboveRim: 1.5,
		plateColor: '#2b2b2b'
	},
	bakeneko65: {
		caseKind: 'glb',
		width: 314.75,
		depth: 110.2,
		frontHeight: 18.5,
		backHeight: 30,
		// Pocket is 96.5 mm deep and the keys 95.25 mm, so the keys sit centred.
		frontBezel: 7.5,
		keysAboveRim: 1.6,
		plateColor: '#232323', // FR4 plate in the kit
		glbUrl: '/models/bakeneko65-case.glb',
		glbTiltDeg: 6
	}
};

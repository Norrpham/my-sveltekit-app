// Site-wide settings in one place. Change text, links or photos here.

export const site = {
	name: 'KeyCraze',
	tagline: 'Your Source for Custom Keyboards',
	email: 'nhat.huyy245@gmail.com',
	// Paste your profile links here; empty ones are hidden.
	instagram: '',
	discord: '',
	// Photos: put image files in static/images/ and write their names here,
	// e.g. hero: '/images/hero.jpg'. Empty ones show a dark gradient instead.
	photos: {
		hero: '',
		about: '',
		why: '',
		faq: '',
		collection: ['', '', '']
	}
};

/** CSS background for a photo slot: the photo under a dark tint, or a plain gradient. */
export function photoBg(url: string, tint = 0.55): string {
	const shade = `linear-gradient(rgba(8, 12, 24, ${tint}), rgba(8, 12, 24, ${tint + 0.2}))`;
	return url
		? `${shade}, url('${url}') center / cover no-repeat`
		: `${shade}, radial-gradient(circle at 70% 30%, #2b3a63, #0b1120 70%)`;
}

// One place that loads the product data and offers small helpers.
// Every page imports from here instead of reading the JSON directly.
import keyboardData from './data/keyboards.json';
import keycapData from './data/keycaps.json';
import type { Availability, Keyboard, Keycap } from './types';

export const keyboards = keyboardData as Keyboard[];
export const keycaps = keycapData as Keycap[];

// Once you join an affiliate program, fill in affiliateUrl in the JSON
// and every "Buy" button switches to it automatically.
export function buyLink(product: { storeUrl: string; affiliateUrl: string }): string {
	return product.affiliateUrl || product.storeUrl;
}

export function formatPrice(usd: number | null): string {
	return usd === null ? 'Price unknown' : `$${usd.toFixed(2)}`;
}

export const availabilityLabel: Record<Availability, string> = {
	in_stock: 'In stock',
	'pre-order': 'Pre-order',
	backordered: 'Backordered',
	sold_out: 'Sold out',
	varies: 'Varies by option',
	unknown: 'Check store'
};

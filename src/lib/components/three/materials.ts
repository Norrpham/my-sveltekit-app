// How each case material looks. Used with <T.MeshPhysicalMaterial {...props} />.
import type { Variant } from '../../types';
import { woodTexture } from './textures';

export function metalLook(color: string, finish: Variant['finish'] = 'matte') {
	if (finish === 'pearl')
		return { color, metalness: 0.15, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.08 };
	if (finish === 'glitter')
		return { color, metalness: 0.75, roughness: 0.3, clearcoat: 0.4, clearcoatRoughness: 0.25 };
	// Media-blasted, anodized or coated aluminum: soft satin, keeps its color.
	return { color, metalness: 0.35, roughness: 0.5 };
}

export function woodLook(color: string) {
	return { color: '#ffffff', map: woodTexture(color), metalness: 0, roughness: 0.72 };
}

export function polishedLook(color: string) {
	return { color, metalness: 0.9, roughness: 0.18 };
}

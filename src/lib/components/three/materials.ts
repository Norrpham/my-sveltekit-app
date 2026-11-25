// How each case material looks. Used with <T.MeshPhysicalMaterial {...props} />.
import type { Variant } from '../../types';
import { grainTexture } from './surfaces';
import { woodTexture } from './textures';

export function metalLook(color: string, finish: Variant['finish'] = 'anodized') {
	if (finish === 'pearl')
		return { color, metalness: 0.1, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.06 };
	if (finish === 'glitter')
		// Coat with metal flakes: rough base, sparkly bumps, some metal shine.
		return { color, metalness: 0.5, roughness: 0.42, bumpMap: grainTexture(256, 150, 8), bumpScale: 0.5, clearcoat: 0.5, clearcoatRoughness: 0.2 };
	if (finish === 'coated')
		// Powder coat ("NG" at CannonKeys): flat color with a light texture.
		return { color, metalness: 0.05, roughness: 0.68, bumpMap: grainTexture(256, 60, 6), bumpScale: 0.35 };
	// Media-blasted and anodized aluminum: soft satin metal that keeps its color.
	return { color, metalness: 0.35, roughness: 0.5 };
}

export function woodLook(color: string) {
	return { color: '#ffffff', map: woodTexture(color), metalness: 0, roughness: 0.72 };
}

export function polishedLook(color: string) {
	return { color, metalness: 0.9, roughness: 0.18 };
}

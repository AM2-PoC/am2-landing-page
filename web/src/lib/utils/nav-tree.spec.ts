import { describe, expect, it } from 'vitest';
import { buildNavTree } from './nav-tree.ts';

describe('buildNavTree', () => {
	it('nests children under their parent and sorts them', () => {
		const tree = buildNavTree([
			{ id: 1, parentId: null, sortOrder: 20, label: 'Ecosystems', path: null },
			{ id: 2, parentId: 1, sortOrder: 10, label: 'Platforms', path: null },
			{ id: 3, parentId: 2, sortOrder: 10, label: 'AM² PTT', path: '/platforms/am2-ptt' },
			{ id: 4, parentId: null, sortOrder: 10, label: 'Home', path: '/' }
		]);
		expect(tree.map((i) => i.label)).toEqual(['Home', 'Ecosystems']);
		expect(tree[1].children[0].children[0].path).toBe('/platforms/am2-ptt');
	});

	it('hides groups that have no link and no children', () => {
		const tree = buildNavTree([
			{ id: 1, parentId: null, sortOrder: 10, label: 'Empty', path: null }
		]);
		expect(tree).toEqual([]);
	});
});

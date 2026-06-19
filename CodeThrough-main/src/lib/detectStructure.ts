import type { StructureType } from '../types';

function isTreeNode(val: unknown): boolean {
  if (typeof val !== 'object' || val === null) return false;
  const obj = val as Record<string, unknown>;
  return 'val' in obj && ('left' in obj || 'right' in obj);
}

function isLinkedListNode(val: unknown): boolean {
  if (typeof val !== 'object' || val === null) return false;
  const obj = val as Record<string, unknown>;
  return 'val' in obj && 'next' in obj && !('left' in obj) && !('right' in obj);
}

function isMatrix(val: unknown): boolean {
  if (!Array.isArray(val)) return false;
  if (val.length === 0) return false;
  return val.every((row) => Array.isArray(row));
}

export function detectStructure(val: unknown): StructureType {
  if (val === null || val === undefined) return 'scalar';

  if (Array.isArray(val)) {
    if (isMatrix(val)) return 'matrix';
    return 'array';
  }

  if (typeof val === 'object') {
    if (isTreeNode(val)) return 'tree';
    if (isLinkedListNode(val)) return 'linkedList';
    return 'object';
  }

  return 'scalar';
}

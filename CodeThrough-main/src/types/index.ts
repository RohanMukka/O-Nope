export interface Snapshot {
  line: number;
  variables: Record<string, unknown>;
  consoleLogs?: string[];
  callStackDepth?: number;
}

export interface TraceResult {
  snapshots: Snapshot[];
  consoleLogs: string[];
  error?: string;
}

export interface VariableNodeData {
  name: string;
  value: string;
  isChanged: boolean;
}

export interface ArrayNodeData {
  name: string;
  values: unknown[];
  pointers: Record<string, number>;
  isChanged: boolean;
}

export interface TreeNodeData {
  name: string;
  tree: TreeValue;
  isChanged: boolean;
}

export interface LinkedListNodeData {
  name: string;
  list: LinkedListValue;
  isChanged: boolean;
}

export interface MatrixNodeData {
  name: string;
  matrix: unknown[][];
  isChanged: boolean;
}

export interface StackQueueNodeData {
  name: string;
  values: unknown[];
  isChanged: boolean;
}

export interface ObjectNodeData {
  name: string;
  entries: [string, unknown][];
  isChanged: boolean;
}

export interface TreeValue {
  val: unknown;
  left: TreeValue | null;
  right: TreeValue | null;
}

export interface LinkedListValue {
  val: unknown;
  next: LinkedListValue | null;
}

export type StructureType =
  | 'scalar'
  | 'array'
  | 'matrix'
  | 'tree'
  | 'linkedList'
  | 'stackQueue'
  | 'object';

export interface DetectedStructure {
  type: StructureType;
  value: unknown;
}

export interface AlgorithmTemplate {
  name: string;
  category: string;
  code: string;
  description: string;
}

export type PlaybackSpeed = 0.25 | 0.5 | 1 | 2 | 4;

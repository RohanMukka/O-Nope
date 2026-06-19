import * as acorn from 'acorn';
import { walk } from 'estree-walker';
import { generate, GENERATOR } from 'astring';
import type { Snapshot, TraceResult } from '../types';

const MAX_SNAPSHOTS = 10000;
const MAX_EXECUTION_MS = 5000;

interface TreeNode {
  val: unknown;
  left: TreeNode | null;
  right: TreeNode | null;
}

function deserializeBinaryTree(arr: (number | null)[]): TreeNode | null {
  if (!arr || !arr.length || arr[0] === null) return null;
  const root: TreeNode = { val: arr[0], left: null, right: null };
  const queue: TreeNode[] = [root];
  let i = 1;
  while (i < arr.length) {
    const curr = queue.shift();
    if (!curr) break;
    if (arr[i] !== null && arr[i] !== undefined) {
      curr.left = { val: arr[i], left: null, right: null };
      queue.push(curr.left);
    }
    i++;
    if (i < arr.length && arr[i] !== null && arr[i] !== undefined) {
      curr.right = { val: arr[i], left: null, right: null };
      queue.push(curr.right);
    }
    i++;
  }
  return root;
}

function safeDeepClone(obj: unknown, seen = new WeakSet()): unknown {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;

  const o = obj as object;
  if (seen.has(o)) return '[Circular]';
  seen.add(o);

  if (Array.isArray(o)) {
    return o.map((item) => safeDeepClone(item, seen));
  }

  const result: Record<string, unknown> = {};
  for (const key of Object.keys(o)) {
    result[key] = safeDeepClone((o as Record<string, unknown>)[key], seen);
  }
  return result;
}

export function traceCode(code: string): TraceResult {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ast = acorn.parse(code, { ecmaVersion: 2024, locations: true }) as any;

  const variableNames = new Set<string>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  walk(ast, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    enter(node: any) {
      if (node.type === 'VariableDeclarator' && node.id?.type === 'Identifier') {
        variableNames.add(node.id.name);
      }
      if (node.type === 'FunctionDeclaration') {
        if (node.id?.type === 'Identifier') variableNames.add(node.id.name);
        for (const param of node.params || []) {
          if (param.type === 'Identifier') variableNames.add(param.name);
        }
      }
      if (node.type === 'AssignmentExpression' && node.left?.type === 'Identifier') {
        variableNames.add(node.left.name);
      }
    },
  });

  const varsList = Array.from(variableNames);
  const getVarsCode =
    '{' +
    varsList.map((v) => `"${v}": typeof ${v} !== "undefined" ? ${v} : undefined`).join(', ') +
    '}';

  const traceCall = (line: string) => `__tracer__(${line}, ${getVarsCode});\n`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const customGenerator = Object.assign({}, GENERATOR, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ExpressionStatement(node: any, state: any) {
      GENERATOR.ExpressionStatement(node, state);
      state.write(traceCall(node.loc.start.line));
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    VariableDeclaration(node: any, state: any) {
      GENERATOR.VariableDeclaration(node, state);
      state.write(traceCall(node.loc.start.line));
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ReturnStatement(node: any, state: any) {
      state.write(traceCall(node.loc.start.line));
      GENERATOR.ReturnStatement(node, state);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ForStatement(node: any, state: any) {
      state.write(traceCall(node.loc.start.line));
      GENERATOR.ForStatement(node, state);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    WhileStatement(node: any, state: any) {
      state.write(traceCall(node.loc.start.line));
      GENERATOR.WhileStatement(node, state);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    DoWhileStatement(node: any, state: any) {
      state.write(traceCall(node.loc.start.line));
      GENERATOR.DoWhileStatement(node, state);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    IfStatement(node: any, state: any) {
      state.write(traceCall(node.loc.start.line));
      GENERATOR.IfStatement(node, state);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ForOfStatement(node: any, state: any) {
      state.write(traceCall(node.loc.start.line));
      GENERATOR.ForOfStatement(node, state);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ForInStatement(node: any, state: any) {
      state.write(traceCall(node.loc.start.line));
      GENERATOR.ForInStatement(node, state);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SwitchStatement(node: any, state: any) {
      state.write(traceCall(node.loc.start.line));
      GENERATOR.SwitchStatement(node, state);
    },
  });

  const instrumentedCode = generate(ast, { generator: customGenerator });

  const snapshots: Snapshot[] = [];
  const consoleLogs: string[] = [];
  let error: string | undefined;

  try {
    const startTime = Date.now();

    const sandboxConsole = {
      log: (...args: unknown[]) => {
        consoleLogs.push(
          args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')
        );
      },
    };

    const sandboxFn = new Function(
      '__tracer__',
      '__timeout_check__',
      'deserializeBinaryTree',
      'console',
      instrumentedCode
    );

    sandboxFn(
      (line: number, vars: Record<string, unknown>) => {
        if (snapshots.length >= MAX_SNAPSHOTS) {
          throw new Error(`Execution limit: exceeded ${MAX_SNAPSHOTS} snapshots`);
        }
        if (Date.now() - startTime > MAX_EXECUTION_MS) {
          throw new Error(`Execution timeout: exceeded ${MAX_EXECUTION_MS / 1000}s`);
        }
        snapshots.push({
          line,
          variables: safeDeepClone(vars) as Record<string, unknown>,
        });
      },
      () => {
        if (Date.now() - startTime > MAX_EXECUTION_MS) {
          throw new Error(`Execution timeout: exceeded ${MAX_EXECUTION_MS / 1000}s`);
        }
      },
      deserializeBinaryTree,
      sandboxConsole
    );
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  return { snapshots, consoleLogs, error };
}

# CodeThrough

**Step through your algorithms. See every variable change.**

CodeThrough is an interactive algorithm visualizer that lets you write JavaScript code, execute it step-by-step, and watch data structures transform in real time. Built for students, educators, and developers who want to deeply understand how algorithms work.

## Features

- **Step-by-Step Execution** -- Write any JavaScript algorithm and trace through it line by line. Every variable mutation is captured and visualized.

- **Auto-Detected Data Structure Visualization** -- CodeThrough automatically detects your data structures and renders them appropriately:
  - **Arrays** with index labels and pointer overlays
  - **Binary Trees** (objects with `val`/`left`/`right`) as hierarchical node graphs
  - **Linked Lists** (objects with `val`/`next`) as horizontal chains with arrows
  - **2D Matrices** as grid tables
  - **Objects** as key-value pair tables
  - **Scalars** as labeled value cards

- **14 Built-in Algorithm Templates** -- Pre-loaded examples organized by category: sorting, searching, trees, linked lists, dynamic programming, and stacks.

- **Playback Controls** -- Play/pause, step forward/backward, drag-to-seek timeline, and speed control (0.25x to 4x).

- **Console Output Capture** -- All `console.log` calls are intercepted and displayed in a collapsible console panel.

- **Variable Watch Panel** -- A live table showing all variables, their types, and current values. Changed variables are highlighted.

- **Keyboard Shortcuts** -- `Cmd/Ctrl+Enter` to run, `Space` to play/pause, `Left/Right` arrows to step.

- **Inline Error Display** -- Parse and runtime errors shown inline, not as browser alerts.

- **Welcome Screen** -- Clean landing state with feature overview and keyboard shortcut reference.

- **Execution Safety** -- Max 10,000 snapshots and 5-second timeout to prevent infinite loops from freezing the browser.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS 3.4 |
| Code Editor | CodeMirror 6 (`@uiw/react-codemirror`) |
| Visualization | React Flow (`@xyflow/react`) |
| Animation | Framer Motion |
| AST Parsing | Acorn + Astring + estree-walker |
| Icons | Lucide React |

## Architecture

```
src/
  App.tsx                    # Root component, keyboard shortcuts, layout
  main.tsx                   # React entry point
  index.css                  # Global styles, scrollbar, CodeMirror theme

  components/
    Navbar.tsx               # Top bar with logo, templates dropdown, run button
    CodeEditor.tsx           # CodeMirror editor with active line highlighting
    VisualizationPanel.tsx   # ReactFlow canvas with auto-detected node types
    Timeline.tsx             # Playback controls, speed selector, step counter
    WelcomeScreen.tsx        # Landing state shown before first run
    ConsolePanel.tsx         # Captured console.log output display
    VariableWatch.tsx        # Live variable table with change detection
    ErrorDisplay.tsx         # Inline error banner

    nodes/
      VariableNode.tsx       # Scalar value display
      ArrayNode.tsx          # Array with indices and pointer overlays
      TreeNode.tsx           # Binary tree SVG with edges
      LinkedListNode.tsx     # Horizontal linked list chain
      MatrixNode.tsx         # 2D grid table
      StackQueueNode.tsx     # Vertical stack visualization
      ObjectNode.tsx         # Key-value pair table

  hooks/
    useTracer.ts             # Manages tracing state (run, reset, error)
    usePlayback.ts           # Playback controls (play, pause, step, speed)

  lib/
    tracer.ts                # AST instrumentation engine + sandbox executor
    detectStructure.ts       # Auto-detect data structure type from shape

  types/
    index.ts                 # All TypeScript interfaces

  constants/
    templates.ts             # 12 algorithm template definitions
```

## Getting Started

```bash
# Clone the repository
git clone https://github.com/RohanMukka/CodeThrough.git
cd CodeThrough

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## How the Tracer Works

1. **Parse** -- Your JavaScript code is parsed into an AST using [Acorn](https://github.com/acornjs/acorn).

2. **Discover Variables** -- The AST is walked to find all variable declarations, function parameters, and assignment targets.

3. **Instrument** -- A custom [Astring](https://github.com/nicolo-ribaudo/astring) generator injects `__tracer__(line, variables)` calls after every statement type (variable declarations, expressions, loops, conditionals, returns).

4. **Execute** -- The instrumented code runs in a sandboxed `new Function()` with:
   - A tracer callback that deep-clones all variables into snapshots
   - An intercepted `console` object that captures log output
   - A `deserializeBinaryTree` helper for LeetCode-style tree inputs
   - Safety limits (10,000 snapshots max, 5-second timeout)

5. **Visualize** -- The snapshot array is played back through React Flow. Each variable is auto-detected (array, tree, linked list, matrix, object, or scalar) and rendered with the appropriate custom node component.

## Algorithm Templates

| Category | Algorithms |
|----------|-----------|
| Sorting | Bubble Sort, Insertion Sort, Quick Sort, Merge Sort, Selection Sort |
| Searching | Binary Search, Linear Search, Two Sum |
| Trees | BFS Traversal, DFS (Inorder) Traversal |
| Linked List | Reverse Linked List |
| Dynamic Programming | Fibonacci, Coin Change |
| Stack | Valid Parentheses |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + Enter` | Run algorithm |
| `Space` | Play / Pause |
| `Left Arrow` | Step backward |
| `Right Arrow` | Step forward |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Make your changes and ensure `npm run build` passes
4. Commit using conventional commits (`feat:`, `fix:`, `chore:`)
5. Open a pull request

## License

MIT

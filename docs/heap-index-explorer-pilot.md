# Heap Index Explorer — interactive pilot

The UI is based on the user-provided dark teaching diagram of the binary heap `[1,3,2,7,4,5,9,8,10,6]`, starting from index 1. This **implementation note is a pilot**, not a new canonical content contract.

## Preview

From `frontend/`, run `npm ci` then `npm run dev`. Open `http://localhost:5173/heap-index-explorer-preview.html`. The preview is a separate Vite HTML entry intended for local design review; it is not registered as a CSForge production route, imported into the Reader or published as canonical content.

This pilot is independent of the existing `min-heap` visualization's offer/poll mode. The existing Markdown `csforge-viz`, frontend Zod, backend validator, content keys, and user progress are unchanged.

## Behavior

- Tree nodes and array cells map by **array index**, not value.
- On select, the matching tree node and array cell share the selected state. The selected node's existing parent and children receive the related outline.
- The panel explains the selected index and calculates parent, left and right child indices, or why one is absent.
- Initial values and selection match the screenshot. Duplicate values work because selection is index-based.
- Native buttons support Tab; tree arrows navigate up/down/adjacent within a level; array arrows navigate left/right. Enter/Space select.
- The native details/summary collapses the diagram without destroying its component state.

## Design boundaries

Neutral typography, square nodes, no unnecessary cards, no animation or drag/zoom. The standalone preview can toggle light/dark; the reusable component also respects CSForge theme tokens. The same tree and array layout are intended to remain readable at desktop 1280×900 and 1440×900. Any smaller container scrolls internally without shrinking text.

## Validation

`npm run lint`, `npm test -- --run` and `npm run build` must pass. Browser QA must check the actual node/cell state changes and contrast in both themes. Do not claim that static markup tests substitute for rendered/browser QA.

A later change may integrate the component into the Reader, **only after** a separate approval to extend the versioned `csforge-viz` import contract and corresponding backend validation. No database or Content Pack changes are part of this pilot.

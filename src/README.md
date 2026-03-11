# `src/` Overview

`src/` contains the entire application implementation outside the Expo Router route shell.

- `domain/`: pure training rules and data contracts.
- `data/`: hardcoded training manifest.
- `features/`: screen-level presentation logic.
- `state/`: app state orchestration and persistence wiring.
- `storage/`: versioned local storage access.
- `ui/`: reusable UI primitives and theme tokens.

If you need to change workout order, exercise instructions, progression stages, coaching rules, or benchmark definitions, start in `data/` and only update domain code when the behavior rules change.

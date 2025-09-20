# Component Co-location Refactoring Plan

## Overview
This document outlines a comprehensive plan to refactor the component structure from a centralized `src/components/` directory to a co-located structure where components live within their relevant feature folders. This change will improve code organization, make it easier for AI tools to navigate the codebase, and create clearer ownership boundaries.

## Current Folder Structure

```
src/
├── components/                    # Centralized components directory
│   ├── common/
│   │   ├── ErrorBanner.tsx      # Generic error display
│   │   └── Footer.tsx            # App footer
│   ├── market/
│   │   └── MarketSection.tsx    # Market-specific UI
│   ├── modals/
│   │   ├── AddCardModal.tsx     # Card creation modal
│   │   ├── BulkAddCardModal.tsx # Bulk card import modal
│   │   └── CardContextMenu.tsx  # Card right-click menu
│   ├── players/
│   │   ├── AddPlayerInterface.tsx # Player creation UI
│   │   ├── DeckComposition.tsx    # Deck stats display
│   │   ├── PlayerCard.tsx         # Player card component
│   │   ├── PlayersSection.tsx     # Players container
│   │   └── zones/
│   │       └── CardZone.tsx       # Card zone component
│   ├── ui/                        # Reusable UI primitives
│   │   ├── button/
│   │   │   ├── button.tsx
│   │   │   └── index.ts
│   │   ├── input/
│   │   │   ├── input.tsx
│   │   │   └── index.ts
│   │   └── spinner/
│   │       ├── spinner.tsx
│   │       ├── Spinner.module.scss
│   │       └── index.ts
│   ├── DeckCompositionBanner.tsx  # Game-level component
│   └── GameHeader.tsx              # Game-level component
├── features/
│   ├── cards/
│   │   ├── services/              # Card business logic
│   │   ├── types/                 # Card type definitions
│   │   └── test/                  # Card tests
│   ├── game/
│   │   ├── services/              # Game business logic
│   │   ├── types/                 # Game type definitions
│   │   └── test/                  # Game tests
│   ├── market/
│   │   ├── services/              # Market business logic
│   │   ├── types/                 # Market type definitions
│   │   └── test/                  # Market tests
│   └── player/
│       ├── services/              # Player business logic
│       ├── types/                 # Player type definitions
│       └── test/                  # Player tests
├── store/                         # Zustand stores
├── routes/                        # Route configuration
├── hooks/                         # Shared hooks
├── lib/                           # Utilities
├── types/                         # Shared types
└── test/                          # Test configuration
```

## Proposed New Folder Structure

```
src/
├── features/
│   ├── cards/
│   │   ├── components/            # NEW: Card-specific components
│   │   │   ├── AddCardModal.tsx
│   │   │   ├── BulkAddCardModal.tsx
│   │   │   ├── CardContextMenu.tsx
│   │   │   └── index.ts          # Barrel export
│   │   ├── services/
│   │   ├── types/
│   │   └── test/
│   ├── game/
│   │   ├── components/            # NEW: Game-level components
│   │   │   ├── GameHeader.tsx
│   │   │   ├── DeckCompositionBanner.tsx
│   │   │   └── index.ts          # Barrel export
│   │   ├── services/
│   │   ├── types/
│   │   └── test/
│   ├── market/
│   │   ├── components/            # NEW: Market-specific components
│   │   │   ├── MarketSection.tsx
│   │   │   └── index.ts          # Barrel export
│   │   ├── services/
│   │   ├── types/
│   │   └── test/
│   ├── player/
│   │   ├── components/            # NEW: Player-specific components
│   │   │   ├── AddPlayerInterface.tsx
│   │   │   ├── DeckComposition.tsx
│   │   │   ├── PlayerCard.tsx
│   │   │   ├── PlayersSection.tsx
│   │   │   ├── zones/
│   │   │   │   └── CardZone.tsx
│   │   │   └── index.ts          # Barrel export
│   │   ├── services/
│   │   ├── types/
│   │   └── test/
│   └── shared/                    # NEW: Shared/cross-cutting features
│       ├── components/            # Shared components
│       │   ├── ErrorBanner.tsx
│       │   ├── Footer.tsx
│       │   └── index.ts          # Barrel export
│       └── ui/                    # Reusable UI primitives
│           ├── button/
│           │   ├── button.tsx
│           │   └── index.ts
│           ├── input/
│           │   ├── input.tsx
│           │   └── index.ts
│           └── spinner/
│               ├── spinner.tsx
│               ├── Spinner.module.scss
│               └── index.ts
├── store/                         # Zustand stores (unchanged)
├── routes/                        # Route configuration (unchanged)
├── hooks/                         # Shared hooks (unchanged)
├── lib/                           # Utilities (unchanged)
├── types/                         # Shared types (unchanged)
└── test/                          # Test configuration (unchanged)
```

## Component Mapping

### Feature: Cards
| Current Location | New Location |
|-----------------|--------------|
| `src/components/modals/AddCardModal.tsx` | `src/features/cards/components/AddCardModal.tsx` |
| `src/components/modals/BulkAddCardModal.tsx` | `src/features/cards/components/BulkAddCardModal.tsx` |
| `src/components/modals/CardContextMenu.tsx` | `src/features/cards/components/CardContextMenu.tsx` |

### Feature: Game
| Current Location | New Location |
|-----------------|--------------|
| `src/components/GameHeader.tsx` | `src/features/game/components/GameHeader.tsx` |
| `src/components/DeckCompositionBanner.tsx` | `src/features/game/components/DeckCompositionBanner.tsx` |

### Feature: Market
| Current Location | New Location |
|-----------------|--------------|
| `src/components/market/MarketSection.tsx` | `src/features/market/components/MarketSection.tsx` |

### Feature: Player
| Current Location | New Location |
|-----------------|--------------|
| `src/components/players/AddPlayerInterface.tsx` | `src/features/player/components/AddPlayerInterface.tsx` |
| `src/components/players/DeckComposition.tsx` | `src/features/player/components/DeckComposition.tsx` |
| `src/components/players/PlayerCard.tsx` | `src/features/player/components/PlayerCard.tsx` |
| `src/components/players/PlayersSection.tsx` | `src/features/player/components/PlayersSection.tsx` |
| `src/components/players/zones/CardZone.tsx` | `src/features/player/components/zones/CardZone.tsx` |

### Shared Components
| Current Location | New Location |
|-----------------|--------------|
| `src/components/common/ErrorBanner.tsx` | `src/features/shared/components/ErrorBanner.tsx` |
| `src/components/common/Footer.tsx` | `src/features/shared/components/Footer.tsx` |
| `src/components/ui/button/*` | `src/features/shared/ui/button/*` |
| `src/components/ui/input/*` | `src/features/shared/ui/input/*` |
| `src/components/ui/spinner/*` | `src/features/shared/ui/spinner/*` |

## Import Path Changes

### Before
```typescript
import { AddCardModal } from '@/components/modals/AddCardModal';
import { MarketSection } from '@/components/market/MarketSection';
import Button from '@/components/ui/button';
import { ErrorBanner } from '@/components/common/ErrorBanner';
```

### After
```typescript
import { AddCardModal } from '@/features/cards/components';
import { MarketSection } from '@/features/market/components';
import Button from '@/features/shared/ui/button';
import { ErrorBanner } from '@/features/shared/components';
```

## Migration Steps

### Phase 1: Create Structure (Non-destructive)
1. Create `src/features/shared/` directory
2. Create `src/features/shared/components/` directory
3. Create `src/features/shared/ui/` directory
4. Create `components/` directories in each existing feature

### Phase 2: Move Shared Components
1. Move UI primitives from `src/components/ui/` to `src/features/shared/ui/`
2. Move common components from `src/components/common/` to `src/features/shared/components/`
3. Create index.ts barrel exports for each
4. Update imports in all affected files

### Phase 3: Move Feature Components
1. **Cards Feature**
   - Move modals to `src/features/cards/components/`
   - Create barrel export
   - Update imports

2. **Game Feature**
   - Move GameHeader and DeckCompositionBanner to `src/features/game/components/`
   - Create barrel export
   - Update imports

3. **Market Feature**
   - Move MarketSection to `src/features/market/components/`
   - Create barrel export
   - Update imports

4. **Player Feature**
   - Move all player components to `src/features/player/components/`
   - Maintain zones subdirectory structure
   - Create barrel export
   - Update imports

### Phase 4: Cleanup
1. Verify all imports are working
2. Run `pnpm lint && pnpm format`
3. Run `pnpm test && pnpm test:e2e`
4. Remove empty `src/components/` directory
5. Update documentation (CLAUDE.md, architecture.md, contribution.md)

## Benefits

### 1. Better Co-location
- Components live with their related business logic, types, and tests
- Reduces context switching when working on a feature
- Makes feature boundaries clearer

### 2. Improved AI Navigation
- AI tools can find all related code in one place
- Reduces the need to search across multiple directories
- Context is more focused when working on a specific feature

### 3. Clear Ownership
- Obvious which feature owns each component
- Easier to understand dependencies
- Simpler to refactor or remove features

### 4. Consistent Architecture
- Follows the existing pattern where features already have services/types/test
- Creates a uniform structure across all features
- Makes the codebase more predictable

### 5. Scalability
- New features can follow the same pattern
- Easy to add new components to existing features
- Shared components have a clear home

## Trade-offs and Considerations

### Challenges
1. **Initial Migration Effort**: Need to update all import paths across the codebase
2. **Longer Import Paths**: Paths like `@/features/shared/ui/button` are longer than `@/components/ui/button`
3. **Shared Components**: Need to decide what truly belongs in shared vs feature-specific

### Mitigation Strategies
1. **Use Barrel Exports**: Create index.ts files to simplify imports
2. **Consider Path Aliases**: Add more specific aliases in tsconfig for common paths
3. **Clear Guidelines**: Document when to use shared vs feature components

## Alternative Approaches

### Option 1: Keep UI at Root Level
```
src/
├── ui/              # UI primitives at root for maximum reusability
│   ├── button/
│   ├── input/
│   └── spinner/
├── shared/          # Other shared components
│   ├── ErrorBanner.tsx
│   └── Footer.tsx
└── features/        # Feature-specific components co-located
```

**Pros**: Shorter import paths for UI components, clearer that UI is truly shared
**Cons**: Split between two top-level directories

### Option 2: Domain-Based Shared
```
src/
└── features/
    ├── cards/
    ├── game/
    ├── market/
    ├── player/
    ├── ui/          # UI as its own "feature"
    └── common/      # Common as its own "feature"
```

**Pros**: Everything is a "feature", very consistent
**Cons**: UI and common aren't really features in the domain sense

## Decision Criteria

Choose the main proposal if:
- You want maximum co-location
- You prefer everything under features/
- You're okay with slightly longer import paths

Choose Alternative 1 if:
- You want shortest possible UI import paths
- You see UI as fundamentally different from features
- You prefer a flatter structure at the root level

## Next Steps

1. Review and approve the refactoring plan
2. Create any necessary branches for the refactor
3. Execute migration phases in order
4. Update all documentation
5. Run comprehensive tests
6. Consider adding lint rules to enforce the new structure

## Success Metrics

- All tests passing after refactor
- No broken imports
- Consistent structure across all features
- Updated documentation reflecting new structure
- Clear guidelines for future component placement
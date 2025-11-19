# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.14.0]() (2025-11-19)

fix: use separate deploy tokens for prod and dev fly deployments (#21)


* Merge pull request #22 from ryanbbrown/develop ([468fd4e](https://github.com/ryanbbrown/web-deckbuilding/commit/468fd4e)), closes [#22](https://github.com/ryanbbrown/web-deckbuilding/issues/22)
* fix: dev deploy to fly (#20) ([d77a281](https://github.com/ryanbbrown/web-deckbuilding/commit/d77a281)), closes [#20](https://github.com/ryanbbrown/web-deckbuilding/issues/20)
* fix: fly deploy action to dev + removing smoke tests ([6e71154](https://github.com/ryanbbrown/web-deckbuilding/commit/6e71154))
* fix: multiplayer working without command loop ([df6cb74](https://github.com/ryanbbrown/web-deckbuilding/commit/df6cb74))
* fix: use separate deploy tokens for prod and dev fly deployments ([047a06d](https://github.com/ryanbbrown/web-deckbuilding/commit/047a06d))
* fix: use separate deploy tokens for prod and dev fly deployments (#21) ([e57a50c](https://github.com/ryanbbrown/web-deckbuilding/commit/e57a50c)), closes [#21](https://github.com/ryanbbrown/web-deckbuilding/issues/21)
* feat: multiplayer rooms with y-redis integration (#19) ([b02cc2f](https://github.com/ryanbbrown/web-deckbuilding/commit/b02cc2f)), closes [#19](https://github.com/ryanbbrown/web-deckbuilding/issues/19)
* chore: prompts folder to gitignore ([98d3b58](https://github.com/ryanbbrown/web-deckbuilding/commit/98d3b58))
* ci: added dev app to fly deploy github action ([da3abeb](https://github.com/ryanbbrown/web-deckbuilding/commit/da3abeb))
* test: e2e testing for multiplayer features ([9534100](https://github.com/ryanbbrown/web-deckbuilding/commit/9534100))
* style: improved multiplayer control ui ([f394a30](https://github.com/ryanbbrown/web-deckbuilding/commit/f394a30))
* wip: basic multiplayer tentatively working on localhost ([a52013a](https://github.com/ryanbbrown/web-deckbuilding/commit/a52013a))
* wip: up to c1.5 on the multiplayer plan ([5da9577](https://github.com/ryanbbrown/web-deckbuilding/commit/5da9577))
* docs: added plan for multiplayer feature ([a5c75fa](https://github.com/ryanbbrown/web-deckbuilding/commit/a5c75fa))

## [0.13.0]() (2025-09-25)

refactor: cleaner y-redis subtree + new readme (#17)


* refactor: cleaner y-redis subtree + new readme (#17) ([4529029](https://github.com/ryanbbrown/web-deckbuilding/commit/4529029)), closes [#17](https://github.com/ryanbbrown/web-deckbuilding/issues/17)
* refactor: colocate components in feature directories ([5e30ad6](https://github.com/ryanbbrown/web-deckbuilding/commit/5e30ad6))
* refactor: colocate components in feature directories (#16) ([1ff2a7f](https://github.com/ryanbbrown/web-deckbuilding/commit/1ff2a7f)), closes [#16](https://github.com/ryanbbrown/web-deckbuilding/issues/16)
* refactor: moved old y-redis folder, added linting ignore ([14efb86](https://github.com/ryanbbrown/web-deckbuilding/commit/14efb86))
* chore: remove archive files ([e094201](https://github.com/ryanbbrown/web-deckbuilding/commit/e094201))
* feat: y-redis working with necessary fly.io changes ([cae2aa9](https://github.com/ryanbbrown/web-deckbuilding/commit/cae2aa9))
* Merge commit 'a065f4e99ccd1cd547bd3799bb35738b9c0ce8d4' as 'y-redis' ([c476809](https://github.com/ryanbbrown/web-deckbuilding/commit/c476809))
* Squashed 'y-redis/' content from commit 61a13e4 ([a065f4e](https://github.com/ryanbbrown/web-deckbuilding/commit/a065f4e))
* docs: updated readme with architecture ([1b394dc](https://github.com/ryanbbrown/web-deckbuilding/commit/1b394dc))

## [0.12.0]() (2025-09-19)

feat: basic y-redis functionality in subtree (#15)


* feat: basic y-redis functionality in subtree ([72bbfff](https://github.com/ryanbbrown/web-deckbuilding/commit/72bbfff))
* feat: basic y-redis functionality in subtree ([146b91b](https://github.com/ryanbbrown/web-deckbuilding/commit/146b91b))
* feat: basic y-redis functionality in subtree (#15) ([9491803](https://github.com/ryanbbrown/web-deckbuilding/commit/9491803)), closes [#15](https://github.com/ryanbbrown/web-deckbuilding/issues/15)
* Merge commit '5fd6c1ba5c67be2724db70079919fb5467fb55b1' as 'y-redis' ([f3ec026](https://github.com/ryanbbrown/web-deckbuilding/commit/f3ec026))
* Squashed 'y-redis/' content from commit 61a13e4 ([5fd6c1b](https://github.com/ryanbbrown/web-deckbuilding/commit/5fd6c1b))

## [0.11.0]() (2025-08-10)

feat: turn and coin counters + file cleanup (#14)


* chore: fix immutable object error in semantic-release transform ([b5ff2f2](https://github.com/ryanbbrown/web-deckbuilding/commit/b5ff2f2))
* chore: old store cleanup ([9330051](https://github.com/ryanbbrown/web-deckbuilding/commit/9330051))
* chore: removed component tests ([e39f6a6](https://github.com/ryanbbrown/web-deckbuilding/commit/e39f6a6))
* chore(release): cleaned up changelog, fixed grouping ([831c55f](https://github.com/ryanbbrown/web-deckbuilding/commit/831c55f))
* chore(release): short hash, tag compare link ([de13e6b](https://github.com/ryanbbrown/web-deckbuilding/commit/de13e6b))
* feat: coins counter ([ef6368f](https://github.com/ryanbbrown/web-deckbuilding/commit/ef6368f))
* feat: player turn count ([7629b09](https://github.com/ryanbbrown/web-deckbuilding/commit/7629b09))
* feat: turn and coin counters + file cleanup (#14) ([dbfde24](https://github.com/ryanbbrown/web-deckbuilding/commit/dbfde24)), closes [#14](https://github.com/ryanbbrown/web-deckbuilding/issues/14)
* fix: trashing allowed from discard ([23ac464](https://github.com/ryanbbrown/web-deckbuilding/commit/23ac464))

## [0.10.0](https://github.com/ryanbbrown/web-deckbuilding/compare/v0.9.0...v0.10.0) (2025-08-10)

added pnpm install to release job (#13)

### Features

* add semantic-release and changelog (#12) ([466d1be](https://github.com/ryanbbrown/web-deckbuilding/commit/466d1be)), closes [#12](https://github.com/ryanbbrown/web-deckbuilding/issues/12)
* add semantic-release GitHub Actions workflow ([2c6ad34](https://github.com/ryanbbrown/web-deckbuilding/commit/2c6ad34))
* setup semantic-release with automatic PR title extraction ([9d7b7bb](https://github.com/ryanbbrown/web-deckbuilding/commit/9d7b7bb))

### Bug Fixes

* added pnpm install to release job ([002d99c](https://github.com/ryanbbrown/web-deckbuilding/commit/002d99c))
* added pnpm install to release job (#13) ([60d0ed4](https://github.com/ryanbbrown/web-deckbuilding/commit/60d0ed4)), closes [#13](https://github.com/ryanbbrown/web-deckbuilding/issues/13)
* simplify semantic-release commit message ([33d5fed](https://github.com/ryanbbrown/web-deckbuilding/commit/33d5fed))
* use PAT token for semantic-release to bypass branch protection ([62d7171](https://github.com/ryanbbrown/web-deckbuilding/commit/62d7171))

### Chores

* enable GitHub plugin in semantic-release config ([ce3bd38](https://github.com/ryanbbrown/web-deckbuilding/commit/ce3bd38))
* revert hash customization in release config ([17cd3f2](https://github.com/ryanbbrown/web-deckbuilding/commit/17cd3f2))

## [0.9.0](https://github.com/ryanbbrown/web-deckbuilding/compare/v0.8.1...v0.9.0) (2025-01-27)

Initial e2e testing setup with Playwright ([#11](https://github.com/ryanbbrown/web-deckbuilding/pull/11))

### Features

* initial e2e testing setup with Playwright ([6114a8c](https://github.com/ryanbbrown/web-deckbuilding/commit/6114a8c))

## [0.8.1](https://github.com/ryanbbrown/web-deckbuilding/compare/v0.8.0...v0.8.1) (2025-01-27)

Reset button visibility after bulk adding cards ([#10](https://github.com/ryanbbrown/web-deckbuilding/pull/10))

### Bug Fixes

* reset button visibility after bulk adding cards ([5d60bdd](https://github.com/ryanbbrown/web-deckbuilding/commit/5d60bdd))

## [0.8.0](https://github.com/ryanbbrown/web-deckbuilding/compare/v0.7.0...v0.8.0) (2025-01-27)

Fly.io deployment ([#9](https://github.com/ryanbbrown/web-deckbuilding/pull/9))

### Build System

* fly.io deployment ([462786e](https://github.com/ryanbbrown/web-deckbuilding/commit/462786e))

## [0.7.0](https://github.com/ryanbbrown/web-deckbuilding/compare/v0.6.0...v0.7.0) (2025-01-27)

Bulk add cards ([#8](https://github.com/ryanbbrown/web-deckbuilding/pull/8))

### Features

* bulk add cards ([f91655f](https://github.com/ryanbbrown/web-deckbuilding/commit/f91655f))

## [0.6.0](https://github.com/ryanbbrown/web-deckbuilding/compare/v0.5.0...v0.6.0) (2025-01-27)

Show full deck/discard, discard all, reset game ([#7](https://github.com/ryanbbrown/web-deckbuilding/pull/7))

### Features

* show deck comp button ([af58bab](https://github.com/ryanbbrown/web-deckbuilding/commit/af58bab))
* show all discard toggle ([fec2355](https://github.com/ryanbbrown/web-deckbuilding/commit/fec2355))
* discard all cards ([0b029f6](https://github.com/ryanbbrown/web-deckbuilding/commit/0b029f6))
* reset game ([2ddd373](https://github.com/ryanbbrown/web-deckbuilding/commit/2ddd373))

## [0.5.0](https://github.com/ryanbbrown/web-deckbuilding/compare/v0.4.0...v0.5.0) (2025-01-27)

Persistent storage + utils refactor ([#6](https://github.com/ryanbbrown/web-deckbuilding/pull/6))

### Features

* persistent storage ([f630c03](https://github.com/ryanbbrown/web-deckbuilding/commit/f630c03))

### Code Refactoring

* moved utils + boilerplate cleanup ([de7e48e](https://github.com/ryanbbrown/web-deckbuilding/commit/de7e48e))
* removed component styling tests ([282f8a5](https://github.com/ryanbbrown/web-deckbuilding/commit/282f8a5))

## [0.4.0](https://github.com/ryanbbrown/web-deckbuilding/compare/v0.3.0...v0.4.0) (2025-01-27)

Added card trashing ([#5](https://github.com/ryanbbrown/web-deckbuilding/pull/5))

### Features

* added card trashing ([d4ad0c6](https://github.com/ryanbbrown/web-deckbuilding/commit/d4ad0c6))

## [0.3.0](https://github.com/ryanbbrown/web-deckbuilding/compare/v0.2.0...v0.3.0) (2025-01-27)

Frontend implementation + component tests ([#4](https://github.com/ryanbbrown/web-deckbuilding/pull/4))

### Features

* initial UI built out ([f819907](https://github.com/ryanbbrown/web-deckbuilding/commit/f819907))

### Tests

* added component tests ([97cda15](https://github.com/ryanbbrown/web-deckbuilding/commit/97cda15))

### Documentation

* updated ui specs for claude code ([4ea6c95](https://github.com/ryanbbrown/web-deckbuilding/commit/4ea6c95))

## [0.2.0](https://github.com/ryanbbrown/web-deckbuilding/compare/v0.1.0...v0.2.0) (2025-01-27)

Migrated backend logic to zustand ([#3](https://github.com/ryanbbrown/web-deckbuilding/pull/3))

### Features

* migrated backend logic to zustand ([59c9681](https://github.com/ryanbbrown/web-deckbuilding/commit/59c9681))

## 0.1.0 (2025-01-27)

Core deckbuilding backend ([#2](https://github.com/ryanbbrown/web-deckbuilding/pull/2))

### Features

* core deckbuilding backend ([559466b](https://github.com/ryanbbrown/web-deckbuilding/commit/559466b))

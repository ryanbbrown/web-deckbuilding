# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## 0.10.0 (2025-08-10)

fix: added pnpm install to release job (#13)


* fix: added pnpm install to release job ([002d99c3173fcf575d3dea6fcf9bdffffcaa05e6](https://github.com/ryanbbrown/web-deckbuilding/commit/002d99c3173fcf575d3dea6fcf9bdffffcaa05e6))
* fix: added pnpm install to release job (#13) ([60d0ed4534988a3e8141284f2bdbef6ef2f38768](https://github.com/ryanbbrown/web-deckbuilding/commit/60d0ed4534988a3e8141284f2bdbef6ef2f38768)), closes [#13](https://github.com/ryanbbrown/web-deckbuilding/issues/13)
* fix: simplify semantic-release commit message ([33d5fed820df6d401313053f84cb4318869c8b8c](https://github.com/ryanbbrown/web-deckbuilding/commit/33d5fed820df6d401313053f84cb4318869c8b8c))
* fix: use PAT token for semantic-release to bypass branch protection ([62d7171ed24f06c9557aaaf6df52db7ae3fc4dec](https://github.com/ryanbbrown/web-deckbuilding/commit/62d7171ed24f06c9557aaaf6df52db7ae3fc4dec))
* feat: add semantic-release and changelog (#12) ([466d1befaf4bb452efc92eaffb1cd191a6e1b88c](https://github.com/ryanbbrown/web-deckbuilding/commit/466d1befaf4bb452efc92eaffb1cd191a6e1b88c)), closes [#12](https://github.com/ryanbbrown/web-deckbuilding/issues/12)
* feat: add semantic-release GitHub Actions workflow ([2c6ad3483e7d4b7fa112d2ea29e330b6c60f523e](https://github.com/ryanbbrown/web-deckbuilding/commit/2c6ad3483e7d4b7fa112d2ea29e330b6c60f523e))
* feat: setup semantic-release with automatic PR title extraction ([9d7b7bbd554c77d61971a59b2672a77e3609db36](https://github.com/ryanbbrown/web-deckbuilding/commit/9d7b7bbd554c77d61971a59b2672a77e3609db36))
* chore: enable GitHub plugin in semantic-release config ([ce3bd38234d6f5cd6a9396edc05e2d7c3eff9990](https://github.com/ryanbbrown/web-deckbuilding/commit/ce3bd38234d6f5cd6a9396edc05e2d7c3eff9990))
* chore: revert hash customization in release config ([17cd3f2e86d107304975ec015c41d15cffa8b436](https://github.com/ryanbbrown/web-deckbuilding/commit/17cd3f2e86d107304975ec015c41d15cffa8b436))

## [0.9.0](https://github.com/ryanbbrown/web-deckbuilding/compare/v0.8.1...v0.9.0) (2025-01-27)

### Initial e2e testing setup with Playwright ([#11](https://github.com/ryanbbrown/web-deckbuilding/pull/11))

#### Features

* initial e2e testing setup with Playwright ([6114a8c](https://github.com/ryanbbrown/web-deckbuilding/commit/6114a8c))

## [0.8.1](https://github.com/ryanbbrown/web-deckbuilding/compare/v0.8.0...v0.8.1) (2025-01-27)

### Reset button visibility after bulk adding cards ([#10](https://github.com/ryanbbrown/web-deckbuilding/pull/10))

#### Bug Fixes

* reset button visibility after bulk adding cards ([5d60bdd](https://github.com/ryanbbrown/web-deckbuilding/commit/5d60bdd))

## [0.8.0](https://github.com/ryanbbrown/web-deckbuilding/compare/v0.7.0...v0.8.0) (2025-01-27)

### Fly.io deployment ([#9](https://github.com/ryanbbrown/web-deckbuilding/pull/9))

#### Build System

* fly.io deployment ([462786e](https://github.com/ryanbbrown/web-deckbuilding/commit/462786e))

## [0.7.0](https://github.com/ryanbbrown/web-deckbuilding/compare/v0.6.0...v0.7.0) (2025-01-27)

### Bulk add cards ([#8](https://github.com/ryanbbrown/web-deckbuilding/pull/8))

#### Features

* bulk add cards ([f91655f](https://github.com/ryanbbrown/web-deckbuilding/commit/f91655f))

## [0.6.0](https://github.com/ryanbbrown/web-deckbuilding/compare/v0.5.0...v0.6.0) (2025-01-27)

### Show full deck/discard, discard all, reset game ([#7](https://github.com/ryanbbrown/web-deckbuilding/pull/7))

#### Features

* show deck comp button ([af58bab](https://github.com/ryanbbrown/web-deckbuilding/commit/af58bab))
* show all discard toggle ([fec2355](https://github.com/ryanbbrown/web-deckbuilding/commit/fec2355))
* discard all cards ([0b029f6](https://github.com/ryanbbrown/web-deckbuilding/commit/0b029f6))
* reset game ([2ddd373](https://github.com/ryanbbrown/web-deckbuilding/commit/2ddd373))

## [0.5.0](https://github.com/ryanbbrown/web-deckbuilding/compare/v0.4.0...v0.5.0) (2025-01-27)

### Persistent storage + utils refactor ([#6](https://github.com/ryanbbrown/web-deckbuilding/pull/6))

#### Features

* persistent storage ([f630c03](https://github.com/ryanbbrown/web-deckbuilding/commit/f630c03))

#### Code Refactoring

* moved utils + boilerplate cleanup ([de7e48e](https://github.com/ryanbbrown/web-deckbuilding/commit/de7e48e))
* removed component styling tests ([282f8a5](https://github.com/ryanbbrown/web-deckbuilding/commit/282f8a5))

## [0.4.0](https://github.com/ryanbbrown/web-deckbuilding/compare/v0.3.0...v0.4.0) (2025-01-27)

### Added card trashing ([#5](https://github.com/ryanbbrown/web-deckbuilding/pull/5))

#### Features

* added card trashing ([d4ad0c6](https://github.com/ryanbbrown/web-deckbuilding/commit/d4ad0c6))

## [0.3.0](https://github.com/ryanbbrown/web-deckbuilding/compare/v0.2.0...v0.3.0) (2025-01-27)

### Frontend implementation + component tests ([#4](https://github.com/ryanbbrown/web-deckbuilding/pull/4))

#### Features

* initial UI built out ([f819907](https://github.com/ryanbbrown/web-deckbuilding/commit/f819907))

#### Tests

* added component tests ([97cda15](https://github.com/ryanbbrown/web-deckbuilding/commit/97cda15))

#### Documentation

* updated ui specs for claude code ([4ea6c95](https://github.com/ryanbbrown/web-deckbuilding/commit/4ea6c95))

## [0.2.0](https://github.com/ryanbbrown/web-deckbuilding/compare/v0.1.0...v0.2.0) (2025-01-27)

### Migrated backend logic to zustand ([#3](https://github.com/ryanbbrown/web-deckbuilding/pull/3))

#### Features

* migrated backend logic to zustand ([59c9681](https://github.com/ryanbbrown/web-deckbuilding/commit/59c9681))

## 0.1.0 (2025-01-27)

### Core deckbuilding backend ([#2](https://github.com/ryanbbrown/web-deckbuilding/pull/2))

#### Features

* core deckbuilding backend ([559466b](https://github.com/ryanbbrown/web-deckbuilding/commit/559466b))

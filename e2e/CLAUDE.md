# E2E Testing with Playwright

## Overview
End-to-end testing for the Web Deckbuilding SPA using Playwright.

## File Structure
```
e2e/
├── CLAUDE.md           # This documentation
├── example.spec.ts     # Basic application tests
└── [feature].spec.ts   # Feature-specific test files
```

## Commands
| Command | Description |
|---------|-------------|
| `pnpm test:e2e` | Run all E2E tests headlessly |
| `pnpm test:e2e:ui` | Run with Playwright UI mode |
| `pnpm test:e2e:debug` | Run in debug mode |
| `pnpm test:e2e:headed` | Run with browser UI visible |
| `pnpm test:e2e:report` | View test results report |

## Test Organization
- Use `test.describe()` blocks to group related tests
- Follow naming convention: `[feature-name].spec.ts`
- Use data-testid attributes for reliable element selection
- Tests should be independent and able to run in any order

## Best Practices
- Use `page.locator()` with data-testid for element selection
- Prefer semantic locators when possible (role, text, etc.)
- Use `expect()` assertions from Playwright
- Keep tests focused on user workflows, not implementation details
- Mock external API calls if needed for consistent testing

## AIDEV-NOTE: Expand tests based on actual application features and user flows
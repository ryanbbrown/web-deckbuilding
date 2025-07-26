## Common Development Tasks

### Adding a New Feature
1. Create feature directory in `src/features/`
2. Add types, services, hooks, and pages as needed
3. Export page component and add to routes
4. Create Zustand store if global state needed

### Adding UI Components
1. Create component folder in `src/components/ui/`
2. Include component file and index.ts export
3. Follow existing patterns (button.tsx, input.tsx)

### Styling
- Use Tailwind CSS classes
- SCSS modules supported for complex styling (see Spinner.module.scss)
- Global styles in `src/index.css`
# Review Standards — Platina

This is the single source of truth for all code review standards applied by the `/review` skill and the CI review Action.

---

## Global Best Practices

### TypeScript

- No `any` — use `unknown` and narrow, or define a proper type
- All exported functions must have explicit return types
- Discriminated unions and enum-like types must be exhaustively handled (`switch` must have a `default` or TypeScript must prove exhaustiveness)

### Error Handling

- No silent `catch` blocks — every caught error must be logged or re-thrown with context
- All errors must be typed — avoid `catch (e: any)`; use `catch (e: unknown)` and narrow with `instanceof`

### Security

- No hardcoded secrets, API keys, or environment values in source code
- All API route inputs must be validated before use (Zod `parse` or `safeParse` before touching `req.body` / query params)

### Async

- No floating promises — every `Promise` must be `await`-ed, returned, or explicitly handled with `.catch()`
- Use `async/await` consistently — do not mix `.then()` chains and `await` in the same function
- No unnecessary `await` on non-async values

### Performance

- No N+1 Prisma queries — use `include` or batch queries instead of looping over individual `findUnique` calls
- No redundant re-renders — state updates that can be batched should be; avoid setting state inside loops
- Memoize expensive derived values with `useMemo` / `useCallback` where component profiling would show unnecessary recomputation

### Tests

- Every exported function must have at least one test covering the happy path
- Error paths and edge cases (empty input, null values, network failure) must be covered
- No `it.skip` or `test.todo` left in committed code without a linked GitHub issue

### Code Hygiene

- No dead code — remove unreachable branches, unused imports, unused variables
- No commented-out code blocks
- No `TODO` or `FIXME` comments without a GitHub issue reference in the format `// TODO: #123 — description`

---

## Platina-Specific Rules

### Internationalization

- All UI-visible strings must be in Hebrew — no English text rendered to the user
- All code identifiers (function names, variable names, file names, type names) must be in English

### Layout

- Every new UI component must be RTL-first: `dir="rtl"` on the root element (or rely on the inherited `dir` from the page root), and `flex-row-reverse` / `text-right` where directionality matters
- Do not use `ltr`-specific CSS assumptions (e.g., `margin-left` for "start" — use `ms-` utilities)

### Tailwind

- `dark:` variant is required on every Tailwind color class — no exceptions (e.g., `text-gray-700 dark:text-gray-300`, not just `text-gray-700`)
- No inline `style` attributes — Tailwind utility classes only
- No custom CSS unless no Tailwind utility exists for the property

### API Routes

- Every API route must validate its input with Zod before any processing — no access to `body`, `params`, or `query` before validation
- Output shape should also be validated or at minimum typed with a Zod schema before returning
- All API routes must check authentication via `getGarageContext()` and return `401` if auth fails (this becomes a hard block once the auth module is stable)

### Prisma

- No raw SQL (`$queryRaw`, `$executeRaw`) without a comment explaining why the ORM query builder is insufficient
- When a handler performs multiple writes, wrap them in `$transaction` to ensure atomicity

### Components

- New reusable UI components must be placed under `src/components/ui/` — never create one-off ad-hoc components inline in page files
- Always check if a component already exists in `src/components/ui/` before creating a new one

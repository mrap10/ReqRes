# `@reqres/eslint-config`

Shared ESLint configurations for the ReqRes monorepo.

## Configs

| Config           | File                | Used By                                           |
| :--------------- | :------------------ | :------------------------------------------------ |
| `base`           | `base.js`           | All packages (JS + TS + Prettier + Turbo)         |
| `next`           | `next.js`           | `apps/web` (Next.js-specific rules)               |
| `node`           | `node.js`           | `apps/api`, `apps/runner` (Node.js backend rules) |
| `react-internal` | `react-internal.js` | Internal React packages                           |

## Notes

- Uses `eslint-plugin-only-warn` to convert errors to warnings ~ prevents ESLint from blocking builds while still surfacing issues.
- All configs include Prettier integration for consistent formatting.

## Links

- [Architecture](../../ARCHITECTURE.md)
- [Main Documentation](../../README.md)
- [/api](../api/README.md)
- [/web](../web/README.md)
- [/runner](../runner/README.md)

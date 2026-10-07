# Contributing

Contributions to Sounds Control are welcome: fixes, audio features, tests, examples, accessibility improvements and translations. Read the [Code of Conduct](CODE_OF_CONDUCT.md) and report vulnerabilities through [SECURITY](SECURITY.md).

## Local setup

Use Node.js 22.14+ (Node 22 and 24 are tested in CI) and npm. This requirement applies to development tooling; runtime playback uses browser Web Audio, not Node audio.

```sh
nvm use
npm ci
npm run check
```

`npm ci` enables Husky locally. The pre-commit hook runs lint-staged (ESLint and Prettier on staged files). The pre-push hook runs the complete check. CI runs the same validation without installing local hooks.

## Development commands

| Command                                   | Purpose                                              |
| ----------------------------------------- | ---------------------------------------------------- |
| `npm run build`                           | Clean dist; emit ESM, CommonJS, UMD and declarations |
| `npm run typecheck`                       | Validate source and API type usage                   |
| `npm run lint` / `npm run lint:fix`       | ESLint validation / automatic fixes                  |
| `npm run format` / `npm run format:check` | Prettier formatting / validation                     |
| `npm test`                                | Build and run unit/regression tests                  |
| `npm run test:coverage`                   | Enforce 90% lines/functions and 85% branches         |
| `npm run test:package`                    | Pack, install and verify the npm artifact            |
| `npm run check`                           | Run all required checks                              |

## Pull requests

1. Open an issue to discuss substantial API changes, then create a focused branch.
2. Preserve existing public signatures where possible. Document deliberate behavior changes in CHANGELOG.md.
3. Add regression tests for playback, asynchronous races and resource ownership. Unit tests use a deterministic AudioContext double; validate browser behavior separately for browser-specific changes.
4. Keep README.md in English and update the matching explanations in `docs/pt-br`, `docs/hi`, `docs/es`, `docs/ru`, and `docs/zh`. Keep the legacy Portuguese/Spanish readmes synchronized.
5. Run `npm run check` and include results plus any manual browser validation in your pull request.

Describe the problem, resulting behavior and validation. Do not commit generated `dist`, `node_modules`, coverage or tarballs. Importing must stay safe in SSR; instantiate/play only on the client. Do not add framework or runtime dependencies without discussing the need.

## Browser validation

The automated Chromium smoke test generates a WAV locally and verifies real decoding, click-triggered playback, pause/resume, seek, overlapping effects, mute, natural completion and context ownership. It runs in CI separately from the tooling/unit/package checks.

```sh
npx playwright install chromium
npm run test:browser
```

To use an existing Chromium executable, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.

From a click/tap, call `unlock()`, load an audio asset and test play, pause/resume, seek, loop, rate, effects, mute and disposal. Check current Chromium, Firefox and Safari/iOS where available. Test Ionic in its actual WebView. Network failures, CORS, autoplay restrictions and unsupported codecs must be surfaced to the application.

## Releases

Maintainers review the changelog, run `npm ci && npm run check`, and inspect `npm pack --dry-run`. `prepublishOnly` validates the package and `prepack` builds it. Pushing commits does not publish to npm; npm releases are a separate maintainer action.

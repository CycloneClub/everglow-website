# Atlas content implementation plan

**Goal:** Show regional scenery with its introduction, fold regional notes into that introduction, and replace the unverified Giant Tree Man with Vampire Mat using the user-provided mod source.

**Architecture:** Keep the entrance, camera and paging controllers. Define the remaining detail cards in each region's data; derive reading stops and duration from the number of cards. Render the same cards in animated and static layouts. Copy the original boss sprite sheet without modifying the mod repository and show a single frame with an SVG viewport.

**Tech stack:** Nuxt, Vue, TypeScript, Node test runner.

**Constraints:** Preserve the full-tree entrance. Do not fabricate lore or new scenery. Update Simplified Chinese, Traditional Chinese and English together. Do not change the source mod.

- [x] Add failing coverage for simultaneous introduction/scenery, variable card counts and complete mobile stops.
- [x] Implement the data-driven detail timeline and merge the regional descriptions.
- [x] Replace the creature card with Vampire Mat, citing localization and `KelpCurtain/NPCs/VampireMat/VampireMat.cs`.
- [x] Render cards in animated/static layouts and verify sprite framing.
- [x] Run atlas tests, typecheck, targeted lint and browser checks; update world-atlas documentation.

Initial validation: 41 atlas tests and vue-tsc passed. Desktop wheel entry and town/scenery reveal, mobile paging, static parity, sprite dimensions and byte identity were verified. ESLint initially could not resolve `hashery`.

Final PR validation (2026-11-17): all 87 Node tests, lint, typecheck, production build and production smoke checks pass after synchronizing dependencies with main. Smoke checks use the same local environment file as the build. Desktop, mobile, static mode and English layouts down to 320×600 were inspected. The user accepted background-inverting pylon text over the chains; static layout reserves the full scene bounds. Independent review found no remaining blockers under that presentation choice.

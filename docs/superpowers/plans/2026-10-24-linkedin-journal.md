# LinkedIn journal implementation plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Publish the existing v/h LinkedIn archive on vh.do and synchronize future scheduled posts.

**Architecture:** Import verified ledger entries into a public content manifest and local assets, then generate static articles and an archive using the current Philosophy layout. Extend the existing heartbeat with the documented import, verification and deployment steps.

**Tech Stack:** Plain HTML/CSS, Node.js built-ins, Poppler for document rendering, GitHub Pages.

**Spec:** docs/superpowers/specs/2026-10-24-linkedin-journal.md

## Global constraints

- Use actual Neue Montreal and the established palette and logo.
- Retain every verified post's substantive copy, date, LinkedIn URL and media.
- No draft content, private filesystem paths, analytics or proof screenshots in the published manifest.
- Direct article URLs work without fragments or JavaScript.
- Preserve automation schedule, target thread and publishing constraints.

## Review focus

- Missing media must fail before changing the published content manifest.
- Repeated synchronization must neither duplicate posts nor rewrite their stable URLs.
- Midnight UTC timestamps must display the correct Los Angeles publication date.
- HTML-like text must render as text and cannot inject executable markup.
- Nested article paths must resolve styles, navigation and media correctly on mobile and desktop.

### Task 1: Import and render the complete archive

**Files:** scripts/sync-linkedin.mjs, scripts/build-journal.mjs, content/journal/posts.json, journal.css, journal/, assets/journal/, tests/journal.test.mjs, package.json, README.md, index.html, philosophy.html.

**Interfaces:** The importer consumes --ledger and --asset-root paths. It writes a public-only manifest and copied assets. The generator consumes the manifest and emits static pages. Both support checkable reruns; the generator supports --check.

- [ ] Write integration tests for verified-only import, date conversion, duplicate safety, missing media, HTML escaping and generated nested routes.
- [ ] Run the tests and confirm failures for the missing importer/generator.
- [ ] Implement the importer and static generation, copy existing media and add navigation.
- [ ] Run npm run build and npm test. Expected: all tests pass and generated files are current.
- [ ] Inspect archive, text, image, document and video pages in the browser at desktop and mobile sizes; verify native video playback and no horizontal overflow.
- [ ] Commit the feature, obtain a whole-branch review and resolve important defects.

### Task 2: Publish and extend the daily scheduler

**Files:** README.md, existing v-h-daily-linkedin-post automation via the automation tool, local publication ledger website metadata.

**Interfaces:** After LinkedIn publication, run npm run sync:linkedin, npm run build, npm test, commit and push the generated site to main, then verify GitHub Pages and the live article. Existing localDate prevents a second LinkedIn post while website backlog can still be repaired.

- [ ] Deploy the reviewed commit to GitHub Pages and verify the archive and representative live media.
- [ ] Update the existing automation using its full current fields, preserving the daily schedule and thread.
- [ ] Record verified article URLs in the ledger, preserve all prior fields, and save proof under outputs/site-journal/.

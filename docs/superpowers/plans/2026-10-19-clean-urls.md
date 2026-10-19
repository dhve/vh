# Clean site URLs implementation plan

> Implement inline with superpowers:executing-plans and verify the finished change before publishing.

**Goal:** Replace public hash and HTML filename links with readable paths on the existing GitHub Pages site.

**Architecture:** Keep the current home page and philosophy article. Generate static directory entry pages for their sections so direct visits return real HTML. A small navigation module maps clean paths to the existing sections and upgrades old links.

**Tech stack:** Existing HTML, CSS and JavaScript, plus dependency-free Node scripts and tests.

**Spec:** The user's request to remove hashtags and similar URL clutter from the GitHub Pages site.

## Constraints

- Preserve the current design, content, logo, Neue Montreal fonts and vh.do configuration.
- Support both a custom-domain root and a GitHub project path prefix.
- Keep old hash links and philosophy.html bookmarks usable.
- Do not require a server, rewrite service or 404 fallback for valid routes.

## Review focus

- Direct visits and refreshes must work for nested article sections.
- Relative fonts, styles and images must resolve from every route.
- Back, forward and modified link clicks must retain browser behavior.
- Legacy URLs must keep their destination when cleaned.
- The mobile menu and skip link must remain accessible.

## Task 1: Implement and publish clean navigation

- [x] Add failing tests for route resolution, legacy bookmarks and project prefixes.
- [x] Add a shared route map, static page generator and browser navigation module.
- [x] Update both source HTML pages to use clean paths and canonical article metadata.
- [x] Generate the static entry pages and verify their targets and assets.
- [x] Run unit checks and browser checks for navigation, refresh, history and mobile layout.
- [x] Review the diff and address the findings.
- Publish to the existing Pages branch and record live verification in the task result.

## Progress

The existing checkout was clean. Work is isolated on codex/clean-site-urls in the existing checkout. The site publishes directly from main with .nojekyll. No dependency installation is needed.

All six unit checks pass, and all 14 static routes return HTTP 200 in the local preview. Chrome checks cover the existing layout, project prefix, direct article loads, refresh, history, old bookmarks, mobile navigation and keyboard focus. The independent review found a changing base URL after history navigation, a responsive CSS selector tied to an old hash link and a fallback skip-link issue. All were corrected and verified. No review findings remain deferred.

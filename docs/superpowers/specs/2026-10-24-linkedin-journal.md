# v/h LinkedIn journal

Add all verified public company posts to vh.do as individual articles under /journal/. Reuse the Philosophy page's Neue Montreal typography, ivory reading surface, large titles, byline, narrow prose column and footer. The archive is a simple chronological editorial list with the latest visual entry featured above it. Add Journal to the existing navigation.

Preserve the full substantive copy, original publication date, source LinkedIn URL and every original attachment. Omit hashtag-only lines from article presentation. Keep film disclosures and all statements about development intact. Images and videos are served locally; videos have controls and no autoplay. Documents have readable page images, extracted text alternatives and their original downloadable PDF. URLs work on direct visits and refreshes without fragments. Static content works without JavaScript.

Use the existing dependency-free GitHub Pages site and branch-root publishing. Add an idempotent importer from the local publication ledger into a public-only content manifest, with copied media. Never publish private paths, analytics, proof screenshots or draft posts. Keep the current daily automation and its schedule, adding website synchronization after verified LinkedIn publication and recovery of any website backlog without reposting to LinkedIn.

Implementation choices: /journal/ is the archive label and path; article slugs use stable ledger keys. Existing site CSS and site.js provide the common shell. A deterministic build emits article HTML, archive HTML, RSS and a sitemap. The user requested implementation and recurring publication, so this work includes deployment and scheduler update.

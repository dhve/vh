# v/h

The v/h company website, published with GitHub Pages at https://vh.do.

## Files

- `index.html` contains the home page.
- `philosophy.html` contains the founder's article.
- `styles.css` and `brand.css` contain the styles.
- `site.js` controls the navigation and interactive diagrams.
- `navigation.mjs` handles clean section URLs and older bookmarks.
- `routes.mjs` defines the home and philosophy section paths.
- `assets/` contains the images, favicon, and Neue Montreal font files.

The site uses plain HTML, CSS, and JavaScript with no package dependencies. Run `npm run build` after editing either source HTML page or the route map, then run `npm test`. The build generates directory entry pages for clean URLs such as `/idea/`, `/philosophy/`, and `/philosophy/owning-it/`. Commit those generated pages with the source changes so direct visits and refreshes work on GitHub Pages.

The generated pages contain a comment identifying their source. Edit `index.html` or `philosophy.html` instead of editing generated copies. The old `philosophy.html` page remains available for existing bookmarks and updates its address to `/philosophy/` when JavaScript runs.

## Preview

Run `python3 -m http.server 8000` from this directory and open http://localhost:8000.

## Publishing

GitHub Pages publishes the root of the `main` branch. Push changes to `main` to update the site. The `.nojekyll` file tells GitHub to serve the files directly. The custom domain is `vh.do`, and `www.vh.do` redirects to it once DNS and HTTPS are active.

## Fonts and assets

The site includes the existing Neue Montreal Regular, Medium, and Bold files. They are third-party demo/trial copies from Pangram Pangram. Their inclusion does not grant a commercial web licence. See `assets/neue-montreal-trial-license.txt` and the [foundry's licensing information](https://pangrampangram.com/products/neue-montreal).

The v/h name, logo, copy, and images remain subject to their owners' rights. This repository does not grant an open-source licence for those materials or the fonts.

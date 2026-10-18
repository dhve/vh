# v/h

The v/h company website, published with GitHub Pages at https://vh.do.

## Files

- `index.html` contains the home page.
- `philosophy.html` contains the founder's article.
- `styles.css` and `brand.css` contain the styles.
- `site.js` controls the navigation and interactive diagrams.
- `assets/` contains the images, favicon, and Neue Montreal font files.

The site uses plain HTML, CSS, and JavaScript. It has no build step or package dependencies.

## Preview

Run `python3 -m http.server 8000` from this directory and open http://localhost:8000.

## Publishing

GitHub Pages publishes the root of the `main` branch. Push changes to `main` to update the site. The `.nojekyll` file tells GitHub to serve the files directly. The custom domain is `vh.do`, and `www.vh.do` redirects to it once DNS and HTTPS are active.

## Fonts and assets

The site includes the existing Neue Montreal Regular, Medium, and Bold files. They are third-party demo/trial copies from Pangram Pangram. Their inclusion does not grant a commercial web licence. See `assets/neue-montreal-trial-license.txt` and the [foundry's licensing information](https://pangrampangram.com/products/neue-montreal).

The v/h name, logo, copy, and images remain subject to their owners' rights. This repository does not grant an open-source licence for those materials or the fonts.

import { resolveRoute } from './routes.mjs';

const baseURL = new URL('.', document.baseURI);
// History changes the document URL. Freeze the base first so relative links
// and assets keep resolving from the site root after every section change.
const baseElement = document.querySelector('base') || document.createElement('base');
baseElement.href = baseURL.href;
if (!baseElement.isConnected) document.head.prepend(baseElement);
const page = document.documentElement.dataset.page;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function scrollToTarget(target, behavior, focus = false) {
  const element = document.getElementById(target);
  if (!element) return;
  element.scrollIntoView({ behavior, block: 'start' });
  if (focus) {
    if (!element.hasAttribute('tabindex')) element.setAttribute('tabindex', '-1');
    element.focus({ preventScroll: true });
  }
}

function currentRoute() {
  const route = resolveRoute(new URL(location.href), baseURL);
  if (!route || route.page !== page) return null;
  if (route.url.href !== location.href) history.replaceState(history.state, '', route.url);
  return route;
}

const initialRoute = currentRoute();
const initialURL = location.href;
if (initialRoute && initialRoute.target !== 'top' && performance.getEntriesByType('navigation')[0]?.type !== 'back_forward') {
  document.fonts.ready.then(() => {
    if (location.href === initialURL) scrollToTarget(initialRoute.target, 'instant');
  });
}

document.addEventListener('click', event => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const link = event.target.closest('a[href]');
  if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;

  // Keep the native no-JavaScript skip link without adding a fragment during use.
  if (link.classList.contains('skip-link')) {
    event.preventDefault();
    scrollToTarget('main', 'instant', true);
    return;
  }

  const route = resolveRoute(new URL(link.href), baseURL);
  if (!route || route.page !== page) return;
  event.preventDefault();
  if (route.url.href !== location.href) history.pushState(null, '', route.url);
  scrollToTarget(route.target, reduceMotion.matches ? 'instant' : 'smooth', true);
});

window.addEventListener('popstate', () => {
  const route = currentRoute();
  if (route) scrollToTarget(route.target, 'instant');
});

window.addEventListener('hashchange', () => {
  const route = currentRoute();
  if (route) scrollToTarget(route.target, 'instant');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const script = name => fileURLToPath(new URL(`../scripts/${name}.mjs`, import.meta.url));
const run = (name, root, ...args) => spawnSync(process.execPath, [script(name), '--root', root, ...args], { encoding: 'utf8' });
const post = (extra = {}) => ({ key: 'clear-result', title: 'A clear result', format: 'text', body: 'A button is an action.\n\nA result needs evidence.', publishedAt: '2026-10-19T05:21:15.282Z', url: 'https://www.linkedin.com/feed/update/urn:li:share:123456/', verified: true, ...extra });
async function fixture(t, posts) {
  const root = await mkdtemp(join(tmpdir(), 'vh-journal-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, 'source-assets'));
  await writeFile(join(root, 'ledger.json'), JSON.stringify(posts));
  return root;
}
const sync = root => run('sync-linkedin', root, '--ledger', join(root, 'ledger.json'), '--asset-root', join(root, 'source-assets'));

test('imports only verified public posts, uses LA dates, and excludes private ledger fields', async t => {
  const root = await fixture(t, [post({ proofPath: '/private/proof.png', rationale: 'private strategy' }), post({ key: 'draft', verified: false }), post({ key: 'not-published', status: 'draft' })]);
  const result = sync(root);
  assert.equal(result.status, 0, result.stderr);
  const raw = await readFile(join(root, 'content/journal/posts.json'), 'utf8');
  const posts = JSON.parse(raw);
  assert.equal(posts.length, 1);
  assert.equal(posts[0].date, '2026-10-18');
  assert.equal(posts[0].slug, 'clear-result');
  assert.doesNotMatch(raw, /private|rationale|proofPath|draft/);
  assert.equal(sync(root).status, 0);
  assert.equal(await readFile(join(root, 'content/journal/posts.json'), 'utf8'), raw);
});

test('retains all attachments and video posters without duplicating file/assets aliases', async t => {
  const root = await fixture(t, [post({ format: 'image', file: 'one.png', assets: ['one.png', 'two.jpg'], alt: 'A clear diagram' }), post({ key: 'film', format: 'video', url: 'https://www.linkedin.com/feed/update/urn:li:share:234567/', assets: ['film.mp4'], thumbnail: 'cover.jpg', localDate: '2026-10-20' })]);
  for (const name of ['one.png', 'two.jpg', 'film.mp4', 'cover.jpg']) await writeFile(join(root, 'source-assets', name), `fixture:${name}`);
  assert.equal(sync(root).status, 0);
  const posts = JSON.parse(await readFile(join(root, 'content/journal/posts.json'), 'utf8'));
  const images = posts.find(p => p.slug === 'clear-result').media;
  assert.equal(images.length, 2);
  for (const media of images) assert.equal(await readFile(join(root, media.src), 'utf8'), `fixture:${media.src.split('/').at(-1)}`);
  assert.ok(posts.find(p => p.slug === 'film').media[0].poster.endsWith('cover.jpg'));
});

test('missing assets and duplicate identities fail before changing the existing manifest', async t => {
  const root = await fixture(t, [post()]);
  assert.equal(sync(root).status, 0);
  const path = join(root, 'content/journal/posts.json');
  const original = await readFile(path, 'utf8');
  for (const posts of [[post({format:'image',file:'missing.png'})], [post(), post()], [post(), post({key:'alias'})]]) {
    await writeFile(join(root, 'ledger.json'), JSON.stringify(posts));
    assert.notEqual(sync(root).status, 0);
    assert.equal(await readFile(path, 'utf8'), original);
  }
});

test('builds standalone clean routes, escapes copy, preserves source links and checks stale output', async t => {
  const root = await fixture(t, [post({ body: '<script>alert("hello")</script>\n\n• Check the result.\n• Show it clearly.\n\n#ProductDesign #Hardware' })]);
  assert.equal(sync(root).status, 0);
  const result = run('build-journal', root);
  assert.equal(result.status, 0, result.stderr);
  const html = await readFile(join(root, 'journal/clear-result/index.html'), 'utf8');
  assert.match(html, /<base href="\.\.\/\.\.\/">/);
  assert.match(html, /rel="canonical" href="https:\/\/vh.do\/journal\/clear-result\/"/);
  assert.match(html, /&lt;script&gt;/);
  assert.doesNotMatch(html, /<script>alert|#ProductDesign/);
  assert.match(html, /<li>Check the result\.<\/li>/);
  assert.match(html, /https:\/\/www.linkedin.com\/feed\/update\/urn:li:share:123456\//);
  assert.equal(run('build-journal', root, '--check').status, 0);
  await writeFile(join(root, 'journal/clear-result/index.html'), 'stale');
  assert.notEqual(run('build-journal', root, '--check').status, 0);
});

import { copyFile, mkdir, mkdtemp, readFile, readdir, rename, rm, stat, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, isAbsolute, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const options = process.argv.slice(2);
const option = (name, fallback) => options.includes(name) ? options[options.indexOf(name) + 1] : fallback;
const root = resolve(option('--root', fileURLToPath(new URL('../', import.meta.url))));
const ledger = resolve(option('--ledger', join(root, '../../linkedin-posts/published.json')));
const assetRoot = resolve(option('--asset-root', join(root, '../../../outputs/linkedin-launch')));
const entries = JSON.parse(await readFile(ledger, 'utf8'));
if (!Array.isArray(entries)) throw new Error('The publication ledger must be an array.');
const verified = entries.filter(p => p.verified === true && (!p.status || p.status === 'published'));
const ids = new Set();
const sources = new Set();
const plans = [];
const localDate = timestamp => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(timestamp));
function publicURL(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:') throw new Error(`Expected an HTTPS public URL: ${value}`);
  return url;
}
function inputPath(path) { return isAbsolute(path) ? path : resolve(assetRoot, path); }
async function requireFile(path) {
  if (!(await stat(path)).isFile()) throw new Error(`Expected a media file: ${path}`);
}

// Validate every record and every source asset before replacing any public output.
for (const entry of verified) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.key)) throw new Error(`Invalid post key: ${entry.key}`);
  if (ids.has(entry.key)) throw new Error(`Duplicate post key: ${entry.key}`);
  ids.add(entry.key);
  const source = publicURL(entry.url);
  if (!['www.linkedin.com', 'linkedin.com'].includes(source.hostname) || !/^\/feed\/update\/urn:li:(share|activity|ugcPost):\d+\/?$/.test(source.pathname)) throw new Error(`Expected a LinkedIn post permalink: ${entry.key}`);
  source.hostname = 'www.linkedin.com';
  source.search = ''; source.hash = '';
  source.pathname = source.pathname.replace(/\/?$/, '/');
  if (sources.has(source.href)) throw new Error(`Duplicate source post: ${entry.key}`);
  sources.add(source.href);
  if (!entry.title?.trim() || !entry.body?.trim()) throw new Error(`Missing title or copy: ${entry.key}`);
  if (!['text', 'image', 'video', 'document'].includes(entry.format)) throw new Error(`Unsupported format: ${entry.key}`);
  const date = entry.localDate || localDate(entry.publishedAt);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) throw new Error(`Missing publication date: ${entry.key}`);
  const post = { id: entry.key, slug: entry.key, title: entry.title, body: entry.body, date, format: entry.format, sourceURL: source.href, media: [] };
  if (entry.publishedAt) post.publishedAt = new Date(entry.publishedAt).toISOString();
  if (entry.linkPreview) post.linkPreview = { title: entry.linkPreview.title, url: publicURL(entry.linkPreview.url).href };
  const assets = [...new Set([entry.file, ...(entry.assets || [])].filter(Boolean).map(inputPath))];
  if (entry.format !== 'text' && !assets.length) throw new Error(`Missing attachment: ${entry.key}`);
  const names = new Set();
  const files = [];
  for (const path of assets) {
    await requireFile(path);
    const name = basename(path);
    if (!/^[a-zA-Z0-9._-]+$/.test(name) || names.has(name)) throw new Error(`Ambiguous asset filename: ${entry.key}/${name}`);
    names.add(name);
    const extension = extname(name).toLowerCase();
    const kind = extension === '.pdf' ? 'document' : ['.mp4', '.webm'].includes(extension) ? 'video' : ['.png', '.jpg', '.jpeg', '.webp'].includes(extension) ? 'image' : null;
    if (!kind) throw new Error(`Unsupported attachment: ${name}`);
    const media = { kind, src: `assets/journal/${entry.key}/${name}`, alt: entry.alt || entry.title };
    if (kind === 'video' && entry.thumbnail) {
      const thumbnail = inputPath(entry.thumbnail);
      await requireFile(thumbnail);
      const posterName = basename(thumbnail);
      if (!/^[a-zA-Z0-9._-]+\.(png|jpe?g|webp)$/i.test(posterName) || names.has(posterName)) throw new Error(`Invalid video poster: ${entry.key}`);
      names.add(posterName);
      media.poster = `assets/journal/${entry.key}/${posterName}`;
      files.push({ path: thumbnail, output: media.poster });
    }
    post.media.push(media);
    files.push({ path, output: media.src, media });
  }
  plans.push({ post, files });
}

const stage = await mkdtemp(join(tmpdir(), 'vh-journal-sync-'));
try {
  for (const { post, files } of plans) {
    for (const file of files) {
      const output = join(stage, file.output);
      await mkdir(dirname(output), { recursive: true });
      await copyFile(file.path, output);
      if (file.media?.kind === 'document') {
        // Local originals are the source of both the readable pages and the PDF download.
        const prefix = output.slice(0, -4);
        execFileSync('pdftoppm', ['-jpeg', '-jpegopt', 'quality=85', '-scale-to', '1400', file.path, prefix], { stdio: 'pipe' });
        const names = (await readdir(dirname(output))).filter(name => name.startsWith(`${basename(prefix)}-`) && name.endsWith('.jpg')).sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
        if (!names.length) throw new Error(`No readable pages rendered: ${post.id}`);
        file.media.pages = names.map((name, index) => {
          const text = execFileSync('pdftotext', ['-f', `${index + 1}`, '-l', `${index + 1}`, '-layout', file.path, '-'], { encoding: 'utf8' }).replace(/\s+/g, ' ').trim();
          return { src: `assets/journal/${post.slug}/${name}`, alt: `${post.title}. Page ${index + 1} of ${names.length}.${text ? ` ${text}` : ''}` };
        });
      }
    }
  }
  const posts = plans.map(({ post }) => post).sort((a, b) => b.date.localeCompare(a.date) || (b.publishedAt || `${b.date}T23:59:59Z`).localeCompare(a.publishedAt || `${a.date}T23:59:59Z`) || a.id.localeCompare(b.id));
  for (const { post } of plans) {
    const directory = `assets/journal/${post.slug}`;
    const files = await readdir(join(stage, directory)).catch(() => []);
    if (files.length) await mkdir(join(root, directory), { recursive: true });
    for (const name of files) await copyFile(join(stage, directory, name), join(root, directory, name));
  }
  const manifest = join(root, 'content/journal/posts.json');
  await mkdir(dirname(manifest), { recursive: true });
  await writeFile(`${manifest}.tmp`, `${JSON.stringify(posts, null, 2)}\n`);
  await rename(`${manifest}.tmp`, manifest);
  console.log(`Synced ${posts.length} verified posts and their media.`);
} finally {
  await rm(stage, { recursive: true, force: true });
}

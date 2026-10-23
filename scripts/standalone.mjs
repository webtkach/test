import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');
const output = resolve(root, 'artifacts');
const mime = { '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const uri = async path => `data:${mime[extname(path)]};base64,${(await readFile(path)).toString('base64')}`;
let html = await readFile(resolve(dist, 'index.html'), 'utf8');
const scriptPath = html.match(/<script[^>]*src="([^"]+)"[^>]*><\/script>/)?.[1];
const cssPath = html.match(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/)?.[1];
if (!scriptPath || !cssPath) throw new Error('Expected one Vite script and stylesheet in the build.');
let js = await readFile(resolve(dist, `.${scriptPath}`), 'utf8');
let css = await readFile(resolve(dist, `.${cssPath}`), 'utf8');

// Keep the portable app fully offline: inline photos, fonts and favicon.
for (const name of await readdir(resolve(dist, 'images'))) {
  if (extname(name) !== '.jpg') continue;
  js = js.replaceAll(`/images/${name}`, await uri(resolve(dist, 'images', name)));
  js = js.replaceAll(`images/${name}`, await uri(resolve(dist, 'images', name)));
}
for (const name of await readdir(resolve(dist, 'assets'))) {
  if (extname(name) !== '.woff2') continue;
  css = css.replaceAll(`/assets/${name}`, await uri(resolve(dist, 'assets', name)));
}
html = html.replace(/<script[^>]*src="[^"]+"[^>]*><\/script>/, () => `<script type="module">${js.replace(/<\/script/gi, '<\\/script')}</script>`);
html = html.replace(/<link[^>]*rel="stylesheet"[^>]*href="[^"]+"[^>]*>/, () => `<style>${css}</style>`);
html = html.replace('/favicon.svg', await uri(resolve(dist, 'favicon.svg')));
await mkdir(output, { recursive: true });
await writeFile(resolve(output, 'lapki.html'), html);
await writeFile(resolve(output, 'START.txt'), 'ЛАПКИ — ЛОКАЛЬНЫЙ ПРОТОТИП\n\n1. Извлеките все файлы из ZIP-архива.\n2. Откройте lapki.html в Chrome, Edge или Firefox.\n\nNode.js, установка и сервер не нужны. Начальные идеи демонстрационные.\nПравки сохраняются в браузере; не переносите HTML в другую папку после начала работы — браузер может использовать для неё отдельное хранилище.\nКнопки Instagram открывают внешний сайт и требуют подключения к интернету. Автопоиск и генерация ИИ не подключены.\n\nФотографии: github.com/jigsawpieces/dog-api-images, commit b91f6b18eb36a1d5cc67b6f848987a84cc12ddde. Копия лицензии включена в архив.\n');
await writeFile(resolve(output, 'LICENSE-photos.txt'), await readFile(resolve(dist, 'images', 'LICENSE-dog-api-images.txt')));
execFileSync('python', ['-c', `import zipfile, pathlib
root=pathlib.Path(${JSON.stringify(output)})
with zipfile.ZipFile(root/'lapki.zip','w',zipfile.ZIP_DEFLATED) as z:
 for name in ['lapki.html','START.txt','LICENSE-photos.txt']:
  z.write(root/name,name)
`]);
console.log(`Standalone app: ${resolve(output, 'lapki.html')}`);
console.log(`Download archive: ${resolve(output, 'lapki.zip')}`);

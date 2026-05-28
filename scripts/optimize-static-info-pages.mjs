import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const infoPagePaths = [
  'about/index.html',
  'contact/index.html',
  'privacy/index.html',
]

const outDir = join(process.cwd(), 'out')

const removableScriptPatterns = [
  /<script\s+src="\/_next\/static\/chunks\/[^"]+"\s+async=""><\/script>/g,
  /<script>self\.__next_f\.push\(\[[\s\S]*?<\/script>/g,
]

const removableLinkPatterns = [
  /<link\s+rel="preload"\s+as="script"\s+fetchPriority="low"\s+href="\/_next\/static\/chunks\/[^"]+"\/>/g,
]

const optimizeHtml = (html) => {
  let optimized = html

  for (const pattern of removableScriptPatterns) {
    optimized = optimized.replace(pattern, '')
  }

  for (const pattern of removableLinkPatterns) {
    optimized = optimized.replace(pattern, '')
  }

  return optimized
}

for (const relativePath of infoPagePaths) {
  const filePath = join(outDir, relativePath)
  const html = await readFile(filePath, 'utf8')
  const optimized = optimizeHtml(html)
  await writeFile(filePath, optimized)
}

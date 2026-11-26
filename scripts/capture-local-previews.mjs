import fs from 'node:fs/promises'
import path from 'node:path'

const port = process.argv[2] || '9224'
const baseUrl = process.argv[3] || 'http://127.0.0.1:4173'
const outputDirectory = path.resolve('.artifacts', 'previews', 'final-approval')

await fs.mkdir(outputDirectory, { recursive: true })

const target = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(`${baseUrl}/carnaval`)}`, { method: 'PUT' })
  .then((response) => response.json())
const socket = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true })
  socket.addEventListener('error', reject, { once: true })
})

let nextId = 0
const pending = new Map()
const consoleErrors = []
socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data)
  if (message.method === 'Runtime.exceptionThrown') consoleErrors.push(message.params.exceptionDetails?.text || 'Runtime exception')
  if (message.method === 'Log.entryAdded' && ['error', 'warning'].includes(message.params.entry?.level)) {
    consoleErrors.push(`${message.params.entry.level}: ${message.params.entry.text}`)
  }
  const handler = pending.get(message.id)
  if (!handler) return
  pending.delete(message.id)
  handler(message)
})

function command(method, params = {}) {
  const id = ++nextId
  socket.send(JSON.stringify({ id, method, params }))
  return new Promise((resolve) => pending.set(id, resolve))
}

async function evaluate(expression) {
  const response = await command('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  if (response.result?.exceptionDetails) throw new Error(response.result.exceptionDetails.text)
  return response.result?.result?.value
}

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))

async function waitFor(expression, timeout = 12000) {
  const started = Date.now()
  while (Date.now() - started < timeout) {
    if (await evaluate(expression)) return
    await wait(150)
  }
  throw new Error(`Timed out waiting for: ${expression}`)
}

async function setViewport(width, height, mobile = false) {
  await command('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile,
    screenWidth: width,
    screenHeight: height,
  })
}

async function navigate(relativeUrl, locale) {
  await command('Page.navigate', { url: `${baseUrl}${relativeUrl}` })
  await waitFor("document.readyState === 'complete'")
  if (locale) await waitFor(`document.documentElement.lang === ${JSON.stringify(locale)}`)
  await wait(1200)
}

async function screenshot(name) {
  const response = await command('Page.captureScreenshot', { format: 'png', fromSurface: true })
  const outputPath = path.join(outputDirectory, `${name}.png`)
  await fs.writeFile(outputPath, Buffer.from(response.result.data, 'base64'))
  return outputPath
}

async function snapshot(name) {
  return {
    name,
    lang: await evaluate('document.documentElement.lang'),
    dir: await evaluate('document.documentElement.dir'),
    title: await evaluate('document.title'),
    heading: await evaluate("document.querySelector('h1')?.textContent?.replace(/\\s+/g, ' ').trim() || ''"),
    carouselSlides: await evaluate("document.querySelectorAll('[aria-roledescription=carousel] [aria-current=true]').length"),
  }
}

await command('Page.enable')
await command('Runtime.enable')
await command('Log.enable')

const results = []
await setViewport(1440, 900)
await navigate('/carnaval?localePreview=en-AU', 'en-AU')
await waitFor("document.querySelectorAll('[aria-roledescription=carousel] button[aria-label^=\"Slide \"]').length === 5")
for (let slide = 1; slide <= 5; slide += 1) {
  await evaluate(`(() => { const button = [...document.querySelectorAll('button')].find((item) => item.getAttribute('aria-label') === 'Slide ${slide} of 5'); button?.click(); return Boolean(button); })()`)
  await wait(1950)
  await screenshot(`carnaval-header-slide-${slide}`)
}
results.push(await snapshot('carnaval-desktop'))

await setViewport(390, 844, true)
await navigate('/carnaval?localePreview=en-AU', 'en-AU')
await evaluate("[...document.querySelectorAll('button')].find((item) => item.getAttribute('aria-label') === 'Slide 3 of 5')?.click()")
await wait(1950)
await screenshot('carnaval-header-mobile')
results.push(await snapshot('carnaval-mobile'))

await setViewport(1440, 900)
await navigate('/carnaval?localePreview=pt-BR&visualReview=language', 'pt-BR')
await screenshot('carnaval-language-selector-open')
results.push(await snapshot('carnaval-language-selector'))

const report = { baseUrl, screenshots: 7, consoleErrors, results }
await fs.writeFile(path.join(outputDirectory, 'smoke-results.json'), `${JSON.stringify(report, null, 2)}\n`)
console.log(JSON.stringify(report, null, 2))
socket.close()

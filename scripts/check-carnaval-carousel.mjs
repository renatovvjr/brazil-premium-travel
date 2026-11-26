const port = process.argv[2] || '9224'
const url = process.argv[3] || 'http://127.0.0.1:4173/carnaval?localePreview=en-AU'
const target = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' }).then((response) => response.json())
const socket = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((resolve) => socket.addEventListener('open', resolve, { once: true }))

let nextId = 0
const pending = new Map()
socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data)
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
  const response = await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  return response.result?.result?.value
}

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))
await command('Page.enable')
await command('Runtime.enable')
await command('Page.navigate', { url })
await wait(2500)

const slideCount = await evaluate("document.querySelectorAll('[aria-roledescription=carousel] button[aria-label^=\"Slide \"]').length")
const before = await evaluate("document.querySelector('[aria-current=true]')?.getAttribute('aria-label')")
await evaluate("[...document.querySelectorAll('button')].find((item) => item.getAttribute('aria-label') === 'Slide 3 of 5')?.click()")
await wait(500)
const manual = await evaluate("document.querySelector('[aria-current=true]')?.getAttribute('aria-label')")

const result = {
  slideCount,
  before,
  manual,
  manualControlWorked: before !== manual,
}
console.log(JSON.stringify(result, null, 2))
socket.close()
if (result.slideCount !== 5 || !result.manualControlWorked) process.exitCode = 1

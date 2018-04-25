const puppeteer = require('puppeteer')
const debug = require('debug')('sprint-helper:cryptpad')

// Shows the chrome window + adds a small delay between actions
// 0 seconds without devmode, 26 seconds with
const devMode = process.env.DEV_MODE || false

module.exports = (templateToWrite) => new Promise(async (resolve) => {
  debug('Starting browser to create cryptpad')
  const browser = await puppeteer.launch({
    slowMo: devMode ? 5 : 0,
    headless: !devMode,
    args: ['--no-sandbox']
  })
  debug('Browser started')
  const page = await browser.newPage()
  await page.goto('https://cryptpad.fr/code/', {waitUntil: 'networkidle2'})
  debug('Page load done')
  const frames = await page.frames()
  let padFrame = null
  frames.forEach((f) => {
    if (f.name() === 'sbox-iframe') {
      padFrame = f
    }
  })
  if (!padFrame) {
    throw new Error('did not find a pad frame')
  }
  debug('Found padFrame and waiting for load to finish')
  const spinner = await padFrame.$('.cp-toolbar-spinner')
  let isReady = false
  let didGetReady = false
  const interval = setInterval(async () => {
    const text = await spinner.getProperty('innerText')
    devMode && console.log(text._remoteObject.value)
    isReady = text._remoteObject.value === 'Saved'
    debug('Waiting for load to finish', {isReady, didGetReady})
    if (isReady && !didGetReady) {
      didGetReady = true
      clearInterval(interval)
      debug('Load finished, filling out template')
      const codeEl = await padFrame.$('.CodeMirror-code')
      await codeEl.click()
      await page.keyboard.down('Control')
      await page.keyboard.press('KeyA')
      await page.keyboard.up('Control')
      // TODO doesn't deal well with the automatic formatting that cryptpad has
      await page.keyboard.type(templateToWrite)
      debug('Text entered, saving')

      const savingInterval = setInterval(async () => {
        const spinnerText = await spinner.getProperty('innerText')
        devMode && console.log(spinnerText._remoteObject.value)
        const isSaved = spinnerText._remoteObject.value === 'Saved'
        debug('Waiting for pad to get saved', isSaved)
        let didGetSaved = false
        if (isSaved && !didGetSaved) {
          clearInterval(savingInterval)
          debug('Pad saved, grabbing page URL')
          didGetSaved = true
          if (devMode) {
            // Takes screenshot of what we're currently seeing, useful for making
            // sure we're creating the cryptpad correctly
            await page.screenshot({path: (new Date()).toISOString() + 'cryptpad.png'})
          }
          const url = await page.evaluate('location.href')
          debug('Got URL', url)
          devMode && console.log(url)
          debug('Closing page')
          await page.close()
          debug('Closing browser')
          await browser.close()
          resolve(url)
        }
      }, 300)
    }
  }, 300)
})

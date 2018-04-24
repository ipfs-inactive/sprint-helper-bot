const puppeteer = require('puppeteer')

// Shows the chrome window + adds a small delay between actions
// 0 seconds without devmode, 26 seconds with
const devMode = process.env.DEV_MODE || false

module.exports = (templateToWrite) => new Promise(async (resolve) => {
  const browser = await puppeteer.launch({
    slowMo: devMode ? 5 : 0,
    headless: !devMode,
    args: ['--no-sandbox']
  })
  const page = await browser.newPage()
  await page.goto('https://cryptpad.fr/code/', {waitUntil: 'networkidle2'})
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
  const spinner = await padFrame.$('.cp-toolbar-spinner')
  let isReady = false
  let didGetReady = false
  const interval = setInterval(async () => {
    const text = await spinner.getProperty('innerText')
    devMode && console.log(text._remoteObject.value)
    isReady = text._remoteObject.value === 'Saved'
    if (isReady && !didGetReady) {
      didGetReady = true
      clearInterval(interval)
      const codeEl = await padFrame.$('.CodeMirror-code')
      await codeEl.click()
      await page.keyboard.down('Control')
      await page.keyboard.press('KeyA')
      await page.keyboard.up('Control')
      await page.keyboard.type(templateToWrite)

      const savingInterval = setInterval(async () => {
        const spinnerText = await spinner.getProperty('innerText')
        devMode && console.log(spinnerText._remoteObject.value)
        const isSaved = spinnerText._remoteObject.value === 'Saved'
        let didGetSaved = false
        if (isSaved && !didGetSaved) {
          clearInterval(savingInterval)
          didGetSaved = true
          if (devMode) {
            // Takes screenshot of what we're currently seeing, useful for making
            // sure we're creating the cryptpad correctly
            await page.screenshot({path: (new Date()).toISOString() + 'cryptpad.png'})
          }
          const url = await page.evaluate('location.href')
          devMode && console.log(url)
          await page.close()
          await browser.close()
          resolve(url)
        }
      }, 300)
    }
  }, 300)
})

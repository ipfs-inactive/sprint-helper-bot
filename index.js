const irc = require('irc')
const parse = require('shell-quote').parse
const isUrl = require('is-url')
const isNumber = require('is-number')
const stringLength = require('string-length')

const channel = '#ipfs'
const botName = 'sprint-helper'
const client = new irc.Client('irc.freenode.net', botName, {
    channels: [channel],
    port: process.env.PORT || 6667,
    debug: true
})

client.addListener('message', function (from, to, message) {
  message = parse(message)

  if (to === channel && message[0].slice(0, botName.length) === botName) {
    const topic = (message[1] && typeof message[1] === 'string') ? message[1] : null
    const sprintIssue = (message[2] && isNumber(message[2])) ? message[2] : null
    const notes = (message[3] && isUrl(message[3])) ? message[3] : null
    const zoom = (message[4] && isUrl(message[4])) ? message[4] : null
    const stream = (message[5] && typeof message[5] === 'string') ? message[5] : null

    // TODO This is not an elegant way to test these
    if (topic != null && sprintIssue != null && notes != null && zoom != null && stream != null) {
      var header = `========================= IPFS Sprint: ${topic} =========================`
      client.say(channel, `
${header}
Topic: ${topic}
Sprint Issue: https://github.com/ipfs/pm/issues/${sprintIssue}
Notes: ${notes}
Join Call: ${zoom}
Watch Stream: ${stream}
${Array(stringLength(header) - 3).join('=')}`)
    } else {
      // TODO make the correct usage more intelligent
      client.say(channel, `
Correct usage: ${botName}: <topic name> <github sprint issue number> <notes url> <zoom url> <stream url>`)
    }
  }
})

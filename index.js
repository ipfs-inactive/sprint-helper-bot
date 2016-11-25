const irc = require('irc')
const parse = require('shell-quote').parse
const isUrl = require('is-url')
const url = require('url')
const isNumber = require('is-number')
const stringLength = require('string-length')

const channel = '#sprinthelper'
const botName = 'sprint-helper1'
const client = new irc.Client('irc.freenode.net', botName, {
    channels: [channel],
    port: process.env.PORT || 6667
})

function validateInput (message) {
  return {
    topic: (message[1] && typeof message[1] === 'string') ? message[1] : null,
    sprintIssue: (message[2] && isNumber(message[2])) ? `https://github.com/ipfs/pm/issues/${message[2]}`
      : (message[2] && url.parse(message[2]).hostname === 'github.com') ? message[2]
      : null,
    notes: (message[3] && isUrl(message[3])) ? message[3] : null,
    zoom: (message[4] && isUrl(message[4])) ? message[4] : null,
    stream: (message[5] && typeof message[5] === 'string') ? message[5] : null
  }
}

function checkAllArgs (message) {
  return (message.topic !== null &&
    message.sprintIssue !== null &&
    message.notes !== null &&
    message.zoom !== null &&
    message.stream !== null)
}

client.addListener('message', function (from, to, message) {
  message = parse(message)

  if (to === channel && message[0].slice(0, botName.length) === botName) {
    message = validateInput(message)
    if (checkAllArgs(message)) {
      var header = `========================= IPFS Sprint: ${message.topic} =========================`
      client.say(channel, `
${header}
Topic: ${message.topic}
Sprint Issue: ${message.sprintIssue}
Notes: ${message.notes}
Join Call: ${message.zoom}
Watch Stream: ${message.stream}
${Array(stringLength(header) - 3).join('=')}`)
    } else {
      // TODO make the correct usage more intelligent
      client.say(channel, `
Correct usage: ${botName}: <topic name> <github sprint issue number> <notes url> <zoom url> <stream url>
Feedback: https://github.com/RichardLitt/ipfs-sprint-helper`)
    }
  }
})

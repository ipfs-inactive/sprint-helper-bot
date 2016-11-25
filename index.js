const irc = require('irc')
const parse = require('shell-quote').parse
const stringLength = require('string-length')

const channel = '#sprinthelper'
const botName = 'sprint-helper1'

const validateInput = require('./validate').validateInput

const client = new irc.Client('irc.freenode.net', botName, {
    channels: [channel],
    port: process.env.PORT || 6667
})

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
Correct usage: ${botName}: <topic name> <github url (or issue no.)> <notes url> <zoom url> <stream url (or message)>
Feedback: https://github.com/RichardLitt/ipfs-sprint-helper`)
    }
  }
})

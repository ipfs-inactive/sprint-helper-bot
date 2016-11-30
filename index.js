const irc = require('irc')
const parse = require('shell-quote').parse
const stringLength = require('string-length')

const channel = '#ipfs'
const botName = 'sprint-helper'

const valid = require('./validate')

const client = new irc.Client('irc.freenode.net', botName, {
    channels: [channel],
    port: 6667
})

client.addListener('message', function (from, to, message) {
  message = parse(message)

  if (to === channel) {
    message = valid.validateMessage(message, botName)
    if (message && valid.checkAllArgs(message)) {
      var header = `========================= IPFS Sprint: ${message.topic} =========================`
      client.say(channel, `
${header}
Topic: ${message.topic}
Sprint Issue: ${message.sprintIssue}
Notes: ${message.notes}
Join Call: ${message.zoom}
Watch Stream: ${message.stream}
${Array(stringLength(header) - 3).join('=')}`)
    } else if (message) {
      var usageMsg = `Correct usage: ${botName}: <topic name> <sprint issue> <notes> <zoom> <stream url or message>`
      var feedback = `Feedback: https://github.com/RichardLitt/ipfs-sprint-helper`

      if (message.error) {
        client.say(channel, [`
Error: Wrong amount of arguments.`, usageMsg, feedback].join('\n'))
      } else {
        client.say(channel, [usageMsg, feedback].join('\n'))
      }
    }
  }
})

const irc = require('irc')
const botName = process.env.SPRINT_HELPER_NAME || 'sprint-helper'
const channel = process.env.SPRINT_HELPER_CHANNEL || '#ipfs'
const client = new irc.Client('irc.freenode.net', botName, {
    channels: [channel],
    port: 6667
})
const sprintHelper = require('./')
var cron = require('node-cron')
const parse = require('shell-quote').parse
const Slack = require('node-slack')
const slack = new Slack(process.env.SLACK_HOOK_URL, {})

client.addListener('message', function (from, to, message) {
  sprintHelper(message, botName, (err, data) => {
    if (err) {
      console.log(err)
    }

    if (to === channel && data) {
      client.say(channel, [data])

      // Put the stuff in our slack channel, too.
      if (parse(message)[1] === 'announce') {
        slack.send({
          text: data,
          channel: '#topic-sprint',
          username: 'sprintbot'
        })
      }
    }
  })
})

cron.schedule('*/5 * * * *', function() {
  sprintHelper(`${botName} notify 15`, botName, (err, data) => {
    if (err) {
      console.log(err)
    }

    if (data) {
      client.say(channel, [data])
    }
  })
})

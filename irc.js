const irc = require('irc')
const botName = process.env.SPRINT_HELPER_NAME || 'sprint-helper'
const channel = process.env.SPRINT_HELPER_CHANNEL || '#ipfs'
const client = new irc.Client('irc.freenode.net', botName, {
    channels: [channel],
    port: 6667
})
const sprintHelper = require('./')
var cron = require('node-cron');

client.addListener('message', function (from, to, message) {
  sprintHelper(message, botName, (err, data) => {
    if (err) {
      console.log(err)
    }

    if (to === channel && data) {
      client.say(channel, [data])
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

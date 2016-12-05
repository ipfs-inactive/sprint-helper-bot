const irc = require('irc')
const parse = require('shell-quote').parse
const stringLength = require('string-length')
const _ = require('lodash')
const moment = require('moment')
const PublicGcal = require('public-gcal')
const valid = require('./validate')

const channel = '#ipfss'
const botName = 'sprint-helper'
const API_key = process.env.IPFS_CALENDAR_API
const calendarID = 'ipfs.io_eal36ugu5e75s207gfjcu0ae84@group.calendar.google.com'

const gcal = new PublicGcal({API_key: API_key, calendarId: calendarID})
const client = new irc.Client('irc.freenode.net', botName, {
    channels: [channel],
    port: 6667
})

client.addListener('message', function (from, to, message) {
  message = parse(message)

  if (to === channel) {
    message = valid.validateMessage(message, botName)

    if (message && message.type === 'next') {
      gcal.getEvents({timeMin: moment(new Date()).toISOString(), timeMax: moment(new Date()).add(1, "week").toISOString()}, function (error, result) {
        if (error) { return console.log(error) }

        var todaysEvents = _.filter(result, function(event) {
          return moment(event.start.dateTime).isSame(new Date(), "day")
        })

        // TODO If event is going on right now, note that if asked
        var currentEvent = _.filter(todaysEvents, function(event) {
          return moment(event.start.dateTime).isBefore(moment(new Date()))
        })

        // If there is an event in the future, note when that is
        if (todaysEvents) {
          if (todaysEvents.length > 1 && currentEvent.length !== 0) {
            client.say(channel, [`The next event is "${todaysEvents[1].summary}", ${moment(todaysEvents[1].start.dateTime).fromNow()}.`])
          } else {
            client.say(channel, ['There are no more events today.'])
          }
        }
      })

    }

    if (message && message.type === 'template' && valid.checkAllArgs(message)) {
      var header = `========================= IPFS Sprint: ${message.topic} =========================`
      client.say(channel, `
${header}
Topic: ${message.topic}
Sprint Issue: ${message.sprintIssue}
Notes: ${message.notes}
Join Call: ${message.zoom}
Watch Stream: ${message.stream}
${Array(stringLength(header) - 3).join('=')}`)
    } else if (message && message.type === 'error') {
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

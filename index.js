const irc = require('irc')
const parse = require('shell-quote').parse
const stringLength = require('string-length')
const _ = require('lodash')
const moment = require('moment')
const PublicGcal = require('public-gcal')
const valid = require('./validate')

const channel = process.env.SPRINT_HELPER_CHANNEL || '#ipfs'
const botName = process.env.SPRINT_HELPER_NAME || 'sprint-helper'
const API_key = process.env.IPFS_CALENDAR_API
const calendarID = 'ipfs.io_eal36ugu5e75s207gfjcu0ae84@group.calendar.google.com'

const gcal = new PublicGcal({API_key: API_key, calendarId: calendarID})
const client = new irc.Client('irc.freenode.net', botName, {
    channels: [channel],
    port: 6667
})
var usageMsg

client.addListener('message', function (from, to, message) {
  message = parse(message)

  if (to === channel) {
    // This is silly.
    if (message[0] === '!botsnack') {
      return client.say(channel, [`om nom nom`])
    }

    message = valid.validateMessage(message, botName)

    if (message && message.error === 'Unrecognized command!') {
      usageMsg = `Correct usage: ${botName}: announce <args> | next | now | tomorrow | help`
      return client.say(channel, [`Error: ${message.error}`, usageMsg].join('\n'))
    }

    if (message && message.error === 'Not enough arguments!') {
      usageMsg = `Correct usage: ${botName}: announce <topic name> <sprint issue> <notes> <zoom> <stream url or message>`
      return client.say(channel, [`Error: ${message.error}`, usageMsg].join('\n'))
    }

    if (message && valid.commands.includes(message.type)) {
      if (message.type === 'botsnack') {
        return client.say(channel, [`om nom nom`])
      }

      if (message.type === 'help') {
        usageMsg = `Correct usage: ${botName}: announce <args> | next | now | tomorrow | help`
        return client.say(channel, [usageMsg, `Feedback: https://github.com/RichardLitt/ipfs-sprint-helper`].join('\n'))
      }

      gcal.getEvents({timeMin: moment(new Date()).toISOString(), timeMax: moment(new Date()).add(1, 'week').toISOString()}, function (error, result) {
        if (error) { return console.log(error) }

        var todaysEvents = _.filter(result, function (event) {
          return moment(event.start.dateTime).isSame(new Date(), 'day') && moment(event.end.dateTime).isAfter(new Date())
        })

        // TODO If event is going on right now, note that if asked
        var currentEvent = _.filter(todaysEvents, function (event) {
          return moment(event.start.dateTime).isBefore(moment(new Date())) && moment(event.end.dateTime).isAfter(new Date())
        })

        if (message.type === 'tomorrow') {
          var tomorrow = _.filter(result, function (event) {
            return moment(event.start.dateTime).add(1, 'days').isSame(new Date(), 'day')
          })

          if (tomorrow.length === 0) {
            return client.say(channel, [`There are no planned events tomorrow.`])
          } else if (tomorrow.length === 1) {
            return client.say(channel, [`There is ${tomorrow.length} event tomorrow: "${tomorrow[0].summary}" at ${moment(tomorrow[0].start.dateTime, 'HH:mm')}.`])
          } else if (tomorrow.length > 1) {
            return client.say(channel, [`There are ${tomorrow.length} events tomorrow.
            The first is "${tomorrow[0].summary}" at ${moment(tomorrow[0].start.dateTime, 'HH:mm')}.`])
          }
        }

        if (message.type === 'now') {
          if (currentEvent.length === 0) {
            client.say(channel, [`Nothing is currently happening.`])
          } else {
            client.say(channel, [`The current event is "${currentEvent[0].summary}", which started ${moment(currentEvent[0].start.dateTime).fromNow()} and ends ${moment(currentEvent[0].end.dateTime).fromNow()}.`])
          }
        }

        // If there is an event in the future, note when that is
        if (message.type === 'next' && todaysEvents) {
          if (todaysEvents.length > 1 || todaysEvents.length === 1 && currentEvent.length === 0) {
            if (currentEvent.length === 1) {
              client.say(channel, [`The next event is "${todaysEvents[1].summary}", ${moment(todaysEvents[1].start.dateTime).fromNow()}.`])
              client.say(channel, [`Right now, "${currentEvent[0].summary}" is happening.`])
            } else if (currentEvent.length === 0) {
              client.say(channel, [`The next event is "${todaysEvents[0].summary}", ${moment(todaysEvents[0].start.dateTime).fromNow()}.`])
            }
          } else {
            client.say(channel, ['There are no more events today.'])
          }
        }
      })
    }

    if (message && message.type === 'announce') {
      if (valid.checkAllArgs(message)) {
        var header = `========================= IPFS Sprint: ${message.topic} =========================`
        return client.say(channel, `
${header}
Topic: ${message.topic}
Sprint Issue: ${message.sprintIssue}
Notes: ${message.notes}
Join Call: ${message.zoom}
Watch Stream: ${message.stream}
${Array(stringLength(header) - 3).join('=')}`)
      } else {
        usageMsg = `Correct usage: ${botName}: announce <topic name> <sprint issue> <notes> <zoom> <stream url or message>`
        return client.say(channel, `Error: Not all args are valid.
${usageMsg}`)
      }
    }
  }
})

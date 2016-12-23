const isNumber = require('is-number')
const isUrl = require('is-url')
const url = require('url')
const commands = ['announce', 'next', 'now', 'botsnack', 'tomorrow', 'help', 'notify']

function validateMessage (message, botName) {
  if (typeof message[0] === 'object' || message[0].slice(0, botName.length) !== botName) {
    return
  }

  if (message[1] === 'announce') {
    if (message.length !== 7) {
      return {
        type: 'error',
        error: 'Not enough arguments!'
      }
    }

    // shell-quote will escape ? by making it an object with the URL being in pattern
    // This fixes that possibility
    for (var i = 0; i < message.length; i++) {
      if (message[i] && message[i].pattern) {
        message[i] = message[i].pattern
      }
    }

    return {
      type: 'announce',
      topic: (message[2] && typeof message[2] === 'string') ? message[2] : null,
      sprintIssue: (message[3] && isNumber(message[3])) ? `https://github.com/ipfs/pm/issues/${message[3]}`
        : (message[3] && url.parse(message[3]).hostname === 'github.com') ? message[3]
        : null,
      notes: (message[4] && isUrl(message[4])) ? message[4] : null,
      zoom: (message[5] && isUrl(message[5])) ? message[5] : null,
      stream: message[6]
    }
  }

  if (message[1] === 'notify') {
    if (typeof parseInt(message[2]) === 'number') {
      return {
        type: message[1],
        time: message[2]
      }
    }
  }

  if (commands.includes(message[1])) {
    return {
      type: message[1]
    }
  }

  return {
    type: 'error',
    error: 'Unrecognized command!'
  }
}

function checkAllArgs (message) {
  if (message.error) {
    return false
  }
  return (message.topic !== null &&
    message.sprintIssue !== null &&
    message.notes !== null &&
    message.zoom !== null &&
    message.stream !== null)
}

module.exports = {
  validateMessage: validateMessage,
  checkAllArgs: checkAllArgs,
  commands: commands
}

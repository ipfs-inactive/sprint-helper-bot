const isNumber = require('is-number')
const isUrl = require('is-url')
const url = require('url')

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

module.exports = {
  validateInput: validateInput
}

#!/usr/bin/env node
'use strict'

const meow = require('meow')
const sprintHelper = require('./')

const cli = meow([`
  Usage
    $ name-your-contributors <input> [opts]

  Options
    --botname, -b Set the bot name

  Examples
    $ sprint-helper -b 'sprint-helper' 'this is a message'
`, {
  alias: {
    b: 'botname'
  }
}])

const botName = cli.flags.b || process.env.SPRINT_HELPER_NAME || 'sprint-helper'

sprintHelper(`${botName} ${cli.input.join(' ')}`, botName, (err, data) => {
  if (err) {
    throw new Error(err)
  }

  console.log(data)
})

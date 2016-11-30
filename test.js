/* global describe, it */
const assert = require('assert')
const validateMessage = require('./validate').validateMessage
const checkAllArgs = require('./validate').checkAllArgs
const parse = require('shell-quote').parse

const botName = 'sprint-helper'
const input = [
  'sprint-helper',
  'Title name',
  '827',
  'http://hackmd.io',
  'http://zoom.us/call/21880801',
  'https://www.youtube.com/watch?v=ZZ5LpwO-An4'
]

describe('validate.validateMessage', () => {
  it('checks that sprint-helper was mentioned', () => {
    input[0] = 'not-sprint-helper'
    const output = validateMessage(input, botName)
    assert.equal(output, null)
    input[0] = 'sprint-helper'
  })

  it('checks that there are 6 arguments', () => {
    const output = validateMessage(parse(input.slice(0, 4).join(' ')), botName)
    assert.equal(output.error, 'Not enough arguments!')
  })

  it('uses parse to correctly parse arguments', () => {
    input[1] = '"Title name"'
    input = parse(input.join(' '))
    const output = validateMessage(input, botName)
    assert.equal(output.topic, '"Title name"')
  })

  it('checks that topic exists', () => {
    input[1] = null
    const output = validateMessage(input, botName)
    assert.equal(output.topic, null)
    input[1] = 'Title name'
  })

  it('writes the right topic', () => {
    const output = validateMessage(input, botName)
    assert.equal(output.topic, 'Title name')
  })

  it('checks that issue number exists', () => {
    input[2] = null
    const output = validateMessage(input, botName)
    assert.equal(output.sprintIssue, null)
    input[2] = '827'
  })

  it('adds the issue number to a github link', () => {
    const output = validateMessage(input, botName)
    assert.equal(output.sprintIssue, 'https://github.com/ipfs/pm/issues/827')
  })

  it('checks the github link is a url', () => {
    input[2] = 'https://github.com/ipfs/pm/issues/827'
    const output = validateMessage(input, botName)
    assert.equal(output.sprintIssue, 'https://github.com/ipfs/pm/issues/827')
  })

  it('writes the right github link if given a url', () => {
    const output = validateMessage(input, botName)
    assert.equal(output.sprintIssue, 'https://github.com/ipfs/pm/issues/827')
  })

  it('checks that notes exists', () => {
    input[3] = null
    const output = validateMessage(input, botName)
    assert.equal(output.notes, null)
    input[3] = 'https://hackmd.io'
  })

  it('checks that notes is a url', () => {
    input[3] = 'string'
    const output = validateMessage(input, botName)
    assert.equal(output.notes, null)
    input[3] = 'https://hackmd.io'
  })

  it('allows a valid notes url', () => {
    input[3] = 'https://hackmd.io/IwUw7AHAnFDMIFoDGAGArFBAWMWCGCUwATImACZLnQoRp4RJA==='
    const output = validateMessage(input, botName)
    assert.equal(output.notes, 'https://hackmd.io/IwUw7AHAnFDMIFoDGAGArFBAWMWCGCUwATImACZLnQoRp4RJA===')
  })

  it('checks that zoom exists', () => {
    input[4] = null
    const output = validateMessage(input, botName)
    assert.equal(output.zoom, null)
    input[4] = 'http://zoom.us/call/21880801'
  })

  it('allows a valid zoom link', () => {
    const output = validateMessage(input, botName)
    assert.equal(output.zoom, 'http://zoom.us/call/21880801')
  })

  it('checks that zoom is a url', () => {
    input[4] = 'string'
    const output = validateMessage(input, botName)
    assert.equal(output.zoom, null)
    input[4] = 'http://zoom.us/call/21880801'
  })

  it('checks that stream exists', () => {
    input[5] = null
    const output = validateMessage(input, botName)
    assert.equal(output.stream, null)
    input[5] = 'https://youtube.com/watch?v=SWBkneyTyPU'
  })

  it('allows a valid youtube link', () => {
    const output = validateMessage(input, botName)
    assert.equal(output.stream, 'https://youtube.com/watch?v=SWBkneyTyPU')
  })

  it('checks for a possible glob', () => {
    input[1] = '"Title name"'
    const output = validateMessage(parse(input.join(' ')), botName)
    assert.equal(output.stream, 'https://youtube.com/watch?v=SWBkneyTyPU')
  })

  it('allows a string note', () => {
    input[5] = 'string'
    const output = validateMessage(input, botName)
    assert.equal(output.stream, 'string')
  })
})

describe('validate.checkAllArgs', () => {
  it('checks that all args are present', () => {
    const output = checkAllArgs(validateMessage(input, botName))
    assert(output, 'all args are present')
  })

  it('checks if an arg is not present', () => {
    const output = checkAllArgs(validateMessage(input, botName))
    output.notes = null
    assert(output, 'all args are not present')
  })

  it('checks if an arg is false', () => {
    const output = checkAllArgs(validateMessage(input, botName))
    output.notes = false
    assert(output, 'an arg is false')
  })
})

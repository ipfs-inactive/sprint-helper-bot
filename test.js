/* global describe, it */
const assert = require('assert')
const validateInput = require('./validate').validateInput
const checkAllArgs = require('./validate').checkAllArgs

const input = [
  'sprint-helper',
  'Title name',
  '827',
  'http://hackmd.io',
  'http://zoom.us/call/21880801',
  'https://www.youtube.com/watch?v=ZZ5LpwO-An4'
]

describe('validate.validateInput', () => {
  it('checks that topic exists', () => {
    input[1] = null
    const output = validateInput(input)
    assert.equal(output.topic, null)
    input[1] = 'Title name'
  })

  it('writes the right topic', () => {
    const output = validateInput(input)
    assert.equal(output.topic, 'Title name')
  })

  it('checks that issue number exists', () => {
    input[2] = null
    const output = validateInput(input)
    assert.equal(output.sprintIssue, null)
    input[2] = '827'
  })

  it('adds the issue number to a github link', () => {
    const output = validateInput(input)
    assert.equal(output.sprintIssue, 'https://github.com/ipfs/pm/issues/827')
  })

  it('checks the github link is a url', () => {
    const output = validateInput(input)
    assert.equal(output.sprintIssue, 'https://github.com/ipfs/pm/issues/827')
  })

  it('writes the right github link if given a url', () => {
    const output = validateInput(input)
    assert.equal(output.sprintIssue, 'https://github.com/ipfs/pm/issues/827')
  })

  it('checks that notes exists', () => {
    input[3] = null
    const output = validateInput(input)
    assert.equal(output.notes, null)
    input[3] = 'https://hackmd.io'
  })

  it('checks that notes is a url', () => {
    input[3] = 'string'
    const output = validateInput(input)
    assert.equal(output.notes, null)
    input[3] = 'https://hackmd.io'
  })

  it('allows a valid notes url', () => {
    const output = validateInput(input)
    assert.equal(output.notes, 'https://hackmd.io')
  })

  it('checks that zoom exists', () => {
    input[4] = null
    const output = validateInput(input)
    assert.equal(output.zoom, null)
    input[4] = 'http://zoom.us/call/21880801'
  })

  it('allows a valid zoom link', () => {
    const output = validateInput(input)
    assert.equal(output.zoom, 'http://zoom.us/call/21880801')
  })

  it('checks that zoom is a url', () => {
    input[4] = 'string'
    const output = validateInput(input)
    assert.equal(output.zoom, null)
    input[4] = 'http://zoom.us/call/21880801'
  })

  it('checks that stream exists', () => {
    input[5] = null
    const output = validateInput(input)
    assert.equal(output.stream, null)
    input[5] = 'https://www.youtube.com/watch?v=ZZ5LpwO-An4'
  })

  it('allows a valid youtube link', () => {
    const output = validateInput(input)
    assert.equal(output.stream, 'https://www.youtube.com/watch?v=ZZ5LpwO-An4')
  })

  it('allows a string note', () => {
    input[5] = 'string'
    const output = validateInput(input)
    assert.equal(output.stream, 'string')
  })
})

describe('validate.checkAllArgs', () => {
  it('checks that all args are present', () => {
    const output = checkAllArgs(validateInput(input))
    assert(output, 'all args are present')
  })

  it('checks if an arg is not present', () => {
    const output = checkAllArgs(validateInput(input))
    output.notes = null
    assert(output, 'all args are not present')
  })

  it('checks if an arg is false', () => {
    const output = checkAllArgs(validateInput(input))
    output.notes = false
    assert(output, 'an arg is false')
  })
})

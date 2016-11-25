const assert = require('assert')
const validateInput = require('./validate').validateInput

const input = [
  'sprint-helper',
  'Title name',
  '827',
  'http://hackmd.io',
  'http://zoom.us/call/21880801',
  'https://www.youtube.com/watch?v=ZZ5LpwO-An4'
]

describe('ipfs-sprint-helper', () => {
  it('writes the right thing', () => {
    const output = validateInput(input)
    assert.equal(output.topic, 'Title name')
  })
})

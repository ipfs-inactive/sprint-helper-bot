const cron = require('node-cron')
const moment = require('moment')
const debug = require('debug')('sprint-helper:main')

const createIssue = require('./create-issue')

const envVarPrefix = 'SPRINT_HELPER'
const configVars = [
  'REPOSITORY',
  'CRON_SCHEDULE',
  'CRYPTPAD_TEMPLATE',
  'ISSUE_TITLE',
  'ISSUE_TEMPLATE',
  'GITHUB_AUTH_TOKEN'
]

const config = {} // gets filled by envVarsToCheck
configVars.forEach((key) => {
  const envVar = `${envVarPrefix}_${key}`
  if (!process.env[envVar]) {
    throw new Error(`You need to set env var "${envVar}"`)
  }
  config[key] = process.env[envVar]
  if (key !== 'GITHUB_AUTH_TOKEN') {
    debug(`${key}="${config[key]}"`)
  }
})

const isProd = process.env.NODE_ENV === 'production'

const createAllHandsIssue = () => {
  let title = `${config.ISSUE_TITLE} ${moment(moment().day(11)).format('MMM DD')}`
  if (!isProd) {
    title = `[TEST] ${title}`
  }
  createIssue({
    title,
    issue_template: config.ISSUE_TEMPLATE,
    cryptpad_template: config.CRYPTPAD_TEMPLATE,
    repo: config.REPOSITORY,
    labels: ['calls']
  })
}

if (isProd) {
  debug('Starting cron job with schedule', config.CRON_SCHEDULE)
  cron.schedule(config.CRON_SCHEDULE, function () {
    // All Hands are labelled after the day they start, only, on Thursday
    createAllHandsIssue()
  })
} else {
  console.log('single run because NODE_ENV !== `production`')
  debug('Creating one issue because NODE_ENV !== production')
  createAllHandsIssue()
}

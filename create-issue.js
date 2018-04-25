const Octo = require('octokat')
const debug = require('debug')('sprint-helper:create-issue')
const gh = new Octo({
  token: process.env.SPRINT_HELPER_GITHUB_AUTH_TOKEN,
  cacheHandler: {get: () => {}, add: () => {}}
})
const generateCryptpad = require('./generate-cryptpad')

// githubPath should be the format of:
// $org/$repo,$path
// Example: ipfs/pm,templates/all-hands-issue-template.md
const readFile = (githubPath, isJSON = false) => {
  debug('Reading path', githubPath, 'from Github')
  const s = githubPath.split(',')
  const repo = s[0]
  const fileToLoad = s[1]
  debug({repo, fileToLoad})
  const ghContents = gh.repos(repo).contents(fileToLoad)
  if (isJSON) {
    debug('Fetching as JSON')
    return ghContents.read().then((res) => {
      return JSON.parse(res)
    })
  } else {
    debug('Fetching as plaintext')
    return ghContents.read()
  }
}

// This gets the list from the README of the repo, from the section `Facilitators and Notetakers`
function getNewRoles (faciliatorsDataFilePath, lastLead) {
  debug('Getting new roles from file', faciliatorsDataFilePath)
  debug('lastLead', lastLead)
  // TODO replace with faciliatorsDataFilePath
  return readFile(faciliatorsDataFilePath, true)
    .then((res) => {
      debug('received facilitators', res)
      const facilitators = res.map((item) => '@' + item.toLowerCase())
      var numFacilitators = facilitators.length
      if (facilitators.indexOf(lastLead) !== -1) {
        const res = {
          lead: facilitators[(facilitators.indexOf(lastLead) + 1) % numFacilitators],
          notetaker: facilitators[(facilitators.indexOf(lastLead) + 2) % numFacilitators]
        }
        debug('new facilitators', res)
        return res
      } else {
        // If you mess up, restart from the beginning
        debug('Could not find the next facilitators, starting from the beginning')
        const res = {
          lead: facilitators[0],
          notetaker: facilitators[1]
        }
        debug('new facilitators', res)
        return res
      }
    })
}

function getLastLead (repo) {
  debug('Getting last lead in repository', repo)
  return gh.repos(repo).issues.fetch({labels: 'calls', state: 'all'})
  .then((res) => {
    if (!res.items[0]) {
      return Promise.resolve()
    }
    var issue = res.items[0].body
    // TODO replace with env var
    var lastLead = issue.substring(issue.lastIndexOf('All Hands Call')).match(/@[a-zA-Z0-9]*/g)[0]
    return lastLead.toLowerCase()
  })
}

const replaceInString = (str, map) => {
  let out = '' + str
  Object.keys(map).forEach((key) => {
    out = out.replace('$' + key, map[key])
  })
  return out
}

module.exports = async function createIssue (issue) {
  debug('Creating new issue and pad', issue)
  const issueContents = await readFile(issue.issue_template)
  const padContents = await readFile(issue.cryptpad_template)

  const lastLead = await getLastLead(issue.repo)
  const newLeads = await getNewRoles(issue.facilitators_file, lastLead)

  const cryptpadUrl = await generateCryptpad(replaceInString(padContents, {
    DATE: issue.date,
    MODERATOR: newLeads.lead,
    NOTETAKER: newLeads.notetaker
  }))

  const issueBody = replaceInString(issueContents, {
    MODERATOR: newLeads.lead,
    NOTETAKER: newLeads.notetaker,
    CRYPTPAD: cryptpadUrl
  })

  const issueToCreate = {title: issue.title, body: issueBody, labels: issue.labels}
  debug('issueToCreate', issueToCreate)

  return gh.repos(issue.repo).issues.create(issueToCreate)
}

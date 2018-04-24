const Octo = require('octokat')
const debug = require('debug')('sprint-helper:create-issue')
const gh = new Octo({
  token: process.env.SPRINT_HELPER_GITHUB_AUTH_TOKEN
})
const atob = require('atob')
const generateCryptpad = require('./generate-cryptpad')

// githubPath should be the format of:
// $org/$repo,$path
// Example: ipfs/pm,templates/all-hands-issue-template.md
const readFile = (githubPath) => {
  debug('Reading path', githubPath, 'from Github')
  const s = githubPath.split(',')
  const repo = s[0]
  const fileToLoad = s[1]
  debug({repo, fileToLoad})
  return gh.repos(repo).contents(fileToLoad).read()
}

// Takes a issue template, creates a cryptpad with some other template and links it
const cryptpad = (issueTemplate, padTemplate) => new Promise((resolve, reject) => {
  debug('Creating cryptpad from template at ', padTemplate)
  return readFile(padTemplate).then((cryptpadTemplate) => {
    return generateCryptpad(cryptpadTemplate.toString())
  }).then((url) => {
    debug('Created cryptpad', url)
    resolve(issueTemplate.replace('CRYPTPAD', url))
  })
})

// This gets the list from the README of the repo, from the section `Facilitators and Notetakers`
function getNewRoles (repo, lastLead) {
  debug('Getting new roles for repo', repo)
  debug('lastLead', lastLead)
  return gh.repos(repo).readme.fetch()
    .then((res) => {
      var readme = atob(res.content)
      // Dumbly read from the Header to the end of the document, looking for names per line
      // Could be optimized to only look in that section
      var facilitators = readme.substring(readme.lastIndexOf('Facilitators and Notetakers')).match(/\n- @.*/g)
      facilitators = facilitators.map((item) => '@' + item.split('@')[1].toLowerCase())
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
  }).then((lastLead) => {
    return getNewRoles(repo, lastLead)
  })
}

module.exports = function createIssue (issue) {
  debug('Create new issue', issue)
  readFile(issue.issue_template, 'utf8').then((issueTemplate) => {
    return cryptpad(issueTemplate, issue.cryptpad_template)
  }).then((data) => {
    return getLastLead(issue.repo).then((roles) => {
      debug('got new roles', roles)
      data = data.replace(/LEAD/, roles.lead)
      data = data.replace(/NOTER/, roles.notetaker)
      debug('creating issue in ', issue.repo)
      debug('title', issue.title)
      debug('body', data)
      debug('labels', issue.labels)
      return gh.repos(issue.repo).issues
        .create({title: issue.title, body: data, labels: issue.labels})
    })
  }).then((res) => res)
}

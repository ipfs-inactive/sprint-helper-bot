# sprint-bot

## Purpose

- Creates meeting pads (using Cryptpad) with template filled out
- Creates issue linking to the pads on a regular interval (via cron syntax)
- Assigns moderator + notetaker based on previous facilitors

Future tasks:

- Announce before meetings start on IRC
- Setup live-streaming via Youtube automatically (Youtube + Zoom integration)

## Running

- `yarn` to install dependencies (or `npm install` if you like to wait)
- Export all neccessary environment variables from below
- `yarn start` to create one test issue
- `NODE_ENV=production yarn start` to start "cron-mode", it'll only create the issue
  when the cron syntax is triggering it to

## Configuration (environment variables)

Each deployed instance of sprint-bot should have a few different values, as we
have multiple meetings that needs to be scheduled each week.

- `SPRINT_HELPER_REPOSITORY` decides which repository the issue should be created at
- `SPRINT_HELPER_CRON_SCHEDULE` decides how often the issue should be created
- `SPRINT_HELPER_CRYPTPAD_TEMPLATE` decides which template to use for the cryptpad
- `SPRINT_HELPER_ISSUE_TITLE` decides the title of the issue
- `SPRINT_HELPER_ISSUE_TEMPLATE` decides which template to use for creating the issue
- `SPRINT_HELPER_GITHUB_AUTH_TOKEN` is the token for authorizing the issue-creation

Examples values:

- `SPRINT_HELPER_REPOSITORY` = `ipfs/pm`
- `SPRINT_HELPER_CRON_SCHEDULE` = `00 18 * * 1` (At 18:00 on Mondays, see https://crontab.guru)
- `SPRINT_HELPER_CRYPTPAD_TEMPLATE` = `ipfs/pm,templates/all-hands-pad-template.md`
- `SPRINT_HELPER_ISSUE_TITLE` = `All Hands` (The date of the meeting gets appended to the title)
- `SPRINT_HELPER_ISSUE_TEMPLATE` = `ipfs/pm,templates/all-hands-issue-template.md`
- `SPRINT_HELPER_GITHUB_AUTH_TOKEN` = Get it from https://github.com/settings/tokens/new

## Deploy

*TOWRITE*

Basically, setup a git remote pointing to dokku, set the config values from inside
the instance and then push it!

# License

MIT 2018 Protocol Labs

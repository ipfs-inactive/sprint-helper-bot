# sprint-bot

## Purpose

- Creates meeting pads (using Cryptpad) with template filled out
- Creates issue linking to the pads on a regular interval (via cron syntax)
- Assigns moderator + notetaker based on previous facilitors

Future tasks:

- Announce before meetings start on IRC
- Setup live-streaming via Youtube automatically (Youtube + Zoom integration)
- Automatically copy notes back to Github when meeting is over

## Running

- `yarn` to install dependencies (or `npm install` if you like to wait)
- Export all neccessary environment variables from below
- `yarn start` to create one test issue
- `NODE_ENV=production yarn start` to start "cron-mode", it'll only create the issue
  when the cron syntax is triggering it to

## Cron schedule and dates

The cron schedule decides when sprint-helper should create the issue. Since the
date of the meeting is considered 6 days after this date, you should schedule
sprint-helper to run the day after a meeting is supposed to be had.

Notice: The value of "6 days" is currently hardcoded since we only have weekly
meetings. This would have to be adjusted or made into a variable if we have non-weekly
meetings

## Templates

The following templates should exists for sprint-helper to be able to create issues + cryptpad
for you:

- Cryptpad Template. Creates a cryptpad based on this template.
  - Has variables `$MODERATOR`, `$NOTETAKER` and `$DATE`
- Issue Template. Creates the issue based on this template
  - Has variables `$MODERATOR`, `$NOTETAKER` and `$CRYPTPAD`
- Facilitators file. A JSON file with a array of strings, each string is a Github profile
  that can be moderator or notetaker. Should contain people who are at every meeting.

## Configuration (environment variables)

Each deployed instance of sprint-bot should have a few different values, as we
have multiple meetings that needs to be scheduled each week.

- `SPRINT_HELPER_REPOSITORY` decides which repository the issue should be created at
- `SPRINT_HELPER_CRON_SCHEDULE` decides how often the issue should be created
- `SPRINT_HELPER_CRYPTPAD_TEMPLATE` decides which template to use for the cryptpad
- `SPRINT_HELPER_FACILITATORS_FILE` decides which JSON file to grab facilitators from
- `SPRINT_HELPER_ISSUE_TITLE` decides the title of the issue
- `SPRINT_HELPER_ISSUE_TEMPLATE` decides which template to use for creating the issue
- `SPRINT_HELPER_GITHUB_AUTH_TOKEN` is the token for authorizing the issue-creation

Examples values:

- `SPRINT_HELPER_REPOSITORY` = `ipfs/pm`
- `SPRINT_HELPER_CRON_SCHEDULE` = `00 01 * * 2` (At 01:00 on Tuesdays, see https://crontab.guru)
- `SPRINT_HELPER_CRYPTPAD_TEMPLATE` = `ipfs/pm,templates/all-hands-pad-template.md`
- `SPRINT_HELPER_FACILITATORS_FILE` `ipfs/pm,templates/all-hands-facilitators.json`
- `SPRINT_HELPER_ISSUE_TITLE` = `All Hands` (The date of the meeting gets appended to the title)
- `SPRINT_HELPER_ISSUE_TEMPLATE` = `ipfs/pm,templates/all-hands-issue-template.md`
- `SPRINT_HELPER_GITHUB_AUTH_TOKEN` = Get it from https://github.com/settings/tokens/new

## Deploy

In this case, we're deploying sprint-helper for the IPFS all-hands that is every monday.

We'll be using the example values from above, exactly as written (except the Github Token).

First, inside sprint-helper, create a new git remote pointing to our dokku instance.

```
git remote add ipfs-all-hands dokku@cloud.ipfs.team:ipfs-all-hands
git push ipfs-all-hands master
```

Now dokku will try to deploy sprint-helper, but it won't succeed as many config
variables have yet to be set. For this, we need to access the instance and set
the values from there.

```
ssh root@cloud.ipfs.team
# Once inside:
dokku config:set --no-restart ipfs-all-hands SPRINT_HELPER_REPOSITORY="ipfs/pm"
dokku config:set --no-restart ipfs-all-hands SPRINT_HELPER_CRON_SCHEDULE="00 01 * * 2"
dokku config:set --no-restart ipfs-all-hands SPRINT_HELPER_CRYPTPAD_TEMPLATE="ipfs/pm,templates/all-hands-pad-template.md"
dokku config:set --no-restart ipfs-all-hands SPRINT_HELPER_FACILITATORS_FILE="ipfs/pm,templates/all-hands-facilitators.json"
dokku config:set --no-restart ipfs-all-hands SPRINT_HELPER_ISSUE_TITLE="All Hands"
dokku config:set --no-restart ipfs-all-hands SPRINT_HELPER_ISSUE_TEMPLATE="ipfs/pm,templates/all-hands-issue-template.md"
dokku config:set --no-restart ipfs-all-hands SPRINT_HELPER_GITHUB_AUTH_TOKEN=Secretsssss
dokku config:set --no-restart ipfs-all-hands DEBUG="sprint-helper:*"
dokku config:set --no-restart ipfs-all-hands NODE_ENV="production"
```

With the config values now set, we can attempt the deploy again, this time it will (hopefully)
work. Run this locally in the sprint-helper clone directory.

```
git push ipfs-all-hands master
```

And now sprint-helper will automatically create your issues and pads for you!

# License

MIT 2018 Protocol Labs

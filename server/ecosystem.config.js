module.exports = {
    apps: [
        {
            name: 'server-jira-api',
            script: 'npm',
            args: 'pm2:start',
            interpreter: 'none',
        },
    ],
}
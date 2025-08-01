module.exports = {
  apps: [{
    name: 'boi-gordo-investimentos',
    script: 'npm',
    args: 'run dev',
    watch: false,
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    instances: 1,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    restart_delay: 4000
  }]
}
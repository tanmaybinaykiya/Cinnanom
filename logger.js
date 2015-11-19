var winston = require('winston');
var winstonDaily = require('winston-daily-rotate-file');
var path = require('path');

var logger = module.exports = new(winston.Logger)({
    transports: [
        new winston.transports.Console({
            level: 'info',
            colorize: true
        }),
        new winstonDaily({
          name: 'info-logs',
          datePattern: '.yyyy-MM-ddTHH',
          filename: path.join(__dirname, "logs", "grep-info.log"),
          level: 'info',
          colorize: true
        }),
        new winstonDaily({
          name: 'error-logs',
          datePattern: '.yyyy-MM-ddTHH',
          filename: path.join(__dirname, "logs", "grep-error.log"),
          level: 'error',
          colorize: true
        })
    ]
});

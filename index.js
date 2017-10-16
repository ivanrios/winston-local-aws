exports.awsCloudTailLogger =  function(configFile){

  var winston = require('winston'); 
  var expressWinston = require('winston-express-middleware');
  var fs = require('fs');
  var AWS = require('aws-sdk');
  var smartInfo = require('smart-info');


  var config = JSON.parse(fs.readFileSync(configFile)) || {};
  var info = smartInfo.info(true);


  if ( !fs.existsSync( config.logFolder ) )       
    fs.mkdirSync( config.logFolder );

  var localTransporterLog   = new winston.transports.File({ filename: config.logFolder + '/logs.log', timestamp: true, maxsize: 1000000 })
  var localTransporterError = new winston.transports.File({ filename: config.logFolder + '/error.log', timestamp: true, maxsize: 1000000 })

  var logTransporters = [localTransporterLog];
  var errorTransporters = [localTransporterError];

  if (config.awsConfig){
    AWS.config.region = "us-west-2" ;
    AWS.config.update(config.awsConfig);
    var awsCloud = {
      logGroupName: config.awsCloudTailGroupName, // REQUIRED
      logStreamName: config.awsCloudTailStreamName, // REQUIRED
      createLogGroup: true,
      createLogStream: true,
      DescribeLogStreams: true,
      DescribeLogGroups: true,
      submissionInterval: 2000,
      batchSize: 20,
      handleExceptions: true,
      humanReadableUnhandledException: true,
      formatLog: function (item) {
       return  JSON.stringify({level:item.level, message:item.message, date: new Date().toISOString(), data: item.meta, details: info});
      }
    };
    winston.transports.CloudWatchTransport = new require('winston-aws-cloudwatch',awsCloud);
    var remoteTransporter = new winston.transports.CloudWatchTransport(awsCloud);

    logTransporters.push(remoteTransporter);
    errorTransporters.push(remoteTransporter);
  }


  var logger = new (winston.Logger)({
      transports: logTransporters,
      exceptionHandlers: errorTransporters,  
      exitOnError: false, 
  });


  var _obj = {};

  _obj.getInfoTransporter = function(app){
    return  expressWinston.logger({
        transports: logTransporters
      })
  }

  _obj.getErrorTransporter = function(app){
    return  expressWinston.errorLogger({
        transports: errorTransporters
      })
  }
  
  return _obj;
}




var nconf = require('nconf'), path = require('path'), fs = require('fs');

var configPath = path.join(path.dirname(process.mainModule.filename), 'config.json');

if(fs.existsSync(configPath))
    nconf.argv().env().file({ file: configPath });

module.exports = {
    mongoServer :nconf.get('mongoServer'),
    mongoPort: parseInt(nconf.get('mongoPort'),10),
    mongoDatabase :nconf.get('mongoDatabase'),
    mongoUser :nconf.get('mongoUser'),
    mongoPassword :nconf.get('mongoPassword'),
    redisServer :nconf.get('redisServer'),
    redisPort : parseInt(nconf.get('redisPort'),10),
    redisIndex : parseInt(nconf.get('redisIndex'),10),
    redisPassword: nconf.get('redisPassword'),
    assetsUrl : nconf.get('assetsUrl'),
    webUrl : nconf.get('webUrl')
};
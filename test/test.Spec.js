  var AWSLogger =  require('../index.js');
  var errors  = AWSLogger.awsCloudTailLogger(__dirname + '/../logConfig.json');

describe('Validations', function () {
    it('Validate AWS settings', function () {
        expect(errors.awsConfig).not.toBe(null, "The aws config must have value");
    });
});
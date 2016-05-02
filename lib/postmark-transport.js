'use strict';

var extend = require('extend'),
  postmark = require('postmark'),
  pkg = require('../package.json'),
  addressFormatter = require('./utils').addressFormatter,
  addressParser = require('./utils').addressParser,
  headersParser = require('./utils').headersParser;

function PostmarkTransport(options) {
  this.name = 'Postmark';
  this.version = pkg.version;

  options = options || {};

  var auth = options.auth || {};
  this.client = new postmark.Client(auth.apiKey);
}

PostmarkTransport.prototype.send = function (mail, callback) {
  var data = mail.data || {};

  var fromAddr = addressParser(data.from)[0] || {};
  var toAddrs = addressParser(data.to) || [];
  var ccAddrs = addressParser(data.cc) || [];
  var bccAddrs = addressParser(data.bcc) || [];
  var headers = headersParser(data.headers || []);
  var postmarkOptions = data.postmarkOptions || {};

  var message = extend(true, {
    'From': addressFormatter(fromAddr) || '',
    'To': toAddrs.map(addressFormatter).join(','),
    'Cc': ccAddrs.map(addressFormatter).join(','),
    'Bcc': bccAddrs.map(addressFormatter).join(','),
    'Subject': data.subject || '',
    'TextBody': data.text || '',
    'HtmlBody': data.html || '',
    'Headers': headers
  }, postmarkOptions);

  this.client.sendEmail(message, function (err, res) {
    if (err) { return callback(err); }

    var accepted = [];
    var rejected = [];

    if (res.ErrorCode === 0) {
      accepted.push(res);
    } else {
      rejected.push(res);
    }

    return callback(null, {
      messageId: res.MessageID,
      accepted: accepted,
      rejected: rejected
    });
  });
};

module.exports = function (options) {
  return new PostmarkTransport(options);
};

'use strict';

var extend = require('extend');
var async = require('async');
var postmark = require('postmark');
var pkg = require('../package.json');
var addressFormatter = require('./utils').addressFormatter;
var addressParser = require('./utils').addressParser;
var headersParser = require('./utils').headersParser;
var attachmentsParser = require('nodemailer-attachments-parser');
var BuildAttachment = require('nodemailer-build-attachment');

function PostmarkTransport(options) {
  this.name = 'Postmark';
  this.version = pkg.version;

  options = options || {};

  var auth = options.auth || {};
  this.client = new postmark.Client(auth.apiKey);
}

PostmarkTransport.prototype.send = function (mail, callback) {
  var data = mail.data || {};
  var client = this.client;

  var fromAddr = addressParser(data.from)[0] || {};
  var toAddrs = addressParser(data.to) || [];
  var ccAddrs = addressParser(data.cc) || [];
  var bccAddrs = addressParser(data.bcc) || [];
  var headers = headersParser(data.headers || []);
  var postmarkOptions = data.postmarkOptions || {};
  var attachments = data.attachments || [];
  
  this._parseAttachments(attachments, function (err, attachments) {
    if (err) {
      return callback(err);
    }

    var message = extend(true, {
      'From': addressFormatter(fromAddr) || '',
      'To': toAddrs.map(addressFormatter).join(','),
      'Cc': ccAddrs.map(addressFormatter).join(','),
      'Bcc': bccAddrs.map(addressFormatter).join(','),
      'Subject': data.subject || '',
      'TextBody': data.text || '',
      'HtmlBody': data.html || '',
      'Headers': headers,
      'Attachments': attachments.map(function (attachment) {
        return {
          'Name': attachment.filename,
          'Content': attachment.content.toString(),
          'ContentType': attachment.contentType
        };
      })
    }, postmarkOptions);

    client.sendEmail(message, function (err, res) {
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
  });
};

PostmarkTransport.prototype._parseAttachments = function (attachments, callback) {
  var elements = attachmentsParser(attachments).attached;
  var attachment;
  var options = {
    lineLength: false
  };

  async.mapSeries(elements, function (element, next) {
    attachment = new BuildAttachment({
      contentTransferEncoding: element.contentTransferEncoding || 'base64',
      filename: element.filename
    });

    attachment.setContent(element.content).build(options, next);
  }, callback);
};

module.exports = function (options) {
  return new PostmarkTransport(options);
};

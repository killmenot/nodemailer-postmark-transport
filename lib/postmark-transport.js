'use strict';

var extend = require('extend');
var async = require('async');
var postmark = require('postmark');
var pkg = require('../package.json');
var addressFormatter = require('./utils').addressFormatter;
var addressParser = require('./utils').addressParser;
var headersParser = require('./utils').headersParser;
var MailComposer = require('mailcomposer').MailComposer;
var BuildAttachment = require('nodemailer-build-attachment');

function PostmarkTransport(options) {
  this.name = 'Postmark';
  this.version = pkg.version;
  this.canSendBatch = true;

  options = options || {};

  var auth = options.auth || {};
  this.client = new postmark.Client(auth.apiKey);
}

/**
 * Send single email via PostMark API
 * 
 * @param  {Object}  mail
 * @param  {Function}  callback
 */
PostmarkTransport.prototype.send = function (mail, callback) {
  this._parse(mail, function (err, message) {
    if (err) {
      return callback(err);
    }

    this._requestFactory('sendEmail')(message, callback);
  }.bind(this));
};

/**
 * Send emails batch via PostMark API
 * 
 * @param  {Array}  mails
 * @param  {Function}  callback
 */
PostmarkTransport.prototype.sendBatch = function (mails, callback) {
  this._parse(mails, function (err, messages) {
    if (err) {
      return callback(err);
    }

    this._requestFactory('sendEmailBatch')(messages, callback);
  }.bind(this));
};

/**
 * Parse nodemailer mail(s) object to PostMark API objects
 * 
 * @param  {Object|Array}  mails
 * @param  {Function}  callback
 */
PostmarkTransport.prototype._parse = function (mails, callback) {
  var single = false;
  var that = this;

  function mapper(mail, next) {
    var data = mail.data || mail;
    var fromAddr = addressParser(data.from)[0] || {};
    var toAddrs = addressParser(data.to) || [];
    var ccAddrs = addressParser(data.cc) || [];
    var bccAddrs = addressParser(data.bcc) || [];
    var replyTo = addressParser(data.replyTo) || [];
    var headers = headersParser(data.headers || []);

    that._parseAttachments(data.attachments || [], function (err, attachments) {
      if (err) {
        return next(err);
      }

      var message = extend(true, {
        'From': addressFormatter(fromAddr) || '',
        'To': toAddrs.map(addressFormatter).join(','),
        'Cc': ccAddrs.map(addressFormatter).join(','),
        'Bcc': bccAddrs.map(addressFormatter).join(','),
        'ReplyTo': replyTo.map(addressFormatter).join(','),
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
      });

      next(null, message);
    });
  }

  // pre processing mails
  if (!Array.isArray(mails)) {
    mails = [mails];
    single = true;
  }

  async.mapSeries(mails, mapper, function (err, messages) {
    if (err) {
      return callback(err);
    }

    // post processing messages
    callback(null, single ? messages[0] : messages);
  });
};

/**
 * Parse nodemailer attachment(s)
 * 
 * @param  {Array}  attachments
 * @param  {Function}  callback
 */
PostmarkTransport.prototype._parseAttachments = function (attachments, callback) {
  var mailComposer = new MailComposer({
    attachments: attachments
  });
  var elements = mailComposer.getAttachments().attached;
  var options = {
    lineLength: false
  };
  var attachment;

  async.mapSeries(elements, function (element, next) {
    attachment = new BuildAttachment({
      contentTransferEncoding: element.contentTransferEncoding || 'base64',
      filename: element.filename
    });

    attachment.setContent(element.content).build(options, next);
  }, callback);
};

/**
 * Parse nodemailer attachment(s)
 * 
 * @param  {String}  method
 * @returns  {Function}
 */
PostmarkTransport.prototype._requestFactory = function (method) {
  var that = this;

  return function (payload, callback) {
    var accepted = [];
    var rejected = [];

    that.client[method](payload, function (err, results) {
      if (err) {  
        return callback(err);
      }

      if (!Array.isArray(results)) {
        results = [results];
      }

      results.forEach(function (result) {
        if (result.ErrorCode === 0) {
          accepted.push(result);
        } else {
          rejected.push(result);
        }
      });

      return callback(null, {
        messageId: (results[0] || {}).MessageID,
        accepted: accepted,
        rejected: rejected
      });
    });
  };
};

module.exports = function (options) {
  return new PostmarkTransport(options);
};

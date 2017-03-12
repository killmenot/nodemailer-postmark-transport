'use strict';

var async = require('async');
var postmark = require('postmark');
var pkg = require('../package.json');
var addressFormatter = require('./utils').addressFormatter;
var addressParser = require('./utils').addressParser;
var headersParser = require('./utils').headersParser;
var Message = require('./message');
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

    var method = typeof message.TemplateId === 'undefined' ?
      'sendEmail' :
      'sendEmailWithTemplate';

    this._requestFactory(method)(message, callback);
  }.bind(this));
};

/**
 * Send emails batch via PostMark API
 * 
 * @deprecated
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

  function parseAddress(address, parseBulk) {
    var addrs = addressParser(address || '');

    return parseBulk ?
      (addrs || []).map(addressFormatter).join(',') :
      addressFormatter(addrs[0] || {});
  }

  function parser(mail, next) {
    var data = mail.data || mail;

    var fromAddress = parseAddress(data.from);
    var toAddress = parseAddress(data.to, true);
    var ccAddress = parseAddress(data.cc, true);
    var bccAddress = parseAddress(data.bcc, true);
    var replyToAddress = parseAddress(data.replyTo);
    var headers = headersParser(data.headers || []);

    that._parseAttachments(data.attachments || [], function (err, attachments) {
      if (err) {
        return next(err);
      }

      var message = new Message();

      message.setFromAddress(fromAddress);
      message.setToAddress(toAddress);
      message.setCcAddress(ccAddress);
      message.setBccAddress(bccAddress);
      message.setReplyToAddress(replyToAddress);

      if (typeof data.templateId === 'undefined') {
        message.setSubject(data.subject);
        message.setHtmlBody(data.html);
        message.setTextBody(data.text);
      } else {
        message.setTemplate(data.templateId, data.templateModel, data.inlineCss);
      }

      message.setHeaders(headers);
      message.setAttachments(attachments);

      next(null, message);
    });
  }

  // pre processing mails
  if (!Array.isArray(mails)) {
    mails = [mails];
    single = true;
  }

  async.mapSeries(mails, parser, function (err, messages) {
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
 * Returns Postmark request processing
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
module.exports.PostmarkTransport = PostmarkTransport;

'use strict';

const async = require('async');
const postmark = require('postmark');
const pkg = require('../package.json');
const addressFormatter = require('./utils').addressFormatter;
const addressParser = require('./utils').addressParser;
const headersParser = require('./utils').headersParser;
const Message = require('./message');
const MailComposer = require('mailcomposer').MailComposer;
const BuildAttachment = require('nodemailer-build-attachment');

function parseAddress(address, parseBulk) {
  const addrs = addressParser(address || '');

  return parseBulk ?
    (addrs || []).map(addressFormatter).join(',') :
    addressFormatter(addrs[0] || {});
}

function parser(mail, next) {
  const data = mail.data || mail;

  const fromAddress = parseAddress(data.from);
  const toAddress = parseAddress(data.to, true);
  const ccAddress = parseAddress(data.cc, true);
  const bccAddress = parseAddress(data.bcc, true);
  const replyToAddress = parseAddress(data.replyTo);
  const headers = headersParser(data.headers || []);

  this._parseAttachments(data.attachments || [], (err, attachments) => {
    if (err) {
      return next(err);
    }

    const message = new Message();

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
    message.setTag(data.tag);
    message.setMetadata(data.metadata);
    message.setTrackOpens(data.trackOpens);

    try {
      message.setTrackLinks(data.trackLinks);
    } catch (err) {
      return next(err);
    }

    next(null, message);
  });
}

function PostmarkTransport(options) {
  this.name = 'Postmark';
  this.version = pkg.version;
  this.canSendBatch = true;

  options = options || {};

  const auth = options.auth || {};
  this.client = new postmark.Client(auth.apiKey);
}

/**
 * Send single email via PostMark API
 * 
 * @param  {Object}  mail
 * @param  {Function}  callback
 */
PostmarkTransport.prototype.send = function (mail, callback) {
  this._parse(mail, (err, message) => {
    if (err) {
      return callback(err);
    }

    const method = typeof message.TemplateId === 'undefined' ?
      'sendEmail' :
      'sendEmailWithTemplate';

    this._requestFactory(method)(message, callback);
  });
};

/**
 * Send emails batch via PostMark API
 * 
 * @deprecated
 * @param  {Array}  mails
 * @param  {Function}  callback
 */
PostmarkTransport.prototype.sendBatch = function (mails, callback) {
  this._parse(mails, (err, messages) => {
    if (err) {
      return callback(err);
    }

    this._requestFactory('sendEmailBatch')(messages, callback);
  });
};

/**
 * Parse nodemailer mail(s) object to PostMark API objects
 * 
 * @param  {Object|Array}  mails
 * @param  {Function}  callback
 */
PostmarkTransport.prototype._parse = function (mails, callback) {
  let single = false;

  // pre processing mails
  if (!Array.isArray(mails)) {
    mails = [mails];
    single = true;
  }

  async.mapSeries(mails, parser.bind(this), (err, messages) => {
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
  const mailComposer = new MailComposer({
    attachments: attachments
  });
  const elements = mailComposer.getAttachments().attached;
  const options = {
    lineLength: false
  };

  let attachment;

  async.mapSeries(elements, (element, next) => {
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
  return (payload, callback) => {
    const accepted = [];
    const rejected = [];

    this.client[method](payload, (err, results) => {
      if (err) {  
        return callback(err);
      }

      if (!Array.isArray(results)) {
        results = [results];
      }

      results.forEach((result) => {
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

module.exports = (options) => {
  return new PostmarkTransport(options);
};
module.exports.PostmarkTransport = PostmarkTransport;

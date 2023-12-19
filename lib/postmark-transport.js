'use strict';

const async = require('async');
const postmark = require('postmark');
const pkg = require('../package.json');
const utils = require('./utils');
const Message = require('./message');
const MailComposer = require('nodemailer/lib/mail-composer');
const BuildAttachment = require('nodemailer-build-attachment');

const addressFormatter = utils.addressFormatter;
const addressParser = utils.addressParser;
const callbackPromise = utils.callbackPromise;
const headersParser = utils.headersParser;

function parseAddress(address, parseBulk) {
  const addrs = addressParser(address || '');

  return parseBulk
    ? (addrs || []).map(addressFormatter).join(',')
    : addressFormatter(addrs[0] || {});
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

    if (data.templateId) {
      message.setTemplateId(data.templateId, data.templateModel, data.inlineCss);
    } else if (data.templateAlias) {
      message.setTemplateAlias(data.templateAlias, data.templateModel, data.inlineCss);
    } else {
      message.setSubject(data.subject);
      message.setHtmlBody(data.html);
      message.setTextBody(data.text);
    }

    message.setHeaders(headers);
    message.setAttachments(attachments);
    message.setTag(data.tag);
    message.setMetadata(data.metadata);
    message.setMessageStream(data.messageStream);
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
  const postmarkOptions = options.postmarkOptions;
  this.client = new postmark.ServerClient(auth.apiKey, postmarkOptions);
}

/**
 * Send a single email via PostMark API
 *
 * @param  {Object}  mail
 * @param  {Function}  [callback]
 */
PostmarkTransport.prototype.send = function (mail, callback) {
  let promise;

  if (!callback) {
    promise = new Promise((resolve, reject) => {
      callback = callbackPromise(resolve, reject);
    });
  }

  this._parse(mail, (err, message) => {
    if (err) {
      return callback(err);
    }

    const method = (message.TemplateId || message.TemplateAlias)
      ? 'sendEmailWithTemplate'
      : 'sendEmail';

    this._requestFactory(method)(message, callback);
  });

  return promise;
};

/**
 * Send emails batch via PostMark API
 *
 * @deprecated
 * @param  {Array}  mails
 * @param  {Function}  callback
 */
PostmarkTransport.prototype.sendBatch = function (mails, callback) {
  let promise;

  if (!callback) {
    promise = new Promise((resolve, reject) => {
      callback = callbackPromise(resolve, reject);
    });
  }

  this._parse(mails, (err, messages) => {
    if (err) {
      return callback(err);
    }

    this._requestFactory('sendEmailBatch')(messages, callback);
  });

  return promise;
};

/**
 * Parse a nodemailer mail(s) object to PostMark API objects
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
    attachments
  });
  const elements = mailComposer.getAttachments().attached;
  const options = {
    lineLength: false
  };

  let attachment;

  async.mapSeries(elements, (element, next) => {
    attachment = new BuildAttachment({
      contentTransferEncoding: element.contentTransferEncoding || 'base64',
      filename: element.filename,
      cid: element.cid
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

    this.client[method](payload, (err, originalResults) => {
      if (err) {
        return callback(err);
      }

      if (!Array.isArray(originalResults)) {
        originalResults = [originalResults];
      }

      originalResults.forEach((result) => {
        if (result.ErrorCode === 0) {
          accepted.push(result);
        } else {
          rejected.push(result);
        }
      });

      return callback(null, {
        messageId: (originalResults[0] || {}).MessageID,
        accepted,
        rejected,
        originalResults
      });
    });
  };
};

module.exports = (options) => {
  return new PostmarkTransport(options);
};
module.exports.PostmarkTransport = PostmarkTransport;

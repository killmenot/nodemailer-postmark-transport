'use strict';

function Message() {}

Message.prototype.setFromAddress = function (fromAddress) {
  if (!fromAddress) { return; }

  this.From = fromAddress;
};

Message.prototype.setToAddress = function (toAddress) {
  if (!toAddress) { return; }

  this.To = toAddress;
};

Message.prototype.setCcAddress = function (ccAddress) {
  if (!ccAddress) { return; }

  this.Cc = ccAddress;
};

Message.prototype.setBccAddress = function (bccAddress) {
  if (!bccAddress) { return; }

  this.Bcc = bccAddress;
};

Message.prototype.setReplyToAddress = function (replyToAddress) {
  if (!replyToAddress) { return; }

  this.ReplyTo = replyToAddress;
};

Message.prototype.setTemplate = function (templateId, templateModel, inlineCss) {
  this.TemplateId = templateId;
  this.TemplateModel = templateModel;

  if (inlineCss) {
    this.InlineCss = inlineCss;
  }
};

Message.prototype.setSubject = function (subject) {
  if (!subject) { return; }

  this.Subject = subject;
};

Message.prototype.setHtmlBody = function (htmlBody) {
  if (!htmlBody) { return; }

  this.HtmlBody = htmlBody;
};

Message.prototype.setTextBody = function (textBody) {
  if (!textBody) { return; }

  this.TextBody = textBody;
};

Message.prototype.setHeaders = function (headers) {
  if (headers.length > 0) {
    this.Headers = headers;
  }
};

Message.prototype.setAttachments = function (attachments) {
  if (attachments.length > 0) {
    this.Attachments = attachments.map(function (attachment) {
      return {
        'Name': attachment.filename,
        'Content': attachment.content.toString(),
        'ContentType': attachment.contentType
      };
    });
  }
};

module.exports = Message;

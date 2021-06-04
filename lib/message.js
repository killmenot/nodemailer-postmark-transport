'use strict';

const TrackLinks = {
  None: 'None',
  HtmlAndText: 'HtmlAndText',
  HtmlOnly: 'HtmlOnly',
  TextOnly: 'TextOnly'
};

function validateTrackLinks(value) {
  return Object.keys(TrackLinks).indexOf(value) > -1;
}

function validtrackLinks() {
  return Object.keys(TrackLinks).join(', ');
}

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

Message.prototype.setTemplateId = function (templateId, templateModel, inlineCss) {
  this.TemplateId = templateId;
  this.TemplateModel = templateModel;
  if (inlineCss) {
    this.InlineCss = inlineCss;
  }
};

Message.prototype.setTemplateAlias = function (templateAlias, templateModel, inlineCss) {
  this.TemplateAlias = templateAlias;
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
    this.Attachments = attachments.map((attachment) => {
      return {
        Name: attachment.filename,
        Content: attachment.content.toString(),
        ContentType: attachment.contentType,
        ContentID: attachment.cid
      };
    });
  }
};

Message.prototype.setTag = function (tag) {
  if (!tag) { return; }

  this.Tag = tag;
};

Message.prototype.setMetadata = function (meta) {
  if (!meta) { return; }

  this.Metadata = meta;
};

Message.prototype.setMessageStream = function (messageStream) {
  if (!messageStream) { return; }

  this.MessageStream = messageStream;
};

Message.prototype.setTrackOpens = function (trackOpens) {
  if (typeof trackOpens === 'undefined') { return; }

  this.TrackOpens = trackOpens;
};

Message.prototype.setTrackLinks = function (trackLinks) {
  if (!trackLinks) { return; }

  if (!validateTrackLinks(trackLinks)) {
    throw new Error('"' + trackLinks + '" is wrong value for link tracking. Valid values are: ' + validtrackLinks());
  }

  this.TrackLinks = trackLinks;
};

module.exports = Message;

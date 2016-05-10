/* globals afterEach, beforeEach, describe, it */

'use strict';

var sinon = require('sinon');
var libbase64 = require('libbase64');
var fs = require('fs');
var path = require('path');
var expect = require('chai').expect;
var postmarkTransport = require('../');
var pkg = require('../package.json');

describe('PostmarkTransport', function () {
  var sandbox,
    transport,
    options;

  beforeEach(function () {
    options = {
      auth: {
        apiKey: 'POSTMARK_API_KEY'
      }
    };
  });

  it('should expose name and version', function () {
    transport = postmarkTransport(options);
    expect(transport.name).to.equal('Postmark');
    expect(transport.version).to.equal(pkg.version);
  });

  describe('send()', function () {
    var mail,
      sendEmailStub;

    beforeEach(function () {
      transport = postmarkTransport(options);
      sandbox = sinon.sandbox.create();

      mail = {
        data: {}
      };

      sendEmailStub = sandbox.stub(transport.client, 'sendEmail').yields(null, {});
    });

    afterEach(function () {
      sandbox.restore();
    });

    it('defaults', function (done) {
      transport.send(mail, function () {
        var message = sendEmailStub.args[0][0];
        expect(message).to.eql({
          From: '',
          To: '',
          Cc: '',
          Bcc: '',
          Subject: '',
          TextBody: '',
          HtmlBody: '',
          Headers: [],
          Attachments: []
        });
        done();
      });
    });

    describe('to', function () {
      it('should parse plain email address', function (done) {
        mail.data.to = 'foo@example.org';

        transport.send(mail, function () {
          var message = sendEmailStub.args[0][0];
          expect(message.To).to.equal('foo@example.org');
          done();
        });
      });

      it('should parse email address with formatted name', function (done) {
        mail.data.to = '"John Doe" <john.doe@example.org>';

        transport.send(mail, function () {
          var message = sendEmailStub.args[0][0];
          expect(message.To).to.equal('"John Doe" <john.doe@example.org>');
          done();
        });
      });

      it('should parse address object', function (done) {
        mail.data.to = {
          name: 'Jane Doe',
          address: 'jane.doe@example.org'
        };

        transport.send(mail, function () {
          var message = sendEmailStub.args[0][0];
          expect(message.To).to.equal('"Jane Doe" <jane.doe@example.org>');
          done();
        });
      });

      it('should parse mixed', function (done) {
        mail.data.to = [
          'foo@example.org',
          '"Bar Bar" bar@example.org',
          '"Jane Doe" <jane.doe@example.org>, "John, Doe" <john.doe@example.org>',
          {
            name: 'Baz',
            address: 'baz@example.org'
          }
        ];

        transport.send(mail, function () {
          var message = sendEmailStub.args[0][0];
          expect(message.To).to.equal([
            'foo@example.org',
            '"Bar Bar" <bar@example.org>',
            '"Jane Doe" <jane.doe@example.org>',
            '"John, Doe" <john.doe@example.org>',
            '"Baz" <baz@example.org>',
          ].join(','));
          done();
        });
      });
    });

    describe('from', function () {
      it('should parse plain email address', function (done) {
        mail.data.from = 'foo@example.org';

        transport.send(mail, function () {
          var message = sendEmailStub.args[0][0];
          expect(message.From).to.equal('foo@example.org');
          done();
        });
      });

      it('should parse email address with formatted name', function (done) {
        mail.data.from = '"John Doe" <john.doe@example.org>';

        transport.send(mail, function () {
          var message = sendEmailStub.args[0][0];
          expect(message.From).to.equal('"John Doe" <john.doe@example.org>');
          done();
        });
      });

      it('should parse address object', function (done) {
        mail.data.from = {
          name: 'Jane Doe',
          address: 'jane.doe@example.org'
        };

        transport.send(mail, function () {
          var message = sendEmailStub.args[0][0];
          expect(message.From).to.equal('"Jane Doe" <jane.doe@example.org>');
          done();
        });
      });

      it('should parse mixed', function (done) {
        mail.data.from = '"Jane Doe" <jane.doe@example.org>, "John, Doe" <john.doe@example.org>';

        transport.send(mail, function () {
          var message = sendEmailStub.args[0][0];
          expect(message.From).to.equal('"Jane Doe" <jane.doe@example.org>');
          done();
        });
      });
    });

    describe('cc', function () {
      it('should parse plain email address', function (done) {
        mail.data.cc = 'foo@example.org';

        transport.send(mail, function () {
          var message = sendEmailStub.args[0][0];
          expect(message.Cc).to.equal('foo@example.org');
          done();
        });
      });

      it('should parse email address with formatted name', function (done) {
        mail.data.cc = '"John Doe" <john.doe@example.org>';

        transport.send(mail, function () {
          var message = sendEmailStub.args[0][0];
          expect(message.Cc).to.equal('"John Doe" <john.doe@example.org>');
          done();
        });
      });

      it('should parse address object', function (done) {
        mail.data.cc = {
          name: 'Jane Doe',
          address: 'jane.doe@example.org'
        };

        transport.send(mail, function () {
          var message = sendEmailStub.args[0][0];
          expect(message.Cc).to.equal('"Jane Doe" <jane.doe@example.org>');
          done();
        });
      });

      it('should parse mixed', function (done) {
        mail.data.cc = [
          'foo@example.org',
          '"Bar Bar" bar@example.org',
          '"Jane Doe" <jane.doe@example.org>, "John, Doe" <john.doe@example.org>',
          {
            name: 'Baz',
            address: 'baz@example.org'
          }
        ];

        transport.send(mail, function () {
          var message = sendEmailStub.args[0][0];
          expect(message.Cc).to.equal([
            'foo@example.org',
            '"Bar Bar" <bar@example.org>',
            '"Jane Doe" <jane.doe@example.org>',
            '"John, Doe" <john.doe@example.org>',
            '"Baz" <baz@example.org>',
          ].join(','));
          done();
        });
      });
    });

    describe('bcc', function () {
      it('should parse plain email address', function (done) {
        mail.data.bcc = 'foo@example.org';

        transport.send(mail, function () {
          var message = sendEmailStub.args[0][0];
          expect(message.Bcc).to.equal('foo@example.org');
          done();
        });
      });

      it('should parse email address with formatted name', function (done) {
        mail.data.bcc = '"John Doe" <john.doe@example.org>';

        transport.send(mail, function () {
          var message = sendEmailStub.args[0][0];
          expect(message.Bcc).to.equal('"John Doe" <john.doe@example.org>');
          done();
        });
      });

      it('should parse address object', function (done) {
        mail.data.bcc = {
          name: 'Jane Doe',
          address: 'jane.doe@example.org'
        };

        transport.send(mail, function () {
          var message = sendEmailStub.args[0][0];
          expect(message.Bcc).to.equal('"Jane Doe" <jane.doe@example.org>');
          done();
        });
      });

      it('should parse mixed', function (done) {
        mail.data.bcc = [
          'foo@example.org',
          '"Bar Bar" bar@example.org',
          '"Jane Doe" <jane.doe@example.org>, "John, Doe" <john.doe@example.org>',
          {
            name: 'Baz',
            address: 'baz@example.org'
          }
        ];

        transport.send(mail, function () {
          var message = sendEmailStub.args[0][0];
          expect(message.Bcc).to.equal([
            'foo@example.org',
            '"Bar Bar" <bar@example.org>',
            '"Jane Doe" <jane.doe@example.org>',
            '"John, Doe" <john.doe@example.org>',
            '"Baz" <baz@example.org>',
          ].join(','));
          done();
        });
      });
    });

    describe('subject', function () {
      it('should be passed', function (done) {
        mail.data.subject = 'Subject';

        transport.send(mail, function () {
          var message = sendEmailStub.args[0][0];
          expect(message.Subject).to.equal('Subject');
          done();
        });
      });
    });

    describe('text', function () {
      it('should be passed', function (done) {
        mail.data.text = 'Hello';

        transport.send(mail, function () {
          var message = sendEmailStub.args[0][0];
          expect(message.TextBody).to.equal('Hello');
          done();
        });
      });
    });

    describe('html', function () {
      it('should be passed', function (done) {
        mail.data.html = '<h1>Hello</h1>';

        transport.send(mail, function () {
          var message = sendEmailStub.args[0][0];
          expect(message.HtmlBody).to.equal('<h1>Hello</h1>');
          done();
        });
      });
    });

    describe('headers', function () {
      it('should parse {"X-Key-Name": "key value"}', function (done) {
        mail.data.headers = {
          'X-Key-Name': 'key value'
        };

        transport.send(mail, function () {
          var message = sendEmailStub.args[0][0];
          expect(message.Headers).to.eql([
            {
              Name: 'X-Key-Name',
              Value: 'key value'
            }
          ]);
          done();
        });
      });

      it('should parse [{key: "X-Key-Name", value: "key value"}]', function (done) {
        mail.data.headers = [
          {
            key: 'X-Key-Name',
            value: 'key value'
          }
        ];

        transport.send(mail, function () {
          var message = sendEmailStub.args[0][0];
          expect(message.Headers).to.eql([
            {
              Name: 'X-Key-Name',
              Value: 'key value'
            }
          ]);
          done();
        });
      });
    });

    describe('attachments', function () {
      var encodedLicense;

      beforeEach(function (done) {
        fs.readFile(path.join(__dirname, '..', 'LICENSE'), function (err, data) {
          encodedLicense = libbase64.encode(data);
          done();
        });
      });

      it('should be parsed', function (done) {
        var names = ['license.txt', 'attachment-2.txt'];
        var contents = [encodedLicense, 'aGVsbG8gd29ybGQ='];

        mail.data.attachments = [
          {
            filename: 'license.txt',
            href: 'https://raw.github.com/killmenot/nodemailer-postmark-transport/master/LICENSE'
          },
          {
            path: 'data:text/plain;base64,aGVsbG8gd29ybGQ='
          }
        ];

        transport.send(mail, function () {
          var message = sendEmailStub.args[0][0];

          message.Attachments.forEach(function (attachment, i) {
            expect(attachment.Name).to.equal(names[i]);
            expect(attachment.Content.toString()).to.equal(contents[i]);
            expect(attachment.ContentType).to.equal('text/plain');
          });

          done();
        });
      });
    });
  });
});

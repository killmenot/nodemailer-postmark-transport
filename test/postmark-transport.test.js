'use strict';

const async = require('async');
const expect = require('chai').expect;
const postmarkTransport = require('../');
const Message = require('../lib/message');
const pkg = require('../package.json');

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

describe('PostmarkTransport', () => {
  let transport;
  let options;
  let mails;

  beforeEach(() => {
    mails = [
      {
        data: {
          from: 'noreply@example.org',
          to: 'jane@example.org',
          subject: 'Hello Jane',
          html: '<h1>Hello Jane</h1>',
          text: 'Hello Jane',
          headers:[{
            key: 'X-Key-Name',
            value: 'key value1'
          }],
          attachments: [
            {
              path: 'data:text/plain;base64,aGVsbG8gd29ybGQ='
            }
          ]
        }
      },
      {
        data: {
          from: 'noreply@example.org',
          to: 'john@example.org',
          subject: 'Hello John',
          html: '<h1>Hello John</h1>',
          text: 'Hello John',
          headers: {
            'X-Key-Name': 'key value2'
          },
          attachments: [
            {
              filename: 'text.txt',
              content: 'Lorem ipsum..'
            }
          ]
        }
      }
    ];

    options = {
      auth: {
        apiKey: 'POSTMARK_API_TEST'
      }
    };

    transport = postmarkTransport(options);
  });

  it('should expose name and version', () => {
    transport = postmarkTransport(options);
    expect(transport.name).to.equal('Postmark');
    expect(transport.version).to.equal(pkg.version);
  });

  describe('#_parse', () => {
    let mail;

    beforeEach(() => {
      mail = mails[0];
      mails = [mail];
    });

    it('defaults', (done) => {
      delete mail.data;

      const expected = new Message();

      transport._parse(mails, (err, messages) => {
        expect(messages[0]).to.eql(expected);
        done();
      });
    });

    describe('to / from / cc / bcc / replyTo', () => {
      const validator = (address, expected, fields, callback) => {
        if (typeof fields === 'function') {
          callback = fields;
          fields = ['from', 'to', 'cc', 'bcc', 'replyTo'];
        }

        async.eachSeries(fields, (field, next) => {
          mail.data[field] = address;

          transport._parse(mails, (err, messages) => {
            if (err) {
              return next(err);
            }

            expect(messages[0][capitalize(field)]).to.equal(expected);
            next();
          });
        }, callback);
      };

      it('should parse plain email address', (done) => {
        const address = 'foo@example.org';
        const expected = 'foo@example.org';
        validator(address, expected, done);
      });

      it('should parse email address with formatted name', (done) => {
        const address = '"John Doe" <john.doe@example.org>';
        const expected = '"John Doe" <john.doe@example.org>';
        validator(address, expected, done);
      });

      it('should parse address object', (done) => {
        const address = {
          name: 'Jane Doe',
          address: 'jane.doe@example.org'
        };

        const expected = '"Jane Doe" <jane.doe@example.org>';

        validator(address, expected, done);
      });

      it('should parse mixed address formats in to / cc / bcc fields', (done) => {
        const address = [
          'foo@example.org',
          '"Bar Bar" bar@example.org',
          '"Jane Doe" <jane.doe@example.org>, "John, Doe" <john.doe@example.org>',
          {
            name: 'Baz',
            address: 'baz@example.org'
          }
        ];

        const expected = [
         'foo@example.org',
          '"Bar Bar" <bar@example.org>',
          '"Jane Doe" <jane.doe@example.org>',
          '"John, Doe" <john.doe@example.org>',
          '"Baz" <baz@example.org>',
        ].join(',');

        validator(address, expected, ['to', 'cc', 'bcc'], done);
      });

      it('should parse first address in from field only', (done) => {
        const address = [
          'foo@example.org',
          '"Bar Bar" bar@example.org',
          '"Jane Doe" <jane.doe@example.org>, "John, Doe" <john.doe@example.org>',
          {
            name: 'Baz',
            address: 'baz@example.org'
          }
        ];

        const expected = 'foo@example.org';

        validator(address, expected, ['from'], done);
      });
    });

    describe('subject', () => {
      it('should be parsed', (done) => {
        mail.data.subject = 'Subject';

        transport._parse(mails, (err, messages) => {
          expect(messages[0].Subject).to.equal('Subject');
          done();
        });
      });
    });

    describe('text', () => {
      it('should be parsed', (done) => {
        mail.data.text = 'Hello';

        transport._parse(mails, (err, messages) => {
          expect(messages[0].TextBody).to.equal('Hello');
          done();
        });
      });
    });

    describe('html', () => {
      it('should be parsed', (done) => {
        mail.data.html = '<h1>Hello</h1>';

        transport._parse(mails, (err, messages) => {
          expect(messages[0].HtmlBody).to.equal('<h1>Hello</h1>');
          done();
        });
      });
    });

    describe('headers', () => {
      it('should parse {"X-Key-Name": "key value"}', (done) => {
        mail.data.headers = {
          'X-Key-Name': 'key value'
        };

        transport._parse(mails, (err, messages) => {
          expect(messages[0].Headers).to.eql([
            {
              Name: 'X-Key-Name',
              Value: 'key value'
            }
          ]);

          done();
        });
      });

      it('should parse [{key: "X-Key-Name", value: "key value"}]', (done) => {
        mail.data.headers = [
          {
            key: 'X-Key-Name',
            value: 'key value'
          }
        ];

        transport._parse(mails, (err, messages) => {
          expect(messages[0].Headers).to.eql([
            {
              Name: 'X-Key-Name',
              Value: 'key value'
            }
          ]);
          done();
        });
      });
    });

    describe('attachments', () => {
      it('should be parsed', (done) => {
        const names = ['text.txt', 'attachment-2.txt'];
        const contents = ['TG9yZW0gaXBzdW0uLg==', 'aGVsbG8gd29ybGQ='];

        mail.data.attachments = [
          {
            filename: 'text.txt',
            content: 'Lorem ipsum..'
          },
          {
            path: 'data:text/plain;base64,aGVsbG8gd29ybGQ='
          }
        ];

        transport._parse(mails, (err, messages) => {
          messages[0].Attachments.forEach((attachment, i) => {
            expect(attachment.Name).to.equal(names[i]);
            expect(attachment.Content.toString()).to.equal(contents[i]);
            expect(attachment.ContentType).to.equal('text/plain');
          });

          done();
        });
      });
      });
  });

  describe('#send', () => {
    it('should be able to send a single mail', (done) => {
      transport.send(mails[0], (err, info) => {
        expect(info).to.be.an('object');

        let accepted = info.accepted;

        expect(accepted[0].To).to.equal('jane@example.org');
        expect(accepted[0].MessageID).to.be.a('string');
        expect(accepted[0].SubmittedAt).to.be.a('string');
        expect(accepted[0].ErrorCode).to.equal(0);
        expect(accepted[0].Message).to.equal('Test job accepted');

        done();
      });
    });

    xit('should be able to send a single mail with template', (done) => {
      delete mails[0].data.subject;
      delete mails[0].data.html;
      delete mails[0].data.text;

      mails[0].data.templateId = 0;
      mails[0].data.templateModel = {
        foo: 'bar'
      };

      transport.send(mails[0], function (err, info) {
        expect(info).to.be.an('object');

        let accepted = info.accepted;

        expect(accepted[0].To).to.equal('jane@example.org');
        expect(accepted[0].MessageID).to.be.a('string');
        expect(accepted[0].SubmittedAt).to.be.a('string');
        expect(accepted[0].ErrorCode).to.equal(0);
        expect(accepted[0].Message).to.equal('Test job accepted');

        done();
      });
    });
  });

  describe('#sendBatch', () => {
    it('should be able to send multiple mails', (done) => {
      transport.sendBatch(mails, (err, info) => {
        expect(info).to.be.an('object');

        let accepted = info.accepted;

        expect(accepted[0].To).to.equal('jane@example.org');
        expect(accepted[0].MessageID).to.be.a('string');
        expect(accepted[0].SubmittedAt).to.be.a('string');
        expect(accepted[0].ErrorCode).to.equal(0);
        expect(accepted[0].Message).to.equal('Test job accepted');

        expect(accepted[1].To).to.equal('john@example.org');
        expect(accepted[1].MessageID).to.be.a('string');
        expect(accepted[1].SubmittedAt).to.be.a('string');
        expect(accepted[1].ErrorCode).to.equal(0);
        expect(accepted[1].Message).to.equal('Test job accepted');

        done();
      });
    });
  });
});

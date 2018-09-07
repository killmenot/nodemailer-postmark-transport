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
    expect(transport.name).equal('Postmark');
    expect(transport.version).equal(pkg.version);
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
        expect(messages[0]).eql(expected);
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

            expect(messages[0][capitalize(field)]).equal(expected);
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
          expect(messages[0].Subject).equal('Subject');
          done();
        });
      });
    });

    describe('text', () => {
      it('should be parsed', (done) => {
        mail.data.text = 'Hello';

        transport._parse(mails, (err, messages) => {
          expect(messages[0].TextBody).equal('Hello');
          done();
        });
      });
    });

    describe('html', () => {
      it('should be parsed', (done) => {
        mail.data.html = '<h1>Hello</h1>';

        transport._parse(mails, (err, messages) => {
          expect(messages[0].HtmlBody).equal('<h1>Hello</h1>');
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
          expect(messages[0].Headers).eql([
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
          expect(messages[0].Headers).eql([
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
            expect(attachment.Name).equal(names[i]);
            expect(attachment.Content.toString()).equal(contents[i]);
            expect(attachment.ContentType).equal('text/plain');
          });

          done();
        });
      });
    });

    describe('tag', () => {
      it('should be parsed', (done) => {
        mail.data.tag = 'quux';

        transport._parse(mails, (err, messages) => {
          expect(messages[0].Tag).equal('quux');
          done();
        });
      });
    });

    describe('metadata', () => {
      it('should be parsed', (done) => {
        mail.data.metadata = { foo: 'bar' };

        transport._parse(mails, (err, messages) => {
          expect(messages[0].Metadata).eql({ foo: 'bar' });
          done();
        });
      });
    });

    describe('trackOpens', () => {
      it('should be ignored', (done) => {
        transport._parse(mails, (err, messages) => {
          expect(messages[0].TrackOpens).be.an('undefined');
          done();
        });
      });

      it('should be parsed', (done) => {
        const values = [true, false];

        function iteratee(value, cb) {
          mail.data.trackOpens = value;

          transport._parse(mails, (err, messages) => {
            if (err) { return cb(err); }
            cb(null, messages[0]);
          });
        }

        async.mapSeries(values, iteratee, (err, results) => {
          if (err) { return done(err); }

          results.forEach((actual, i) => {
            expect(actual.TrackOpens).equal(values[i]);
          });
          done();
        });
      });
    });

    describe('trackLinks', () => {
      it('should be ignored', (done) => {
        transport._parse(mails, (err, messages) => {
          expect(messages[0].TrackLinks).be.an('undefined');
          done();
        });
      });

      it('should return error', (done) => {
        mail.data.trackLinks = 'foo';

        transport._parse(mails, (err) => {
          expect(err.message).equal('"foo" is wrong value for link tracking. Valid values are: None, HtmlAndText, HtmlOnly, TextOnly');
          done();
        });
      });

      it('should be parsed', (done) => {
        const values = ['None', 'HtmlAndText', 'HtmlOnly', 'TextOnly'];

        function iteratee(value, cb) {
          mail.data.trackLinks = value;

          transport._parse(mails, (err, messages) => {
            if (err) { return cb(err); }
            cb(null, messages[0]);
          });
        }

        async.mapSeries(values, iteratee, (err, results) => {
          if (err) { return done(err); }

          results.forEach((actual, i) => {
            expect(actual.TrackLinks).equal(values[i]);
          });
          done();
        });
      });
    });

    describe('template', () => {
      it('should be parsed', (done) => {
        mail.data.templateId = 'foo';
        mail.data.templateModel = { bar: 'baz' };

        transport._parse(mails, (err, messages) => {
          expect(messages[0].TemplateId).eql('foo');
          expect(messages[0].TemplateModel).eql({ bar: 'baz' });
          done();
        });
      });

      it('should be parsed (inline css)', (done) => {
        mail.data.templateId = 'foo';
        mail.data.templateModel = { bar: 'baz' };
        mail.data.inlineCss = true;

        transport._parse(mails, (err, messages) => {
          expect(messages[0].TemplateId).equal('foo');
          expect(messages[0].TemplateModel).eql({ bar: 'baz' });
          expect(messages[0].InlineCss).equal(true);
          done();
        });
      });
    });
  });

  describe('#send', () => {
    it('should be able to send a single mail', (done) => {
      transport.send(mails[0], (err, info) => {
        expect(info).be.an('object');

        let accepted = info.accepted;

        expect(accepted[0].To).equal('jane@example.org');
        expect(accepted[0].MessageID).be.a('string');
        expect(accepted[0].SubmittedAt).be.a('string');
        expect(accepted[0].ErrorCode).equal(0);
        expect(accepted[0].Message).equal('Test job accepted');

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
        expect(info).be.an('object');

        let accepted = info.accepted;

        expect(accepted[0].To).equal('jane@example.org');
        expect(accepted[0].MessageID).be.a('string');
        expect(accepted[0].SubmittedAt).be.a('string');
        expect(accepted[0].ErrorCode).equal(0);
        expect(accepted[0].Message).equal('Test job accepted');

        done();
      });
    });
  });

  describe('#sendBatch', () => {
    it('should be able to send multiple mails', (done) => {
      transport.sendBatch(mails, (err, info) => {
        expect(info).be.an('object');

        let accepted = info.accepted;

        expect(accepted[0].To).equal('jane@example.org');
        expect(accepted[0].MessageID).be.a('string');
        expect(accepted[0].SubmittedAt).be.a('string');
        expect(accepted[0].ErrorCode).equal(0);
        expect(accepted[0].Message).equal('Test job accepted');

        expect(accepted[1].To).equal('john@example.org');
        expect(accepted[1].MessageID).be.a('string');
        expect(accepted[1].SubmittedAt).be.a('string');
        expect(accepted[1].ErrorCode).equal(0);
        expect(accepted[1].Message).equal('Test job accepted');

        done();
      });
    });
  });
});

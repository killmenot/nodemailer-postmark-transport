# nodemailer-postmark-transport

A Postmark transport for Nodemailer.

[![Build Status](https://travis-ci.org/killmenot/nodemailer-postmark-transport.svg?branch=master)](https://travis-ci.org/killmenot/nodemailer-postmark-transport)
[![Dependency Status](https://gemnasium.com/badges/github.com/killmenot/nodemailer-postmark-transport.svg)](https://gemnasium.com/github.com/killmenot/nodemailer-postmark-transport)
[![npm version](https://badge.fury.io/js/nodemailer-postmark-transport.svg)](https://badge.fury.io/js/nodemailer-postmark-transport)

## Example

```javascript
'use strict';

var nodemailer = require('nodemailer');

var postmarkTransport = require('nodemailer-postmark-transport');

var transport = nodemailer.createTransport(postmarkTransport({
  auth: {
    apiKey: 'key'
  }
}));

transport.sendMail({
  from: 'john.doe@example.org',
  to: 'jane.doe@example.org',
  subject: 'Hello',
  html: '<h1>Hello</h1>',
  attachments: [
    {
      path: 'data:text/plain;base64,aGVsbG8gd29ybGQ='
    }
  }
  ]
}, function(err, info) {
  if (err) {
    console.error(err);
  } else {
    console.log(info);
  }
});
```

## Attachments

References to nodemailer attachments [docs](https://github.com/nodemailer/nodemailer#attachments) and Postmark attachments [docs](http://developer.postmarkapp.com/developer-send-api.html)


## Using Postmark API options

```javascript
transport.sendMail({
  postmarkOptions: {

  }
}, /* ... */);
```

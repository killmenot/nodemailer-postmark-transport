# nodemailer-postmark-transport

A Postmark transport for Nodemailer.

[![Build Status](https://travis-ci.org/killmenot/nodemailer-postmark-transport.svg?branch=master)](https://travis-ci.org/killmenot/nodemailer-postmark-transport)

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
  html: '<h1>Hello</h1>'
}, function(err, info) {
  if (err) {
    console.error(err);
  } else {
    console.log(info);
  }
});
```

## Using Postmark API options

```javascript
transport.sendMail({
  postmarkOptions: {

  }
}, /* ... */);
```

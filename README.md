# nodemailer-postmark-transport

A Postmark transport for Nodemailer.

[![Build Status](https://travis-ci.org/killmenot/nodemailer-postmark-transport.svg?branch=master)](https://travis-ci.org/killmenot/nodemailer-postmark-transport)
[![Coverage Status](https://coveralls.io/repos/github/killmenot/nodemailer-postmark-transport/badge.svg?branch=master)](https://coveralls.io/github/killmenot/nodemailer-postmark-transport?branch=master)
[![Dependency Status](https://david-dm.org/killmenot/nodemailer-postmark-transport.svg)](https://david-dm.org/killmenot/nodemailer-postmark-transport.svg)
[![npm version](https://badge.fury.io/js/nodemailer-postmark-transport.svg)](https://badge.fury.io/js/nodemailer-postmark-transport)


## Requirements

 - Node.js 4+

> **Note:** If your node version is less than 4 should use nodemailer-postmark-transport@1.2.0


## Install

```
npm install nodemailer-postmark-transport
```


## Examples

### Quickstart

```javascript
'use strict';

const nodemailer = require('nodemailer');
const postmarkTransport = require('nodemailer-postmark-transport');
const transport = nodemailer.createTransport(postmarkTransport({
  auth: {
    apiKey: 'key'
  }
}));
const mail = {
  from: 'john.doe@example.org',
  to: 'jane.doe@example.org',
  subject: 'Hello',
  text: 'Hello',
  html: '<h1>Hello</h1>'
};

transport.sendMail(mail, function (err, info) {
  if (err) {
    console.error(err);
  } else {
    console.log(info);
  }
});
```

### Using Postmark templates feature

Read about Postmark templates here: [Special delivery: Postmark templates](https://postmarkapp.com/blog/special-delivery-postmark-templates)

```javascript
'use strict';

const nodemailer = require('nodemailer');
const postmarkTransport = require('nodemailer-postmark-transport');
const transport = nodemailer.createTransport(postmarkTransport({
  auth: {
    apiKey: 'key'
  }
}));
const mail = {
  from: 'john.doe@example.org',
  to: 'jane.doe@example.org',
  templateId: 1234,
  templateModel: {
    foo: 'bar'
  }
};

transport.sendMail(mail, function (err, info) {
  if (err) {
    console.error(err);
  } else {
    console.log(info);
  }
});
```

### Using attachments

References to nodemailer attachments [docs](https://community.nodemailer.com/using-attachments/) and [Postmark attachments docs](http://developer.postmarkapp.com/developer-send-api.html)

```javascript
'use strict';

const nodemailer = require('nodemailer');
const postmarkTransport = require('nodemailer-postmark-transport');
const transport = nodemailer.createTransport(postmarkTransport({
  auth: {
    apiKey: 'key'
  }
}));
const mail = {
  from: 'john.doe@example.org',
  to: 'jane.doe@example.org',
  subject: 'Hello',
  text: 'Hello, This email contains attachments',
  html: '<h1>Hello, This email contains attachments</h1>',
  attachments: [
    {
      path: 'data:text/plain;base64,aGVsbG8gd29ybGQ='
    }
  ]
};

transport.sendMail(mail, function (err, info) {
  if (err) {
    console.error(err);
  } else {
    console.log(info);
  }
});
```

## Using Postmark.js options

[postmark.js](https://github.com/wildbit/postmark.js) library allows to specify configuration options for its client. You can get more details about it [here](https://github.com/wildbit/postmark.js/blob/master/lib/postmark/clientDefaults.js#L15)

```javascript
const transport = nodemailer.createTransport(postmarkTransport({
  auth: {
    apiKey: 'key'
  },
  postmarkOptions: {

  }
}));
```

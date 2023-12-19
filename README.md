# nodemailer-postmark-transport

A Postmark transport for Nodemailer.

[![Build Status](https://github.com/killmenot/nodemailer-postmark-transport/actions/workflows/ci.yaml/badge.svg?branch=master)](https://github.com/killmenot/nodemailer-postmark-transport/actions?query=branch%3Amaster) [![Coverage Status](https://coveralls.io/repos/github/killmenot/nodemailer-postmark-transport/badge.svg?branch=master)](https://coveralls.io/github/killmenot/nodemailer-postmark-transport?branch=master) [![Dependency Status](https://david-dm.org/killmenot/nodemailer-postmark-transport.svg)](https://david-dm.org/killmenot/nodemailer-postmark-transport) [![devDependencies Status](https://david-dm.org/killmenot/nodemailer-postmark-transport/dev-status.svg)](https://david-dm.org/killmenot/nodemailer-postmark-transport?type=dev) [![peerDependencies Status](https://david-dm.org/killmenot/nodemailer-postmark-transport/peer-status.svg)](https://david-dm.org/killmenot/nodemailer-postmark-transport?type=peer) [![npm version](https://img.shields.io/npm/v/nodemailer-postmark-transport.svg)](https://www.npmjs.com/package/nodemailer-postmark-transport) [![Known Vulnerabilities](https://snyk.io/test/npm/nodemailer-postmark-transport/badge.svg)](https://snyk.io/test/npm/nodemailer-postmark-transport) [![Codacy Badge](https://app.codacy.com/project/badge/Grade/dc2a64fc8683487da82430d6ca3c7234)](https://www.codacy.com/gh/killmenot/nodemailer-postmark-transport/dashboard/nodemailer-postmark-transport)


## Requirements

| version  | Node.js  | peerDependencies   |
|----------|:--------:|:------------------:|
|    6.x   |    18+   |  nodemailer >=6.x  |
|    5.x   |    12+   |  nodemailer >=4.x  |
|    4.x   |    10+   |  nodemailer >=4.x  |
|    3.x   |    8+    |  nodemailer >=4.x  |
|    2.x   |    6+    |  nodemailer >=4.x  |
| >=1.3 <2 |    4+    |                    |
|  <1.3    |   0.10+  |                    |


## Migrating from version 1.x

Please see [CHANGELOG](/CHANGELOG.md#200-2018-12-05) for more details.


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

// callback style
transport.sendMail(mail, function (err, info) {
  if (err) {
    console.error(err);
  } else {
    console.log(info);
  }
});

// async/await style
try {
  const info = await transport.sendMail(mail);
  console.log(info);
} catch (err) {
  console.error(err);
}

```

### Using Postmark templates feature

Read about Postmark templates here: [Special delivery: Postmark templates](https://postmarkapp.com/blog/special-delivery-postmark-templates). Read more about template alias here: [How do I use a template alias?](https://postmarkapp.com/support/article/1117-how-do-i-use-a-template-alias)

```javascript
'use strict';

const nodemailer = require('nodemailer');
const postmarkTransport = require('nodemailer-postmark-transport');
const transport = nodemailer.createTransport(postmarkTransport({
  auth: {
    apiKey: 'key'
  }
}));

// using templateId
let mail = {
  from: 'john.doe@example.org',
  to: 'jane.doe@example.org',
  templateId: 1234,
  templateModel: {
    foo: 'bar'
  }
};

// using templateAlias
let mail = {
  from: 'john.doe@example.org',
  to: 'jane.doe@example.org',
  templateAlias: 'buzz',
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
      path: 'data:text/plain;base64,aGVsbG8gd29ybGQ=',
      cid: 'cid:molo.txt'
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

### Access to Postmark.js client

You can find more details about [Postmark.js](https://github.com/wildbit/postmark.js) in documentation [here](https://wildbit.github.io/postmark.js)

```javascript
'use strict';

const nodemailer = require('nodemailer');
const postmarkTransport = require('nodemailer-postmark-transport');
const transporter = postmarkTransport({
  auth: {
    apiKey: 'key'
  }
});
const transport = nodemailer.createTransport(transporter);

// transporter.client -> reference to Postmark.js client
// transport.mailer.transporter.client -> reference to Postmark.js client

```

### Provide Postmark.js client with custom client options

[Postmark.js](https://github.com/wildbit/postmark.js) library allows to specify configuration options for its server client. You can get more details about possible values [here](https://github.com/wildbit/postmark.js/blob/master/src/client/models/client/ClientOptions.ts#L2) and default values [here](https://github.com/wildbit/postmark.js/blob/master/src/client/BaseClient.ts#L21)

```javascript
'use strict';

const nodemailer = require('nodemailer');
const postmarkTransport = require('nodemailer-postmark-transport');
const transport = nodemailer.createTransport(postmarkTransport({
  auth: {
    apiKey: 'key'
  },
  postmarkOptions: {
    timeout: 60
  }
}));
```

## Contributors

[List of project's contributors!](CONTRIBUTORS.md)


## License

    The MIT License (MIT)

    Copyright (c) Alexey Kucherenko

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.


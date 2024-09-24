## CHANGELOG

<a name="6.0.0"></a>

### 6.0.0 (2023-12-19)

#### Misc

* drop support Node.js less than 18 version
* drop support nodemailer less than 6 version
* bump deps

<a name="5.3.0"></a>

### 5.3.0 (2023-12-19)

#### Features

* feat: add originalResults field to the SendMessageInfo

<a name="5.2.1"></a>

### 5.2.1 (2022-01-06)

#### Misc

* fix: add index.d.ts to files

<a name="5.2.0"></a>

### 5.2.0 (2022-01-06)

#### Misc

* feat: add types

<a name="5.1.0"></a>

### 5.1.0 (2021-06-04)

#### Features

* add MessageStream support

<a name="5.0.0"></a>

### 5.0.0 (2021-05-18)

#### Misc

* drop support Node.js less than 12 version
* bump deps

<a name="4.0.0"></a>

### 4.0.0 (2020-10-03)

#### Misc

* drop support Node.js less than 10 version
* bump deps

<a name="3.0.0"></a>

### 3.0.0 (2020-03-06)

#### Misc

* drop support Node.js less than 8 version
* bump deps

<a name="2.2.0"></a>

### 2.2.0 (2019-05-20)

#### Features

* `send` and `sendBatch` methods return promise if no callback passed

#### Misc

* bump deps

<a name="2.1.1"></a>

### 2.1.1 (2019-01-30)

#### Misc

* pass postmarkOptions to postmark ServerClient
* update peer dependencies (nodemailer >= 4.x)

<a name="2.1.0"></a>

### 2.1.0 (2019-01-30)

#### Features

* add attachments ContentId support [#11](https://github.com/killmenot/nodemailer-postmark-transport/issues/11) via ([28614fe](https://github.com/killmenot/nodemailer-postmark-transport/commit/28614fef6ec967a39c0d7559c2fb912bd166dfa4)). Thanks @gabrielstuff
* add TemplateAlias support [#10](https://github.com/killmenot/nodemailer-postmark-transport/issues/10) via ([12d4d4a](https://github.com/killmenot/nodemailer-postmark-transport/commit/12d4d4a53a4236a665778d03d1892a2368e98ea2)). Thanks @gabrielstuff

<a name="2.0.0"></a>

### 2.0.0 (2018-12-15)

#### Misc

* drop mailcomposer (deprecated)
* require to install [nodemailer](https://www.npmjs.com/package/nodemailer) package yourself. (Breaking changes)
* drop support Node.js less than 6 version

<a name="1.4.1"></a>

### 1.4.1 (2018-12-15)

#### Misc

* bump deps

<a name="1.4.0"></a>

### 1.4.0 (2018-09-08)

#### Features

* add Tag, Metadata, TrackOpens and TrackLinks support

#### Misc

* Bug fixes and improvements

<a name="1.3.0"></a>

### 1.3.0 (2017-08-16)

#### Misc

* bump deps
* drop support Node.js less than 4 version

<a name="1.2.0"></a>

### 1.2.0 (2017-03-12)

#### Features

* add ReplyTo support.
* add Postmark templates support.

<a name="1.1.0"></a>

### 1.1.0 (2016-05-10)

#### Features

* add attachments support.

<a name="1.0.0"></a>

### 1.0.0 (2016-05-02)

#### Features

* sa new transport by using [postmark](https://github.com/wildbit/postmark.js)

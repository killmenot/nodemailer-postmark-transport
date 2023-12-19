import { Models, Client } from 'postmark';

declare module 'nodemailer-postmark-transport' {
  type Callback<T> = (error: (Error | null), result: (T | null)) => void;

  export interface SentMessageInfo {
    messageId?: string;
    accepted: Array<Models.MessageSendingResponse>;
    rejected: Array<Models.MessageSendingResponse>;
    originalResults: Array<Models.MessageSendingResponse>;
  }

  export interface PostmarkTransportOptions {
    auth?: { apiKey: string; };
    postmarkOptions?: Models.ClientOptions.Configuration
  }

  export class PostmarkTransport {
    name: string;
    version: string;
    canSendBatch: boolean;
    client: Client;
    send(mail: any, callback?: Callback<SentMessageInfo>): Promise<SentMessageInfo>;
    sendBatch(mail: any[], callback?: Callback<SentMessageInfo>): Promise<SentMessageInfo>;
  }

  export default function (options?: PostmarkTransportOptions): PostmarkTransport;
}

declare module "nodemailer" {
  export function createTransport(transport: PostmarkTransport): Transporter<SentMessageInfo>;
}

declare module "nodemailer/lib/mailer" {
  interface Hash<T> { [key: string]: T; }

  export interface Options {
    messageStream?: string;
    metadata?: Hash<string>;
    tag?: string;
    trackLinks?: Models.LinkTrackingOptions;
    trackOpens?: boolean;
    templateId?: number;
    templateAlias?: string;
    templateModel?: object;
  }
}

/* eslint-disable @typescript-eslint/camelcase */
import { writeFileSync } from 'fs';

import { IMessageTemplate } from '../types/message_template';
import { default as messages } from '../database/open_messages.json';

const path = `./dist/database/open_messages.json`;

export class Message {
  message: IMessageTemplate;

  constructor(
    private variables: IMessageTemplate,
    private config?: { slack_timestamp?: string; alreadyExists?: boolean },
  ) {
    this.message = variables;

    if (config) {
      this.message.slack_id = config.slack_timestamp;
    }

    if (!config.alreadyExists) messages.push(this.message as any);

    return this;
  }

  static findByGithub(id: number): any {
    const message = messages.find((m) => m.github_id === id);

    return message;

    // console.log('findByGithub:::', message)

    // return new Message(message as any, { alreadyExists: true });
  }

  // static findBySlack(id: string): Message {
  //   const message = messages.find((m) => m.id.slack_id === id);

  //   return new Message(message.author, message.variables, message.id);
  // }

  static findByTimestamp(id: string): Message {
    const message = messages.find((m) => m.slack_id === id);

    return new Message(message as any, { alreadyExists: true });
  }

  // update(id?: MessageId, variables?: MessageVariables): Message {
  //   const index = messages.findIndex(
  //     (m) => m.id.message_id === this.id.message_id,
  //   );

  //   if (variables) this.variables = variables;
  //   if (id) this.id = id;

  //   messages[index] = this;

  //   this.save();

  //   return this;
  // }

  delete(): Message {
    const index = messages.findIndex(
      (m) => m.slack_id === this.message.slack_id,
    );

    messages.splice(index, 1);

    this.save();

    return this;
  }

  save() {
    const json = JSON.stringify(messages, null, 4);

    writeFileSync(path, json);
  }
}

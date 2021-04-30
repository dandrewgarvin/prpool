import { writeFileSync } from 'fs';

import { IUser } from '../types/user';
import { IStatus } from '../types/message_template';
import { default as messages } from '../database/open_messages.json';

const path = `${__dirname}/../database/open_messages.json`;

interface MessageVariables {
  slack_id: string | null;
  github_id: string | null;
  repo_name: string;
  branch_name: string;
  pr_name: string;
  pr_number: number;
  pr_url: string;
  current_status: IStatus;
  requested_reviewers: IUser[];
  dev_notes?: string;
}

interface MessageId {
  message_id: string;
  slack_id: string;
  github_id: string;
}

export class Message {
  id: MessageId;

  constructor(
    public author: IUser,
    public variables: MessageVariables,
    id?: MessageId,
  ) {
    this.id = id;

    if (!id) messages.push(this);

    return this;
  }

  static findByGithub(id: string): Message {
    const message = messages.find((m) => m.id.github_id === id);

    return new Message(message.author, message.variables, message.id);
  }

  static findBySlack(id: string): Message {
    const message = messages.find((m) => m.id.slack_id === id);

    return new Message(message.author, message.variables, message.id);
  }

  static findByTimestamp(id: string): Message {
    const message = messages.find((m) => m.id.message_id === id);

    return new Message(message.author, message.variables, message.id);
  }

  update(id?: MessageId, variables?: MessageVariables): Message {
    const index = messages.findIndex(
      (m) => m.id.message_id === this.id.message_id,
    );

    if (variables) this.variables = variables;
    if (id) this.id = id;

    messages[index] = this;

    this.save();

    return this;
  }

  delete(): Message {
    const index = messages.findIndex(
      (m) => m.id.message_id === this.id.message_id,
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

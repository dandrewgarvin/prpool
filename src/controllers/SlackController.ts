/* eslint-disable @typescript-eslint/camelcase */
import { IMessageTemplate } from '../types/message_template';
import { WebClient, WebAPICallResult } from '@slack/web-api';
import { create_message } from './MessageTemplateController';
import { IStatus } from '../types/message_template';
import { IUser } from '../types/user';
import { Message } from '../models/message';

const SLACK_CHANNEL_ID = 'C020HT6E5D3';
const TEST_TITLE = 'sdkjhlasfkjdhlfkjhsdkfjhalkdjshflkajsdhlfjkahsdlkfjhasd';

interface ChatMessageResult extends WebAPICallResult {
  channel: string;
  ts: string;
  message: {
    text: string;
  };
}

const calculateStatusOnCreate = (
  messageVariables: IMessageTemplate,
): IStatus => {
  const usersFromDb = messageVariables.requested_reviewers.map((item) => {
    // TODO: fetch from db
    return {} as IUser & {
      review_type: 'Approved' | 'Requested Changes' | 'Pending';
    };
  });

  return {
    status: 'Awaiting Approval',
    current_approvals: 0,
    needed_approvals: Math.max(1, messageVariables.requested_reviewers.length),
    requested_reviewers: usersFromDb,
  };
};

async function createSlackMessage(messageVariables: IMessageTemplate) {
  const web = new WebClient(process.env.SLACK_TOKEN);
  const mess = create_message(messageVariables);
  const MSG = JSON.parse(JSON.parse(mess));

  // const status = calculateStatusOnCreate(messageVariables);
  // const author = User.findByGithub(messageVariables.author.github_username);

  const res = (await web.chat.postMessage({
    text: TEST_TITLE,
    channel: SLACK_CHANNEL_ID,
    attachments: MSG.attachments,
  })) as ChatMessageResult;

  if (res.ok) {
    new Message(messageVariables, { slack_timestamp: res.ts }).save();
  }
}

async function updateSlackMessage(messageVariables: IMessageTemplate) {
  const web = new WebClient(process.env.SLACK_TOKEN);
  const mess = create_message(messageVariables);
  const MSG = JSON.parse(JSON.parse(mess));

  const message = Message.findByGithub(messageVariables.github_id) as any;

  if (!message) return;

  const timestamp = message.slack_id;

  // const status = calculateStatus() // TODO: calcaulate status from messageVariables

  const res = (await web.chat.update({
    text: TEST_TITLE,
    channel: SLACK_CHANNEL_ID,
    attachments: MSG.attachments,
    ts: timestamp,
  })) as ChatMessageResult;

  if (res.ok) {
    // TODO: whatever you need to
  }
}

async function deleteSlackMessage(githubID: number) {
  const web = new WebClient(process.env.SLACK_TOKEN);
  const message = Message.findByGithub(githubID) as any;

  if (!message) return;

  const timestamp = message.slack_id;

  const res = (await web.chat.delete({
    channel: SLACK_CHANNEL_ID,
    ts: timestamp,
  })) as ChatMessageResult;

  if (res.ok) {
    Message.findByTimestamp(timestamp).delete();
  }
}

export { createSlackMessage, updateSlackMessage, deleteSlackMessage };

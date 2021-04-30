import { IMessageTemplate } from '../types/message_template';
import { WebClient, WebAPICallResult } from '@slack/web-api';
// eslint-disable-next-line @typescript-eslint/camelcase
import { create_message } from './MessageTemplateController';
import { IStatus } from '../types/message_template';
import { IUser } from '../types/user';
import { Message } from '../models/message';
import { User } from '../models/user';

const SLACK_CHANNEL_ID = 'C020HT6E5D3';

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

  // eslint-disable-next-line @typescript-eslint/camelcase
  return {
    status: 'Awaiting Approval',
    // eslint-disable-next-line @typescript-eslint/camelcase
    current_approvals: 0,
    // eslint-disable-next-line @typescript-eslint/camelcase
    needed_approvals: Math.max(1, messageVariables.requested_reviewers.length),
    // eslint-disable-next-line @typescript-eslint/camelcase
    requested_reviewers: usersFromDb,
  };
};

async function createSlackMessage(messageVariables: IMessageTemplate) {
  const web = new WebClient(process.env.SLACK_TOKEN);

  const status = calculateStatusOnCreate(messageVariables);
  const author = User.findByGithub(messageVariables.author.github_username);

  const mess = create_message(messageVariables);
  const MSG = JSON.parse(mess);

  const res = (await web.chat.postMessage({
    text: 'hot mess',
    channel: SLACK_CHANNEL_ID,
    attachments: MSG.attachments,
  })) as ChatMessageResult;

  if (res.ok) {
    new Message(messageVariables.author, messageVariables).save();
  }
}

// async function updateSlackMessage(messageVariables: IMessageTemplate) {

//     // const status = calculateStatus() // TODO: calcaulate status from messageVariables

//     const timestamp = messageVariables.slack_id

//     const mess = create_message(messageVariables);
//     const res = (await web.chat.update({ text: mess, channel: SLACK_CHANNEL_ID, ts: timestamp }) as ChatMessageResult);

//     if (res.ok) {
//         // TODO: whatever you need to
//     }
// }

async function deleteSlackMessage(githubID: string) {
  const web = new WebClient(process.env.SLACK_TOKEN);
  const timestamp = ''; // TODO: fetch timestamp/id of message via githubId

  const res = (await web.chat.delete({
    channel: SLACK_CHANNEL_ID,
    ts: timestamp,
  })) as ChatMessageResult;

  if (res.ok) {
    Message.findByTimestamp(timestamp).delete();
  }
}

export { createSlackMessage, deleteSlackMessage };

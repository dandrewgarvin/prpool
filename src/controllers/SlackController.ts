import { IMessageTemplate } from '../types/message_template';
import { WebClient, WebAPICallResult } from '@slack/web-api';
// eslint-disable-next-line @typescript-eslint/camelcase
import { create_message } from './MessageTemplateController';
import { IStatus } from '../types/message_template';
import { IUser } from '../types/user';

const web = new WebClient(process.env.SLACK_TOKEN);

const SLACK_CHANNEL_ID = '';

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
  const status = calculateStatusOnCreate(messageVariables);
  const author = {}; // TODO: fetch user from authorGithubUsername

  const mess = create_message(messageVariables);
  const res = (await web.chat.postMessage({
    text: mess,
    channel: SLACK_CHANNEL_ID,
  })) as ChatMessageResult;

  if (res.ok) {
    // TODO: persist IMessageTemplate
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
  const timestamp = ''; // TODO: fetch timestamp/id of message via githubId

  const res = (await web.chat.delete({
    channel: SLACK_CHANNEL_ID,
    ts: timestamp,
  })) as ChatMessageResult;

  if (res.ok) {
    // TODO: delete message from db
  }
}

export { createSlackMessage, deleteSlackMessage };

/* eslint-disable @typescript-eslint/camelcase */
import express from 'express';
import compression from 'compression';
import lusca from 'lusca';

import { health } from './controllers/health';
import { test } from './controllers/test';
import handleError from './middleware/handle-error';
import * as settings from './config/settings';
console.log('health', health);
import { IMessageTemplate } from 'message_template';
import { User } from './models/user';

import {
  createSlackMessage,
  deleteSlackMessage,
} from './controllers/SlackController';

const app = express();
app.set('port', settings.PORT);

app.use(compression());
app.use(express.json());

app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));

app.get('/health', health);
app.get('/test', test);
app.post('/github', async (request, response) => {
  console.log('request.body', request.body);
  const {
    action,
    review, // possibly undefined
    pull_request,
    repository,
    sender,
  } = request.body;

  // filter out requests from dependabot
  if (['dependabot[bot]'].includes(sender.login)) {
    console.log("dependabot tried to open a PR. we ain't having it");
    return response.send(200);
  }

  if (
    ![
      'opened',
      'closed',
      'assigned',
      'unassigned',
      'review_requested',
      'review_request_removed',
      'ready_for_review',
      'converted_to_draft',
      'reopened',

      'edited', // pull request & review & comment

      'submitted', // review only
      'dismissed', // review only
    ].includes(action)
  ) {
    return response.send(200);
  }

  const {
    id,
    number,
    url,
    user,
    title,
    head,
    body,
    requested_reviewers,
    state,
    draft,
  } = pull_request;
  const { name } = repository;

  const author = User.findByGithub(user.login);

  const formatted_message_object: IMessageTemplate = {
    slack_id: null,
    github_id: id,
    author: author,
    repo_name: name,
    branch_name: head.ref,
    pr_name: title,
    pr_number: number,
    pr_url: url,
    requested_reviewers: requested_reviewers.map((reviewer: any) =>
      User.findByGithub(reviewer.login),
    ),
    current_status: {
      status: 'Awaiting Approval',
      current_approvals: 0,
      needed_approvals: 1,
      requested_reviewers: [
        {
          ...author,
          review_type: 'Pending',
        },
      ],
    },
    dev_notes: body || '',
  };

  console.log('formatted_message_object', formatted_message_object);

  if (action === 'closed') {
    await deleteSlackMessage(id);
    // slack.delete({
    //   github_id: pull_request.id
    // })
    // return response.send(200)
  }

  if (['opened', 'reopened'].includes(action)) {
    await createSlackMessage(formatted_message_object);

    // slack.create(formatted_message_object);
    // return response.send(200);
  }

  // TODO handle PR reviews (slack.update)

  response.send(200);
});

app.use(handleError());

export default app;

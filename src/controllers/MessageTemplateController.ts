/* eslint-disable @typescript-eslint/camelcase */
import { IMessageTemplate } from '../types/message_template';
const MessageTemplate = `{
  "attachments": [
    {
      "color": "||STATUS_COLOR||",
      "blocks": [
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text":
              "A *Pull Request (<||PR_URL|||||PR_NUMBER||>)* has been opened by *||AUTHOR||* in \`||REPO_NAME||\`\\n\\n*Name:* \`||PR_NAME||\`\\n\\n*Branch:* \`||BRANCH_NAME||\`\\n||CH_STORY||\\n\\n*Developer Notes:*\\n\\n||DEV_NOTES||"
          },
          "accessory": {
            "type": "image",
            "image_url": "https://avatars.githubusercontent.com/u/37122927?s=400&v=4",
            "alt_text": "GuideCX"
          }
        },
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "*Current Status:* ||CURRENT_STATUS||"
          }
        },
        {
          "type": "context",
          "elements": ||REQUESTED_REVIEWERS||
        },
        {
          "type": "divider"
        },
        {
          "type": "actions",
          "elements": [
            {
              "type": "button",
              "text": {
                "type": "plain_text",
                "text": "Review Changes Now",
                "emoji": true
              },
              "value": "open_pr_url",
              "url": "||PR_URL||"
            }
          ]
        }
      ]
    }
  ]
}`;
/**
 * Variables:
 * ||STATUS_COLOR||
 * ||AUTHOR||
 * ||REPO_NAME||
 * ||BRANCH_NAME||
 * ||CH_STORY||
 * ||PR_NAME||
 * ||PR_NUMBER||
 * ||PR_URL||
 * ||CURRENT_STATUS||
 * ||REQUESTED_REVIEWER_IMAGES||
 * ||REQUESTED_REVIEWER_MENTIONS||
 */
function create_message(message_variables: IMessageTemplate): string {
  let template = MessageTemplate;
  Object.keys(message_variables).forEach((key) => {
    const value = message_variables[key as keyof IMessageTemplate] as any;
    switch (key) {
      case 'id':
        break;
      case 'author':
        template = template.replace(/\|\|AUTHOR\|\|/g, `<@${value.slack_id}>`);
        break;
      case 'repo_name':
        template = template.replace(/(\|\|REPO_NAME\|\|)/g, value);
        break;
      case 'branch_name':
        template = template.replace(/(\|\|BRANCH_NAME\|\|)/g, value);
        // attempt to add clubhouse url
        let ch_story = value.match(/ch[0-9]+/g);
        if (ch_story && ch_story.length) ch_story = ch_story[0];
        ch_story = ch_story ? ch_story.replace('ch', '') : '';
        const ch_string = ch_story
          ? `*Clubhouse Story:* <https://app.clubhouse.io/beynd/story/${ch_story}%7Cch${ch_story}>`
          : '';
        template = template.replace(/(\|\|CH_STORY\|\|)/g, ch_string);
        break;
      case 'pr_name':
        template = template.replace(/(\|\|PR_NAME\|\|)/g, value);
        break;
      case 'pr_number':
        template = template.replace(/(\|\|PR_NUMBER\|\|)/g, String(value));
        break;
      case 'pr_url':
        template = template.replace(/(\|\|PR_URL\|\|)/g, value);
        break;
      case 'current_status':
        let status_string = value.status;
        if (value.status === 'Awaiting Approval') {
          status_string = status_string.concat(
            ` (${String(value.current_approvals)}/${String(
              value.needed_approvals,
            )})`,
          );
        }
        template = template.replace(/(\|\|CURRENT_STATUS\|\|)/g, status_string);
        const status_colors: any = {
          'Awaiting Approval': '#5f8bfa',
          'Changes Requested': '#fcd303',
          'Merge Blocked': '#d9170d',
          'Ready to Merge': '#36a74f',
        };
        template = template.replace(
          /(\|\|STATUS_COLOR\|\|)/g,
          status_colors[value.status || 'Awaiting Approval'],
        );
        break;
      case 'requested_reviewers':
        const reviewer_elements = [];
        // add prefix text to elements
        reviewer_elements.push({
          type: 'mrkdwn',
          text: '*Requested Reviewers:*',
        });
        // add reviewer images to elements
        const reviewer_images = value.map((user: any) => ({
          type: 'image',
          image_url: user.image,
          alt_text: user.name,
        }));
        reviewer_elements.push(...reviewer_images);
        // add reviewer mentions to elements
        const reviewer_mentions = value.map(
          (user: any) => `<@${user.slack_id}>`,
        );
        reviewer_elements.push({
          type: 'mrkdwn',
          text: `(${reviewer_mentions.join(',')})`,
        });
        // update template string
        template = template.replace(
          /(\|\|REQUESTED_REVIEWERS\|\|)/g,
          JSON.stringify(reviewer_elements).concat(',').replace(/,\s*$/, ''),
        );
        break;
      case 'dev_notes':
        if (!value) break;
        const notes_substring = value.substring(
          value.lastIndexOf('⇩⇩⇩⇩⇩ DEVELOPER NOTES HERE ⇩⇩⇩⇩⇩') + 32,
          value.lastIndexOf('⇧⇧⇧⇧⇧ DEVELOPER NOTES HERE ⇧⇧⇧⇧⇧'),
        );
        if (notes_substring) {
          template = template.replace(
            /(\|\|DEV_NOTES\|\|)/g,
            notes_substring.trim(),
          );
        }
        break;
      default:
        break;
    }
    // console.log('template', JSON.parse(JSON.stringify(template)));
  });
  return JSON.stringify(template);
}
export { create_message };
const test_message: IMessageTemplate = {
  slack_id: null,
  github_id: null,
  author: {
    id: 'User-9',
    slack_id: 'U0103ETH2KS',
    name: 'Ian Clawson',
    github_username: 'ianclawson',
    image:
      'https://avatars.slack-edge.com/2021-01-04/1634938408368_333c086d47acc4372c4e_48.png',
    team_ids: ['Team-3'],
  },
  repo_name: 'web.core',
  branch_name: 'chore/ch2978/shared-components-1-of-2',
  pr_name: 'chore(2978): TS conversion shared components 1 of 2',
  pr_number: 1722,
  pr_url: 'https://google.com',
  current_status: {
    status: 'Awaiting Approval',
    current_approvals: 0,
    needed_approvals: 2,
  } as any,
  requested_reviewers: [
    {
      id: 'User-6',
      slack_id: 'U01DC5R0K2T',
      name: 'Andrew Garvin',
      github_username: 'dandrewgarvin',
      image:
        'https://avatars.slack-edge.com/2020-11-02/1468419455349_1bbcf3da609e9d231f31_48.jpg',
      team_ids: ['Team-3'],
    },
    {
      id: 'User-4',
      slack_id: 'U01DZ2VETK6',
      name: 'Brennon Schow',
      github_username: 'brennongs',
      image:
        'https://avatars.slack-edge.com/2021-02-06/1729071678500_ed406729cb16959187f4_48.png',
      team_ids: ['Team-1'],
    },
  ],
  dev_notes: `## New Pull Request
  > The reviewer is not responsible for checking the correctness of this code - only the quality. The reviewer should be checking to make sure the changes make logical sense, that dead code has been removed, that all documentation has been updated (in all forms: readmes, comments, type declarations, etc), and that business requirements are met.
  ## Developer Notes
  > notes about the changes being made. why certain decisions were made (ADR-style notes), things the reviewer should look for, context the reviewer needs to be aware of, etc
  ⇩⇩⇩⇩⇩ DEVELOPER NOTES HERE ⇩⇩⇩⇩⇩
  Configuration for stylelint in hydrogen is not fully complete. There will need to be some specific rules for 'tailwindCSS' that are not yet included. Also, a mock CSS file was included as an example for future reference.
  ⇧⇧⇧⇧⇧ DEVELOPER NOTES HERE ⇧⇧⇧⇧⇧
  ## Developer Checklist
  - [ ] Have you QA'd your work?
  - [ ] Have you linked this change to Clubhouse? See Clubhouse
  - [ ] Have you named your PR correctly by type of change and included the story number? ie feat, bugfix, chore
  - [ ] Have sufficient automated tests been added?
  - [ ] Do these changes have a feature flag?
  - [ ] Do these changes meet our Quality Standards?
  ## Reviewer Checklist
  - [ ] Do you understand the changes being made in this PR?
  - [ ] Is there adequate documentation around these changes?
  - [ ] Are there simpler or cleaner modifications that could be made?`,
};
create_message(test_message);

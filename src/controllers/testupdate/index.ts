/* eslint-disable @typescript-eslint/camelcase */
import { Response, Request } from 'express';

import logger from '../../common/logger';

import { updateSlackMessage } from '../SlackController';
import { IUser } from '../../types/user';
import { IMessageTemplate, IStatus } from '../../types/message_template';

/**
 * List of API examples.
 * @route GET /api
 */
export async function testupdate(req: Request, res: Response) {
  logger.info(`TestUpdate.${req.method}`);

  const thing = {
    slack_id: null,
    github_id: 628023143,
    current_status: {} as IStatus,
    author: {} as IUser,
    repo_name: 'IANPRPOOLTEST',
    branch_name: 'iclawson-test-1',
    pr_name: 'Does a thing AND THIS IS AN UPDATE YOOOOOOOOOOOO',
    pr_number: 12345,
    pr_url: 'https://www.github.com/guidecx/prpool/pull/12345',
    requested_reviewers: [] as any,
    dev_notes:
      "## New Pull Request\r\n> The reviewer is not responsible for checking the correctness of this code - only the quality.The reviewer should be checking to make sure the changes make logical sense, that dead code has been removed, that all documentation has been updated(in all forms: readmes, comments, type declarations, etc), and that business requirements are met.\r\n\r\n## Developer Notes\r\n > notes about the changes being made.why certain decisions were made(ADR - style notes), things the reviewer should look for, context the reviewer needs to be aware of, etc\r\n\r\n⇩⇩⇩⇩⇩ DEVELOPER NOTES HERE ⇩⇩⇩⇩⇩\r\n\r\n// notes\r\n\r\n⇧⇧⇧⇧⇧ DEVELOPER NOTES HERE ⇧⇧⇧⇧⇧\r\n\r\n## Developer Checklist\r\n- [ ] Have you QA'd your work?\r\n- [ ] Have you linked this change to Clubhouse? See Clubhouse\r\n- [ ] Have you named your PR correctly by type of change and included the story number? ie feat, bugfix, chore\r\n- [ ] Have sufficient automated tests been added?\r\n- [ ] Do these changes have a feature flag?\r\n- [ ] Do these changes meet our Quality Standards?\r\n\r\n## Reviewer Checklist\r\n- [ ] Do you understand the changes being made in this PR?\r\n- [ ] Is there adequate documentation around these changes?\r\n- [ ] Are there simpler or cleaner modifications that could be made?",
  } as IMessageTemplate;

  await updateSlackMessage(thing);

  res.sendStatus(200);
}

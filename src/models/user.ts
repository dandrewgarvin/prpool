import { writeFileSync } from 'fs';

import * as users from '../database/users.json';

class User {
  constructor(
    public id: string,
    public slack_id: string,
    public name: string,
    public github_username: string,
    public image: string,
    public team_ids: string[],
  ) {}

  static findByGithub(username: string) {
    const user = users.find((u) => u.github_username === username);

    return new User(
      user.id,
      user.slack_id,
      user.name,
      user.github_username,
      user.image,
      user.team_ids,
    );
  }
}

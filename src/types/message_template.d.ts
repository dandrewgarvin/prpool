import { IUser } from './user';
interface IReviewerImage {
  type: string;
  image_url: string;
  alt_text: string;
}

interface IStatus {
  status: string;
  current_approvals?: number;
  needed_approvals?: number;
}
export interface IMessageTemplate {
  slack_id: string | null;
  github_id: string | null;
  author: IUser;
  repo_name: string;
  branch_name: string;
  pr_name: string;
  pr_number: number;
  pr_url: string;
  current_status: IStatus;
  requested_reviewers: IUser[];
  dev_notes?: string;
}

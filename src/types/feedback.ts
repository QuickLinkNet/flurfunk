export type FeedbackCategory = 'bug' | 'idea' | 'other';

export interface FeedbackSubmitInput {
  category: FeedbackCategory;
  message: string;
  pagePath?: string;
}

import { api } from '@/lib/api';

export type FeedbackTypeApi =
  | 'BUG_REPORT'
  | 'GENERAL_FEEDBACK'
  | 'FEATURE_REQUEST'
  | 'SHOW_SOME_LOVE';

export type MoodApi = 'FRUSTRATED' | 'UNHAPPY' | 'NEUTRAL' | 'HAPPY' | 'LOVING_IT';

export type CreateFeedbackInput = {
  feedbackType: FeedbackTypeApi;
  message: string;
  mood: MoodApi;
  email?: string;
};

export async function createFeedback(token: string, input: CreateFeedbackInput) {
  const response = await api.post('/feedback', input, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  return response.data;
}

import { setContextUserId } from '../middlewares/set-context-user-id.ts';
import { refreshToken } from '../middlewares/refresh-token.ts';

export const handler = [
  setContextUserId,
  refreshToken,
];

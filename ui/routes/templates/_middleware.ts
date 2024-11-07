import { ensureUserLoggedIn } from '../../middlewares/ensure-user-logged-in.ts';

export const handler = [
  ensureUserLoggedIn,
];

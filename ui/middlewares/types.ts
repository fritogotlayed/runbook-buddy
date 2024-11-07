// TODO: This could be details from a JWT about the user
export interface State {
  userId?: string;
}

export type AuthTokenPayloadFragment = {
  exp: number;
  remainingRefreshes: number;
  userId: string;
};

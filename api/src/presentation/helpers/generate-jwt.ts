import { create, Header as djwtHeader, verify } from '@zaubrik/djwt';
import { getJwtSigningData } from './get-jwt-signing-data.ts';
import { getSecondsForTimeUnit } from '../../../../ui/helpers/get-seconds-for-time-unit.ts';
import { getPublicSignature } from './get-public-signature.ts';

type JwtPayload = {
  userId: string;
  remainingRefreshes: number;
  iat: number;
  exp: number;
  nbf: number;
};

export async function generateJwt(
  { userId, oldToken, payloadData }: {
    userId?: string;
    oldToken?: string;
    payloadData?: Record<string, unknown>;
  },
) {
  const { signingKey, signingOptions } = await getJwtSigningData();

  if (!userId && !oldToken) {
    throw new Error('Either userId or oldToken must be provided');
  }

  let uid = userId;
  let remainingRefreshes = 2;

  if (oldToken) {
    const publicSignature = await getPublicSignature();
    const payload = await verify<JwtPayload>(oldToken, publicSignature);
    if (payload.remainingRefreshes <= 0) {
      throw new Error('Token has been refreshed too many times');
    }

    uid = payload.userId;
    remainingRefreshes = payload.remainingRefreshes - 1;
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  const jwtHeader = {
    alg: signingOptions.algorithm,
    typ: 'JWT',
    iss: signingOptions.issuer,
  } as djwtHeader; // NOTE: doing this because the Algorithm type is not exported from @zaubrik/djwt
  const jwtPayload = {
    ...payloadData,
    nbf: nowSeconds,
    iat: nowSeconds,
    exp: nowSeconds +
      getSecondsForTimeUnit(signingOptions.expiresIn),
    remainingRefreshes,
    userId: uid,
  };

  return await create(
    jwtHeader,
    jwtPayload,
    signingKey,
  );
}

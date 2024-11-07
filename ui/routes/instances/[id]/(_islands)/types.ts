import { type GetInstanceByIdResponseBody } from '../../../../types/api-interchange.ts';

export type Instance = GetInstanceByIdResponseBody;
export type InstanceLineItem = Instance['lineItems'][number];

import { Type, Static } from '@sinclair/typebox';

export const PutTemplateRequestBodySchema = Type.Object({
  content: Type.String(),
});

export type PutTemplateRequestBody = Static<
  typeof PutTemplateRequestBodySchema
>;

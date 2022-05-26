import { Type, Static } from '@sinclair/typebox';

export const CreateTemplateRequestBodySchema = Type.Object({
  name: Type.String(),
  content: Type.String(),
});

export type CreateTemplateRequestBody = Static<
  typeof CreateTemplateRequestBodySchema
>;

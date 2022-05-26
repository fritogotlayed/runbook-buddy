import { Static, Type } from '@sinclair/typebox';

export const PutInstanceRequestBodySchema = Type.Object({
  // content: Type.Array(Type.Object({
  //   completed: Type.Boolean(),
  //   data: Type.String(),
  // })),
  version: Type.Number(),
  // contents: Type.Array(InstanceItemSchema),
  contents: Type.Array(
    Type.Object({
      completed: Type.Boolean(),
      data: Type.String(),
      children: Type.Array(Type.Any()),
    }),
  ),
});

export type PutInstanceRequestBody = Static<
  typeof PutInstanceRequestBodySchema
>;

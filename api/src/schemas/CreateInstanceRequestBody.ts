import { Static, Type } from '@sinclair/typebox';

// TODO: Fastify tosses errors presumably because this is recursive
const InstanceTopLevel = Type.Object({
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

export const CreateInstanceRequestBodySchema = Type.Object({
  name: Type.String(),
  content: InstanceTopLevel,
});

export type CreateInstanceRequestBody = Static<
  typeof CreateInstanceRequestBodySchema
>;

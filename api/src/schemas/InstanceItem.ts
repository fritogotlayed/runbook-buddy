import { Static, Type } from '@sinclair/typebox';

export const InstanceItemSchema = Type.Rec(
  (Self) =>
    Type.Object({
      completed: Type.Boolean(),
      data: Type.String(),
      children: Type.Array(Self),
    }),
  { $id: 'Item' },
);

export type InstanceItem = Static<typeof InstanceItemSchema>;

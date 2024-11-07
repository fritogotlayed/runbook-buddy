import { type paths } from '../generated/api.d.ts';

export type RefreshResponseBody =
  paths['/refresh-token']['get']['responses'][200]['content'][
    'application/json'
  ];

// Instances
export type CreateInstanceRequestBody = NonNullable<
  paths['/instances']['post']['requestBody']
>['content']['application/json'];
export type CreateInstanceResponseBody = NonNullable<
  paths['/instances']['post']['responses']['201']['content']['application/json']
>;
export type GetInstanceByIdResponseBody = NonNullable<
  paths['/instances/:id']['get']['responses']['200']['content'][
    'application/json'
  ]
>;
export type ListInstanceRequestBody =
  paths['/instances']['get']['responses'][200]['content']['application/json'];
export type PatchInstanceRequestBody = NonNullable<
  paths['/instances/:id']['patch']['requestBody']
>['content']['application/json'];

// Templates
export type CreateTemplateRequestBody = NonNullable<
  paths['/templates']['post']['requestBody']
>['content']['application/json'];
export type CreateTemplateResponseBody = NonNullable<
  paths['/templates']['post']['responses']['201']['content']['application/json']
>;
export type GetTemplateByIdResponseBody = NonNullable<
  paths['/templates/:id']['get']['responses']['200']['content'][
    'application/json'
  ]
>;
export type ListTemplateRequestBody =
  paths['/templates']['get']['responses'][200]['content']['application/json'];
export type PutTemplateRequestBody = NonNullable<
  paths['/templates/:id']['put']['requestBody']
>['content']['application/json'];

// Users
export type UpdatePasswordResponseError =
  paths['/users/update-password']['post']['responses'][400]['content'][
    'application/json'
  ];

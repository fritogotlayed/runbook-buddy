import { type paths } from '../generated/api.d.ts';

export type Template =
  paths['/templates/:id']['get']['responses']['200']['content'][
    'application/json'
  ];
export type TemplateLineItem =
  paths['/templates/:id']['get']['responses']['200']['content'][
    'application/json'
  ]['templateLineItems'][number];

// export type TemplateLineItem = {
//   templateLineItemId: string;
//   templateLineItemSummary: string;
//   templateLineItemNotes: string;
//   templateLineItemOrderIndex: number;
// };
//
// export type Template = {
//   templateId: string;
//   templateName: string;
//   templateNotes: string;
//   templateLineItems: TemplateLineItem[];
// };

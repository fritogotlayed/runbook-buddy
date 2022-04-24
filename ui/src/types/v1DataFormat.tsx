export type V1TemplateItem = {
  data: string;
  children: V1TemplateItem[];
};

export type V1TemplateFile = {
  version: number;
  contents: V1TemplateItem[];
};

export type V1InstanceItem = V1TemplateItem & {
  completed: boolean;
};

export type V1InstanceFile = {
  version: number;
  contents: V1InstanceItem[];
};

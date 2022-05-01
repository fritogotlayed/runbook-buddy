export type V1TemplateItem = {
  data: string;
  children: V1TemplateItem[];
};

export type V1TemplateFile = {
  version: number;
  contents: V1TemplateItem[];
};

export type V1InstanceItem = {
  completed: boolean;
  data: string;
  children: V1InstanceItem[];
};

export type V1InstanceFile = {
  version: number;
  contents: V1InstanceItem[];
};

export type V1UIInstanceItem = V1InstanceItem & {
  originalState: boolean;
  visible: boolean;
}

export type V1UIInstanceFile = {
  version: number;
  contents: V1UIInstanceItem[];
};

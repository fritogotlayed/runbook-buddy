// import { IInstanceItem } from '../repos/instances';

// export interface UIInstanceItem extends IInstanceItem {
export interface UIInstanceItem {
  key: string;
  completed: boolean;
  data: string;
  originalState: boolean;
  visible: boolean;
  children: UIInstanceItem[];
}

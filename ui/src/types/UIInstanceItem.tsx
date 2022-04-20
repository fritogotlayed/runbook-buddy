import { IInstanceItem } from '../repos/instances';

export interface UIInstanceItem extends IInstanceItem { 
  originalState: boolean,
  visible: boolean,
}
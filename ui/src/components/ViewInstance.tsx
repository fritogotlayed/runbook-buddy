import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  IconButton,
  Paper,
  Toolbar,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// import { IInstanceItem } from "../repos/instances";
import SearchInput from './SearchInput';
import { Save } from '@mui/icons-material';
import { V1UIInstanceItem } from 'types/v1DataFormat';

// export type SaveCallback = (data: Array<IInstanceItem>) => void;
export type SaveCallback = () => Promise<void> | void;
export type CloseCallback = () => Promise<void> | void;
export type ItemToggledCallback = (
  item: V1UIInstanceItem,
) => Promise<void> | void;
export type SearchTermUpdatedCallback = (
  term: string | undefined,
) => Promise<void> | void;

interface IViewInstanceProps {
  instanceTitle: string;
  data: Array<V1UIInstanceItem>;
  onCloseClicked: CloseCallback;
  onSaveClicked: SaveCallback;
  onItemUpdated: ItemToggledCallback;
  onSearchTermUpdated: SearchTermUpdatedCallback;
}

export default function ViewInstance(props: IViewInstanceProps) {
  const {
    instanceTitle,
    data,
    onCloseClicked,
    onSaveClicked,
    onItemUpdated,
    onSearchTermUpdated,
  } = props;

  const toggleItemCompleted = (key: string) => {
    if (onItemUpdated) {
      const recursiveFind = (
        items: V1UIInstanceItem[],
      ): V1UIInstanceItem | undefined => {
        const item = items.find((e) => e.key === key);
        if (item) return item;

        for (let i = 0; i < items.length; i++) {
          const elem = items[i];
          const subItem = recursiveFind(elem.children);
          if (subItem) return subItem;
        }
      };

      const item = recursiveFind(data);
      if (item) {
        void onItemUpdated({ ...item, completed: !item.completed });
      }
    }
  };

  const save = () => {
    if (data) {
      void onSaveClicked();
    }
  };

  const isItemOrChildrenChanged = (item: V1UIInstanceItem): boolean => {
    if (item.originalState !== item.completed) return true;

    return item.children
      .map((c: V1UIInstanceItem) => isItemOrChildrenChanged(c))
      .reduce((prev, curr) => prev || curr, false);
  };

  const isDirty =
    data.length === 0
      ? false
      : data
          .map((e) => isItemOrChildrenChanged(e))
          .reduce((prev, curr) => prev || curr, false);

  let items;

  if (data) {
    const getDepth = (item: V1UIInstanceItem): number => {
      if (item.parent === undefined) return 0;
      return 1 + getDepth(item.parent);
    };

    const processForUIElement = (
      list: JSX.Element[],
      item: V1UIInstanceItem,
    ): void => {
      if (!item.visible) return;

      const depth = getDepth(item);
      const marginLeft = `${depth * 1}em`;
      const nestedChildCount = (me: V1UIInstanceItem): number => {
        const childCount = me.children.reduce(
          (prev, curr: V1UIInstanceItem) => nestedChildCount(curr),
          0,
        );
        return me.children.length + childCount;
      };
      const labelSuffix =
        item.children.length === 0
          ? ''
          : ` ${item.childrenComplete} / ${nestedChildCount(item)}`;

      const label = `${item.data}${labelSuffix}`;

      list.push(
        <FormControlLabel
          key={item.key}
          checked={item.completed}
          onChange={() => toggleItemCompleted(item.key)}
          control={<Checkbox />}
          label={label}
          sx={{
            color: item.completed !== item.originalState ? '#FF0000' : '',
            fontWeight:
              item.completed !== item.originalState ? 'bolder' : 'normal',
            marginLeft,
          }}
        />,
      );

      item.children.forEach((e) =>
        processForUIElement(list, e as V1UIInstanceItem),
      );
    };

    const subData: JSX.Element[] = [];
    data.forEach((e) => processForUIElement(subData, e));
    items = <FormGroup>{subData}</FormGroup>;
  }

  return (
    <Paper style={{ margin: '1em' }}>
      <Box sx={{ padding: '1em' }}>
        <Toolbar>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h5" component="div">
            {instanceTitle}
          </Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={() => void onCloseClicked()}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </Toolbar>
        <Box>
          <SearchInput
            onSearchTermUpdated={(term) => void onSearchTermUpdated(term)}
            showClearButton={true}
          />
        </Box>
        {items}
        <Box>
          <Button variant="contained" onClick={save} disabled={!isDirty}>
            <Save />
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

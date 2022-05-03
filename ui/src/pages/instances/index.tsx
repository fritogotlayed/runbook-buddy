import { useRouter } from "next/router";
import { NextPage } from "next";
import { Grid } from "@mui/material";
import { useEffect, useState } from "react";
import ListInstances from "../../components/ListInstances";
// import { getInstanceById, IInstanceItem, removeInstanceById, searchInstances, updateInstance } from "../../repos/instances";
import { getInstanceById, removeInstanceById, searchInstances, updateInstance } from "../../repos/instances";
import ViewInstance from "../../components/ViewInstance";
import { V1InstanceFile, V1InstanceItem, V1UIInstanceItem } from "types/v1DataFormat";

interface IInstanceData {
  key: string,
  data: V1UIInstanceItem[]
}

function mapV1UIInstanceItemToInstanceItem(item: V1UIInstanceItem): V1InstanceItem{
  return ({
    children: mapV1UIInstanceItemsToInstanceItems(item.children),
    completed: item.completed,
    data: item.data,
  });
}

function mapV1UIInstanceItemsToInstanceItems(items: V1UIInstanceItem[]): V1InstanceItem[] {
  if (!items || items.length === 0) return [];

  return items.map(e => mapV1UIInstanceItemToInstanceItem(e));
}

const InstancesPage: NextPage = () => {
  const [viewInstanceData, setViewInstanceData] = useState<IInstanceData>();
  const [instances, setInstances] = useState<Array<string>>();
  const router = useRouter();

  const loadData = async () => {
    const data = await searchInstances('');
    setInstances(data);
  }

  useEffect(() => {
    if (!instances) {
      loadData();
    }
  }, [instances]);

  const navigateToCreateWizard = () => {
    router.push('instances/create');
  }

  const itemDeleted = async (key: string) => {
    await removeInstanceById(key);
    await loadData();
  }

  const viewItem = async (key: string) => {
    const data = await getInstanceById(key);
    setViewInstanceData({
      key,
      data: data.contents,
    });
  }

  const viewItemClosed = () => {
    setViewInstanceData(undefined);
  }

  const viewItemSaved = async () => {
    if (viewInstanceData) {
      const instanceFile: V1InstanceFile = {
        version: 1,
        contents: mapV1UIInstanceItemsToInstanceItems(viewInstanceData.data),
      };
      await updateInstance(viewInstanceData.key, instanceFile);

      const updateOriginalState = (item: V1UIInstanceItem): V1UIInstanceItem => {
        const children = item.children.map((e: V1UIInstanceItem) => updateOriginalState(e));
        return {
          ...item,
          originalState: item.completed,
          children,
        };
      };
      const newData = viewInstanceData.data.map((e) => updateOriginalState(e));
      setViewInstanceData({ key: viewInstanceData.key, data: newData });
    }
  }

  const instanceItemUpdated = (item: V1UIInstanceItem) => {
    if (viewInstanceData) {
      
      // TODO: figure out how to recursively iterate items and only replace 
      // the selected child item.
      const scanToReplace = (elem: V1UIInstanceItem): V1UIInstanceItem => {
        if (elem.key === item.key) { 
          return item;
        }
        if (elem.children.length > 0) {
          elem.children = elem.children.map((e: V1UIInstanceItem) => scanToReplace(e));
          elem.childrenComplete = elem.children.reduce((prev, curr: V1UIInstanceItem) => prev + curr.childrenComplete + (curr.completed ? 1 : 0), 0)
        }
        return elem;
      };

      const newData = viewInstanceData.data.map((e) => scanToReplace(e));

      setViewInstanceData({
        key: viewInstanceData.key,
        data: newData,
      });
    }
  };

  const searchTermUpdated = (term?: string) => {
    if (viewInstanceData) {
      const isVisible = (value: string) => {
        // NOTE: JS has weird behavior with re-using a RegExp object and the test method
        // where checks will be a false negative. We can work around this by re-creating
        // the RegExp object for every check.
        const exp = new RegExp(term || '', 'gi');
        return exp.test(value);
      }

      const mapItem = (item: V1UIInstanceItem): V1UIInstanceItem => {
        const children = item.children.map((c: V1UIInstanceItem) => mapItem(c));
        const selfVisible = isVisible(item.data) || children.map((c) => c.visible).reduce((prev, curr) => prev || curr, false);
        return ({
          ...item,
          visible: selfVisible,
          children: children,
        });
      };

      setViewInstanceData({
        key: viewInstanceData.key,
        data: viewInstanceData.data.map(mapItem),
      });
    }
  };

  let sidePanel: JSX.Element | undefined;

  sidePanel = !sidePanel && viewInstanceData ? (
    <ViewInstance
      instanceTitle={viewInstanceData.key.replace(/_/g, ' ')}
      data={viewInstanceData.data}
      onCloseClicked={viewItemClosed}
      onSaveClicked={viewItemSaved}
      onItemUpdated={instanceItemUpdated}
      onSearchTermUpdated={searchTermUpdated} />
  ) : sidePanel;

  function computeLeftPanelWidth() {
    let mdWidth = 12;
    let lgWidth = 12;

    if (viewInstanceData) {
      mdWidth = 6;
      lgWidth = 6;
    }
    return [12, mdWidth, lgWidth]
  }

  const [xsWidth, mdWidth, lgWidth] = computeLeftPanelWidth();
  return (
    <>
      <Grid item xs={xsWidth} md={mdWidth} lg={lgWidth}>
        <ListInstances
          showCreateButton={true}
          data={!instances ? [] : instances.map((item) => ({ itemKey: item, displayName: item.replace(/_/g, ' ') }))}
          onItemDeletedClick={(key) => itemDeleted(key)}
          onItemViewClick={(key) => viewItem(key)}
          onCreateButtonClick={() => navigateToCreateWizard()} />
      </Grid>
      <Grid item xs={12} md={6} lg={6} display={sidePanel ? undefined : 'none'}>
        {sidePanel}
      </Grid>
    </>
  )
}

export default InstancesPage

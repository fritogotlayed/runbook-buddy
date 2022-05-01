import { useRouter } from "next/router";
import { NextPage } from "next";
import { Grid } from "@mui/material";
import { useEffect, useState } from "react";
import ListInstances from "../../components/ListInstances";
import { getInstanceById, IInstanceItem, removeInstanceById, searchInstances, updateInstance } from "../../repos/instances";
import ViewInstance from "../../components/ViewInstance";
import { UIInstanceItem } from '../../types/UIInstanceItem';

interface IInstanceData {
  key: string,
  data: UIInstanceItem[]
}

const InstancesPage: NextPage = () => {
  const [viewInstanceData, setViewInstanceData] = useState<IInstanceData>();
  const [editInstanceData, setEditInstanceData] = useState<IInstanceData>();
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
    console.log(data);
    setEditInstanceData(undefined);
    setViewInstanceData({
      key,
      data: data.contents.map((e) => ({ ...e, originalState: e.completed, visible: true }))
    });
  }

  const viewItemClosed = () => {
    setViewInstanceData(undefined);
  }

  const viewItemSaved = async (data: Array<IInstanceItem>) => {
    if (viewInstanceData) {
      await updateInstance(viewInstanceData.key, viewInstanceData.data);
      const newData = viewInstanceData.data.map((e) => ({
        ...e,
        originalState: e.completed,
      }))
      setViewInstanceData({ key: viewInstanceData.key, data: newData });
    }
  }

  const instanceItemUpdated = (item: UIInstanceItem) => {
    if (viewInstanceData) {
      const newData = viewInstanceData.data.map((e) => {
        if (e.data === item.data) { 
          return item;
        }
        return e;
      })
      setViewInstanceData({
        key: viewInstanceData.key,
        data: newData,
      });
    }
  };

  const searchTermUpdated = (term?: string) => {
    if (viewInstanceData) {
      if (term) {
        const isVisible = (value: string) => {
          // NOTE: JS has weird behavior with re-using a RegExp object and the test method
          // where checks will be a false negative. We can work around this by re-creating
          // the RegExp object for every check.
          const exp = new RegExp(term, 'gi');
          return exp.test(value);
        }
        setViewInstanceData({
          key: viewInstanceData.key,
          data: viewInstanceData.data.map((i) => ({
            ...i,
            visible: isVisible(i.data)
          }))
        });
      } else {
        setViewInstanceData({
          key: viewInstanceData.key,
          data: viewInstanceData.data.map((i) => ({...i, visible: true}))
        });
      }
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

    if (viewInstanceData || editInstanceData) {
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

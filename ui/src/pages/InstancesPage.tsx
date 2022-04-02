import { Grid } from "@mui/material";
import { Fragment, useEffect, useState } from "react";
import ListInstances from "../components/ListInstances";
import { getInstanceById, IInstanceItem, removeInstanceById, searchInstances, updateInstance } from "../repos/instances";
import ViewInstance from "../components/ViewInstance";
import { useNavigate } from "react-router";

interface IInstanceData {
  key: string,
  data: IInstanceItem[]
}

export default function CreateTemplatePage() {
  const [viewInstanceData, setViewInstanceData] = useState<IInstanceData>();
  const [editInstanceData, setEditInstanceData] = useState<IInstanceData>();
  const [instances, setInstances] = useState<Array<string>>();
  const navigate = useNavigate();

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
    navigate('/createInstance');
  }

  const itemDeleted = async (key: string) => {
    await removeInstanceById(key);
    await loadData();
  }

  const viewItem = async (key: string) => {
    const data = await getInstanceById(key);
    setViewInstanceData(undefined);
    setEditInstanceData(undefined);
    setViewInstanceData({key, data});
  }

  const viewItemClosed = () => {
    setViewInstanceData(undefined);
  }

  const viewItemSaved = async (instanceId: string, data: Array<IInstanceItem>) => {
    await updateInstance(instanceId, data);
    setViewInstanceData(undefined);
    setViewInstanceData({key: instanceId, data});
  }

  let sidePanel: JSX.Element | undefined;

  sidePanel = !sidePanel && viewInstanceData ? (
    <ViewInstance instanceId={viewInstanceData.key} data={viewInstanceData.data} onCloseClicked={viewItemClosed} onSaveClicked={viewItemSaved} />
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

  return(
    <Fragment>
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
    </Fragment>
  );
}
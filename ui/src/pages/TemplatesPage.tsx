import { Grid } from "@mui/material";
import { Fragment, useEffect, useState } from "react";
import ListTemplates from "../components/ListTemplates";
import EditTemplate from "../components/EditTemplate";
import ViewTemplate from "../components/ViewTemplate";
import CreateTemplate from "../components/CreateTemplate";
import { createTemplate, searchTemplates, removeTemplateById, getTemplateById, updateTemplate } from "../repos/templates";

interface ITemplateData {
  key: string,
  data: string
}

export default function CreateTemplatePage() {
  const [showCreatePanel, setShowCreatePanel] = useState<boolean>(false);
  const [viewTemplateData, setViewTemplateData] = useState<ITemplateData>();
  const [editTemplateData, setEditTemplateData] = useState<ITemplateData>();
  const [templates, setTemplates] = useState<Array<string>>();

  const loadData = async () => {
    const data = await searchTemplates('');
    setTemplates(data);
  }

  useEffect(() => {
    if (!templates) {
      loadData();
    }
  }, [templates]);

  const toggleCreatePane = () => {
    setViewTemplateData(undefined);
    setShowCreatePanel(!showCreatePanel);
  }

  const create = async (templateId: string, data: string) => {
    setShowCreatePanel(false);
    await createTemplate(templateId, data);
    await loadData();
  };

  const itemDeleted = async (key: string) => {
    await removeTemplateById(key);
    await loadData();
  }

  const viewItem = async (key: string) => {
    const data = await getTemplateById(key);
    setShowCreatePanel(false);
    setEditTemplateData(undefined);
    setViewTemplateData({key, data});
  }

  const editItem = async (key: string) => {
    const data = await getTemplateById(key);
    setShowCreatePanel(false);
    setViewTemplateData(undefined);
    setEditTemplateData(undefined);
    setEditTemplateData({key, data});
  }

  const viewItemClosed = () => {
    setViewTemplateData(undefined);
  }

  const editItemClosed = () => {
    setEditTemplateData(undefined);
  }

  const onTemplateUpdated = async (templateId: string, body: string) => {
    await updateTemplate(templateId, body);
  };

  let sidePanel: JSX.Element | undefined;

  sidePanel = showCreatePanel ? (
    <CreateTemplate onCreateButtonClick={(templateId, data) => create(templateId, data)} />
  ) : undefined;

  sidePanel = !sidePanel && viewTemplateData ? (
    <ViewTemplate templateId={viewTemplateData.key} data={viewTemplateData.data} onCloseClicked={viewItemClosed} />
  ) : sidePanel;

  sidePanel = !sidePanel && editTemplateData ? (
    <EditTemplate templateId={editTemplateData.key} body={editTemplateData.data} onCloseClicked={editItemClosed} onUpdateButtonClick={onTemplateUpdated}/>
  ) : sidePanel;

  function computeLeftPanelWidth() {
    let mdWidth = 12;
    let lgWidth = 12;

    if (showCreatePanel || viewTemplateData || editTemplateData) {
      mdWidth = 6;
      lgWidth = 6;
    }
    return [12, mdWidth, lgWidth]
  }

  const [xsWidth, mdWidth, lgWidth] = computeLeftPanelWidth();

  return(
    <Fragment>
      <Grid item xs={xsWidth} md={mdWidth} lg={lgWidth}>
        <ListTemplates
          showCreateButton={true}
          data={!templates ? [] : templates.map((item) => ({ itemKey: item, displayName: item.replace(/_/g, ' ') }))}
          onItemDeletedClick={(key) => itemDeleted(key)}
          onItemViewClick={(key) => viewItem(key)}
          onItemEditClick={(key) => editItem(key)}
          onCreateButtonClick={() => toggleCreatePane()} />
      </Grid>
      <Grid item xs={12} md={6} lg={6} display={sidePanel ? undefined : 'none'}>
        {sidePanel}
      </Grid>
    </Fragment>
  );
}
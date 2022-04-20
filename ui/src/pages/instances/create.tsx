import { Grid } from "@mui/material";
import { useRouter } from "next/router";
import { useState } from "react";
import { createInstance } from "../../repos/instances";
import SelectTemplate from "../../components/SelectTemplate";
import ViewTemplate from "../../components/ViewTemplate";
import CreateInstance from "../../components/CreateInstance";
import { getTemplateById } from "../../repos/templates";
import { NextPage } from "next";

const InstanceCreatePage: NextPage = () => {
  const [templateId, setTemplateId] = useState<string>();
  const [templateData, setTemplateData]  = useState<string>();
  const [instanceData, setInstanceData]  = useState<string>();
  const [replaceKeys, setReplaceKeys]  = useState<string[]>();
  const [replacementMapping, setReplacementMapping] = useState<Map<string, string>>(new Map<string, string>());
  const router = useRouter();

  const templateSelected = async (templateId: string) => {
    const data = await getTemplateById(templateId);
    setTemplateId(templateId)
    setTemplateData(data);

    const tester = /{{(.*?)}}/g;
    let result;
    const keys: string[] = [];
    do {
      result = tester.exec(data);
      if (result && keys.indexOf(result[1]) === -1) keys.push(result[1]);
    } while (result)

    setReplaceKeys(keys.sort((a, b) => a.localeCompare(b)));
    let workingData = data;
    setInstanceData(workingData);
  };

  const templateFieldUpdated = (key: string, value: string) => {
    replacementMapping.set(key, value);
    setReplacementMapping(replacementMapping)
    if (templateData && replaceKeys) {
      let workingData = templateData
      for (let i = 0; i < replaceKeys.length; i += 1) {
        const expression = `{{${replaceKeys[i]}}}`;
        workingData = workingData.replace(new RegExp(expression, 'g'), replacementMapping.get(replaceKeys[i]) || expression);
      }
      setInstanceData(workingData);
    }
  };

  const createButtonClicked = async (name: string) => {
    if (instanceData) {
      const newName = name.replace(/ /g, '_');
      const items = instanceData.split(/\r\n|\r|\n/g).map((line) => ({
        data: line,
        completed: false,
      }));
      await createInstance(newName, items);

      router.push('/instances');
    }
  }

  let leftPanel: JSX.Element | undefined;
  let rightPanel: JSX.Element | undefined;

  if (templateId === undefined) {
    leftPanel = (
      <SelectTemplate onTemplateSelected={templateSelected} />
    );
  } else {
    leftPanel = (
      <CreateInstance keys={replaceKeys} onFieldUpdated={templateFieldUpdated} onCreateButtonClick={createButtonClicked} />
    );
    rightPanel = (
      <ViewTemplate templateId={templateId} data={instanceData || ''} />
    )
  }

  function computeLeftPanelWidth() {
    let mdWidth = 12;
    let lgWidth = 12;

    if (rightPanel) {
      mdWidth = 6;
      lgWidth = 6;
    }
    return [12, mdWidth, lgWidth]
  }

  const [xsWidth, mdWidth, lgWidth] = computeLeftPanelWidth();

  return (
    <>
      <Grid item xs={xsWidth} md={mdWidth} lg={lgWidth}>
        {leftPanel}
      </Grid>
      <Grid item xs={12} md={6} lg={6} display={rightPanel ? undefined : 'none'}>
        {rightPanel}
      </Grid>
    </>
  )
};

export default InstanceCreatePage
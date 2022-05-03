import { Grid } from "@mui/material";
import { useRouter } from "next/router";
import { useState } from "react";
import { createInstance } from "../../repos/instances";
import SelectTemplate from "../../components/SelectTemplate";
import ViewTemplate from "../../components/ViewTemplate";
import CreateInstance from "../../components/CreateInstance";
import { getTemplateById } from "../../repos/templates";
import { NextPage } from "next";
import { convertTemplateToJSON, convertTemplateToInstance } from "utils/converters";
import { V1InstanceFile, V1InstanceItem, V1TemplateFile } from "types/v1DataFormat";

const InstanceCreatePage: NextPage = () => {
  const [templateId, setTemplateId] = useState<string>();
  const [templateData, setTemplateData]  = useState<V1TemplateFile>();
  const [instanceData, setInstanceData]  = useState<V1InstanceFile>();
  const [replaceKeys, setReplaceKeys]  = useState<string[]>();
  const [replacementMapping, setReplacementMapping] = useState<Map<string, string>>(new Map<string, string>());
  const router = useRouter();

  const templateSelected = async (templateId: string) => {
    const data = await getTemplateById(templateId);
    const workingData = convertTemplateToInstance(data);
    setTemplateId(templateId)
    setTemplateData(data);

    let result;
    const keys: string[] = [];

    const checkDatumForTemplateKey = (datum: string) => {
      const tester = /{{(.*?)}}/g;
      do {
        result = tester.exec(datum);
        if (result && keys.indexOf(result[1]) === -1) keys.push(result[1]);
      } while (result)
    }

    const processInstanceItem = (item: V1InstanceItem): void => {
      checkDatumForTemplateKey(item.data);
      item.children.forEach((e) => processInstanceItem(e));
    };

    // TODO: Validate these forEach's
    workingData.contents.forEach((e) => processInstanceItem(e))

    setReplaceKeys(keys.sort((a, b) => a.localeCompare(b)));
    setInstanceData(workingData);
  };

  const templateFieldUpdated = (key: string, value: string) => {
    replacementMapping.set(key, value);
    setReplacementMapping(replacementMapping)

    const processInstanceItem = (item: V1InstanceItem, replaceKey: string): void => {
      const expression = `{{${replaceKey}}}`;
      item.data = item.data.replace(new RegExp(expression, 'g'), replacementMapping.get(replaceKey) || expression);
      item.children.forEach((e) => processInstanceItem(e, replaceKey));
    };

    if (templateData && replaceKeys) {
      let workingData = convertTemplateToInstance(templateData);
      for (let i = 0; i < replaceKeys.length; i += 1) {
        // TODO: Validate these forEach's
        workingData.contents.forEach((e) => processInstanceItem(e, replaceKeys[i]));
      }
      setInstanceData(workingData);
    }
  };

  const createButtonClicked = async (name: string) => {
    if (instanceData) {
      const newName = name.replace(/ /g, '_');
      await createInstance(newName, instanceData);

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
      <ViewTemplate templateId={templateId} data={instanceData} />
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
import { Template, TemplateLineItem } from '../../../../types/template-data.ts';

const templateLineItemSorter = (a: TemplateLineItem, b: TemplateLineItem) => {
  // Sort by order index ascending
  if (a.templateLineItemOrderIndex < b.templateLineItemOrderIndex) {
    return -1;
  }
  if (a.templateLineItemOrderIndex > b.templateLineItemOrderIndex) {
    return 1;
  }
  return 0;
};

export default function DisplayTemplate({ template }: { template: Template }) {
  return (
    <div>
      <div>
        <span className='font-semibold pr-1'>Template:</span>
        {template.templateName}
      </div>
      <div>
        <span className='font-semibold pr-1'>Notes:</span>
        {template.templateNotes}
      </div>
      <ul className='flex flex-col mt-4 ml-6 gap-4'>
        {template.templateLineItems.sort(templateLineItemSorter).map((
          templateLineItem,
        ) => (
          <li key={templateLineItem.templateLineItemId}>
            <div>Summary: {templateLineItem.templateLineItemSummary}</div>
            <div>Notes: {templateLineItem.templateLineItemNotes}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

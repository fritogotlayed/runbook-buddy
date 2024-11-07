import { GetInstanceByIdResponseBody } from '../../../../types/api-interchange.ts';

type InstanceLineItem = GetInstanceByIdResponseBody['lineItems'][number];

const lineItemSorter = (a: InstanceLineItem, b: InstanceLineItem) => {
  // Sort by order index ascending
  if (a.orderIndex < b.orderIndex) {
    return -1;
  }
  if (a.orderIndex > b.orderIndex) {
    return 1;
  }
  return 0;
};

export default function DisplayInstance(
  { instance }: { instance: GetInstanceByIdResponseBody },
) {
  return (
    <div>
      <div>
        <span className='font-semibold pr-1'>Instance:</span>
        {instance.name}
      </div>
      <div>
        <span className='font-semibold pr-1'>Notes:</span>
        {instance.notes}
      </div>
      <ul className='flex flex-col mt-4 ml-6 gap-4'>
        {instance.lineItems.sort(lineItemSorter).map((
          lineItem,
        ) => (
          <li key={lineItem.id}>
            <div>Summary: {lineItem.summary}</div>
            <div>Notes: {lineItem.notes}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

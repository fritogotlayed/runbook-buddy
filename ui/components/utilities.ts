function isSpecialPrefix(prefix: string) {
  return prefix.startsWith('bg-');
}

export function reduceClasses(classes: string) {
  const classArray = classes.split(' ').filter((c) => c.length > 0);
  const uniqueClasses = new Map<string, string>();
  const classIndexes = new Map<string, number>();

  // Use regex to extract the prefix from the value. I.e. bg-blue-500 -> bg-blue-
  // Items like hover:bg-blue-500 will be preserved as hover:bg-blue-
  classArray.forEach((className, i) => {
    const matches = className.match(/(.*-)([0-9]+)/);
    let prefix = matches?.[1] || className;
    let value = matches?.[2] || '';
    if (!value || isSpecialPrefix(prefix)) {
      if (prefix.startsWith('bg-')) {
        prefix = 'bg-';
        value = className.replace('bg-', '');
      }
    }
    uniqueClasses.set(prefix, `${prefix}${value}`);
    classIndexes.set(prefix, classIndexes.get(prefix) ?? i);
  });

  return Array.from(classIndexes.keys())
    .map((key) => uniqueClasses.get(key) as string)
    .join(' ');
}

export const join = (names: string[]) => {
  if (names.length === 1) {
    return names[0];
  }
  if (names.length === 2) {
    return `${names[0]} and ${names[1]}`;
  }
  const joined = names.filter((_, i) => i !== names.length - 1).join(', ');
  return `${joined}, and ${names[names.length - 1]}`;
};

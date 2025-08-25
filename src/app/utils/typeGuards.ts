export const isArray = (value: any): value is any[] => {
  return Array.isArray(value);
};

export const isStringArray = (value: any): value is string[] => {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
};

export const isNumberArray = (value: any): value is number[] => {
  return Array.isArray(value) && value.every(item => typeof item === 'number');
};

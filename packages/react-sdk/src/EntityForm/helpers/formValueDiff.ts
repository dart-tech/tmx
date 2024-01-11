import DeepDiff from "deep-diff";

export const formValueDiff = ({ defaultValues, values }) => {
  const result = {};
  const differences = DeepDiff.diff(defaultValues, values);
  if (differences) {
    differences.forEach((difference) => {
      const path = difference?.path?.[0];
      result[path] = values[path];
    });
  }
  return result;
};

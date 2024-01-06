import typescript from "@rollup/plugin-typescript";

const entries = [
  {
    input: "src/button.tsx",
    output: {
      file: "dist/button.js",
    },
  },
  {
    input: "src/EntityForm.tsx",
    output: {
      file: "dist/EntityForm.js",
    },
  },
  {
    input: "src/AppContext.ts",
    output: {
      file: "dist/AppContext.js",
    },
  },
];

export default entries.map((entry) => ({ ...entry, plugins: [typescript()] }));

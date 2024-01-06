import typescript from "@rollup/plugin-typescript";

const entries = [
  {
    input: "src/AppProvider/index.tsx",
    output: {
      file: "dist/AppProvider.js",
    },
  },
];

export default entries.map((entry) => ({ ...entry, plugins: [typescript()] }));

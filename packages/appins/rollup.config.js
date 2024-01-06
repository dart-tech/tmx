import typescript from "@rollup/plugin-typescript";

const entries = [
  {
    input: "src/AppContext/index.tsx",
    output: {
      file: "dist/AppContext.js",
    },
  },
];

export default entries.map((entry) => ({ ...entry, plugins: [typescript()] }));

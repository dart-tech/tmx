import typescript from "@rollup/plugin-typescript";

const entries = [
  {
    input: "src/index.tsx",
    output: {
      file: "dist/index.js",
    },
  },
];

export default entries.map((entry) => ({ ...entry, plugins: [typescript()] }));

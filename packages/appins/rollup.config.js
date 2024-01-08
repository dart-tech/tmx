import typescript from "@rollup/plugin-typescript";

const entries = [
  {
    input: "src/BackendProvider.ts",
    output: {
      file: "dist/BackendProvider.js",
    },
  },
];

export default entries.map((entry) => ({ ...entry, plugins: [typescript()] }));

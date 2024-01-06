import typescript from "@rollup/plugin-typescript";

const entries = [
  {
    input: "src/AppStore.ts",
    output: {
      file: "dist/AppStore.js",
    },
  },
];

export default entries.map((entry) => ({ ...entry, plugins: [typescript()] }));

export default {
  input: 'dist/index.js',
  output: [
    { file: 'dist/index.cjs', format: 'cjs', sourcemap: true },
    {
      file: 'dist/index.umd.cjs',
      format: 'umd',
      name: 'SoundsControl',
      sourcemap: true,
    },
  ],
};

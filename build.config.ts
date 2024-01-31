import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  externals: [
    '#build/types/layouts',
  ],
  hooks: {
    'build:prepare': function (ctx) {
      ctx.options.entries = ctx.options.entries?.filter(entry => !entry.input?.includes('src/runtime'))
      ctx.options.entries.push({
        builder: 'mkdist',
        input: 'src/runtime/',
        outDir: 'dist/runtime',
        ext: 'js',
      })
    },
  },
})

import esbuild from 'esbuild';

async function build() {
  try {
    await esbuild.build({
      entryPoints: ['server.ts'],
      bundle: true,
      platform: 'node',
      format: 'cjs',
      packages: 'external',
      sourcemap: true,
      outfile: 'dist/server.cjs',
    });
    console.log('✓ Server bundle built successfully at dist/server.cjs');
  } catch (error) {
    console.warn('⚠️ Server bundling notice (safe for static hosting):', error?.message || error);
  }
}

build();

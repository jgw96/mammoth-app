import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import copy from 'rollup-plugin-copy';
import wasm from "vite-plugin-wasm";

import minifyHTML from 'rollup-plugin-minify-html-literals';

import VitePluginInjectPreload from 'vite-plugin-inject-preload';

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  build: {
    sourcemap: false,
    assetsDir: "code",
    cssCodeSplit: true,
    target: ['esnext', 'edge100', 'firefox100', 'chrome100', 'safari18']
  },
  plugins: [
    VitePWA({
      strategies: "injectManifest",
      injectManifest: {
        swSrc: 'public/sw.js',
        swDest: 'dist/sw.js',
        globDirectory: 'dist',
        globPatterns: [
          '**/*.{html,js,css,json,svg}',
        ],
      },
      devOptions: {
        enabled: true
      },
    }),
    VitePluginInjectPreload({
      files: [
        {
          match: /index.[a-z-0-9]*.(js)$/,
        }
      ]
    }),
    wasm(),
    minifyHTML(),
    copy({
      targets: [
      { src: 'light.css', dest: 'dist/' },
      { src: 'dark.css', dest: 'dist/' },
      { src: 'global.css', dest: 'dist/' },
    ]}),
  ],
})

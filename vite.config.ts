import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import monkey, { cdn } from "vite-plugin-monkey";
import { vitePluginForArco } from "@arco-plugins/vite-vue";
import process from "process";
import path from "path";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ArcoResolver } from "unplugin-vue-components/resolvers";

const pathSrc = path.resolve(__dirname, "src");

// https://vitejs.dev/config/
export default defineConfig(() => {
  const env = loadEnv("", process.cwd(), "");
  const VITE_RELEASE_MODE = env.VITE_RELEASE_MODE ?? "dev";
  const VITE_VERSION = env.VITE_VERSION ?? "dev";
  return {
    plugins: [
      vue(),
      vitePluginForArco({
        style: "css",
      }),
      AutoImport({
        dts: true,
        imports: ["vue"],
        resolvers: [ArcoResolver()],
      }),
      Components({
        dts: true,
        resolvers: [
          ArcoResolver({
            sideEffect: true,
          }),
        ],
      }),
      monkey({
        entry: "src/main.ts",
        userscript: {
          name:
            VITE_RELEASE_MODE === "release"
              ? "Bilibili🎶音乐姬"
              : `Bilibili🎶音乐姬 [${VITE_RELEASE_MODE}]`,
          version: VITE_VERSION,
          description:
            "仅帮助用户从视频页下载音乐(封面,Tags,歌词,字幕 写入支持)的油猴脚本",
          author: "Ocyss",
          grant: ["unsafeWindow"],
          "run-at": "document-start",
          icon: " https://static.hdslb.com/images/favicon.ico",
          namespace: "https://github.com/Ocyss/bilibili-music",
          homepage: "https://github.com/Ocyss/bilibili-music",
          match: ["https://www.bilibili.com/video/*"],
          connect: ["bilibili.com", "hdslb.com", "mxnzp.com", "bilivideo.com"],
        },
        build: {
          externalGlobals: {
            vue: cdn.jsdelivr("Vue", "dist/vue.global.prod.js"),
          },
        },
        server: {
          prefix: false,
        },
      }),
    ],
    resolve: {
      alias: {
        "@": pathSrc,
      },
    },
  };
});

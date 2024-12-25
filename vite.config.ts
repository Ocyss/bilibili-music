import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import monkey, { cdn, util } from "vite-plugin-monkey";
import { vitePluginForArco } from "@arco-plugins/vite-vue";
import process from "process";
import path from "path";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ArcoResolver } from "unplugin-vue-components/resolvers";
import wasm from "vite-plugin-wasm";

const pathSrc = path.resolve(__dirname, "src");

// https://vitejs.dev/config/
export default defineConfig(() => {
  const env = loadEnv("", process.cwd(), "");
  const VITE_RELEASE_MODE = env.VITE_RELEASE_MODE ?? "dev";
  const VITE_VERSION = env.VITE_VERSION ?? "dev";
  return {
    plugins: [
      wasm(),
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
        dirs: ["src/steps", "src/components"],
        include: /.vue$/,
        resolvers: [
          ArcoResolver({
            sideEffect: false,
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
          connect: [
            "bilibili.com",
            "hdslb.com",
            "mxnzp.com",
            "bilivideo.com",
            "www.hhlqilongzhu.cn",
            "api.52vmy.cn",
          ],
          resource: {
            bilibili_music_backend_bg:
              "https://fastly.jsdelivr.net/npm/@ocyss/bilibili-music-backend@latest/bilibili_music_backend_bg.wasm",
          },
        },
        build: {
          externalGlobals: {
            vue: cdn
              .jsdelivr("Vue", "dist/vue.global.prod.js")
              .concat(util.dataUrl(";window.Vue=Vue;")),
            "@arco-design/web-vue": cdn.jsdelivr(
              "ArcoVue",
              "dist/arco-vue.min.js"
            ),
          },
        },
        server: {
          prefix: false,
        },
      }),
      {
        name: "wasm-cdn",
        renderChunk(code) {
          let tempCode = code;
          const regx = new RegExp(/(__vite__wasmUrl = .*;)/);
          tempCode = code.replace(
            regx,
            `__vite__wasmUrl = _GM_getResourceURL("bilibili_music_backend_bg");`
          );
          return tempCode;
        },
      },
    ],
    resolve: {
      alias: {
        "@": pathSrc,
      },
    },
  };
});

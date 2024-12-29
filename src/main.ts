import "./style.css";
import elmGetter from "./utils/elmGetter";
import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { GM_getResourceURL, GM_registerMenuCommand, unsafeWindow } from "$";
import { defaultData } from "./data";
import { drop } from "./utils/drop";

GM_getResourceURL("bilibili_music_backend_bg");

const main = () => {
  const el = document.createElement("div");
  el.id = "bilibili-music-vue";
  // el.style.display = "none";
  document.body.appendChild(el);
  const app = createApp(App);
  app.mount(el);
};

elmGetter.each(".tag-panel .tag .bgm-tag", (elm) => {
  const download = document.createElement("a");
  download.classList.add("bilibili-music-root");
  download.innerHTML = `<svg t="1718115268538" class="icon" viewBox="0 0 1264 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="9046" width="20" height="20"><path d="M992.171444 312.62966C975.189616 137.155482 827.415189 0 647.529412 0 469.849434 0 323.616239 133.860922 303.679205 306.210218 131.598564 333.839271 0 482.688318 0 662.588235c0 199.596576 161.815189 361.411765 361.411765 361.411765h572.235294v-1.555371c185.470975-15.299199 331.294118-170.426291 331.294117-359.856394 0-168.969898-116.101408-310.367302-272.769732-349.958575zM632.470588 963.764706L294.530793 602.352941h244.278155V271.058824h180.705882V602.352941H970.410384z" p-id="9047"></path></svg>`;
  download.onclick = main;
  console.log({ msg: "音乐姬注入成功!", elm, download });

  elm.appendChild(download);
  return true;
});

const initFileOpen = () => {
  if (window.self !== window.top) {
    return;
  }

  const file = document.createElement("div");
  console.log("开始初始化 File 拖选框", file);
  file.id = "bilibili-music-file";
  file.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 9999;
    pointer-events: none;
    display: none;
    color: white;
    font-size: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    display: none;
  `;
  file.innerHTML = `
    <div style="text-align: center;">
      <svg style="width: 64px; height: 64px; margin-bottom: 16px;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <path fill="currentColor" d="M544 864V672h192L512 448 288 672h192v192H544zM512 384l224-224H544V0H480v160H288l224 224z"/>
      </svg>
      <div>拖放打开对应视频</div>
    </div>
  `;

  document.documentElement.appendChild(file);

  document.documentElement.addEventListener(
    "dragenter",
    function (e) {
      if (!e.dataTransfer?.types.includes("Files")) return;
      e.preventDefault();
      e.stopPropagation();
      file.style.display = "flex";
    },
    false
  );

  document.documentElement.addEventListener(
    "dragover",
    function (e) {
      if (!e.dataTransfer?.types.includes("Files")) return;
      e.preventDefault();
      e.stopPropagation();
      file.style.display = "flex";
    },
    false
  );

  document.documentElement.addEventListener(
    "dragleave",
    function (e) {
      if (!e.dataTransfer?.types.includes("Files")) return;
      e.preventDefault();
      e.stopPropagation();
      file.style.display = "none";
    },
    false
  );

  document.documentElement.addEventListener("drop", async function (e) {
    if (!e.dataTransfer?.types.includes("Files")) return;
    e.preventDefault();
    e.stopPropagation();
    file.style.display = "none";
    const droppedFiles = e.dataTransfer?.files;
    drop(droppedFiles);
  });
};

GM_registerMenuCommand("打开音乐姬🎶", main);

initFileOpen();

unsafeWindow._bilibili_music_open = main;
unsafeWindow._bilibili_music_fileOpen = initFileOpen;

declare global {
  interface Window {
    _bilibili_music_fromData: typeof defaultData;
    _bilibili_music_userConfig: any;
    _bilibili_music_open: () => void;
    _bilibili_music_fileOpen: () => void;
  }
}

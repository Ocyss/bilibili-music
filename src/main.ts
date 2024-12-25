import "./style.css";
import elmGetter from "./utils/elmGetter";
import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { GM_getResourceURL, GM_registerMenuCommand } from "$";
import { defaultData } from "./data";

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

GM_registerMenuCommand("打开音乐姬🎶", main);

window._bilibili_music_open = main;

declare global {
  interface Window {
    _bilibili_music_fromData: typeof defaultData;
    _bilibili_music_userConfig: any;
    _bilibili_music_open: () => void;
  }
}

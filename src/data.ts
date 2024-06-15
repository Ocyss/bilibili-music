import { reactive } from "vue";
import { deepmerge, clone } from "./utils/deepmerge";
import { unsafeWindow } from "$";
export const defaultData = {
  data: null as MusicData | null,
  err: null as any,
  coverUrl: null as null | string,
  lyricsId: null as null | string,
  videoData: null as VideoData | null,
  playerData: null as PlayerData | null,
  videoParse: null as VideoParse | null,
  title: "",
  author: "",
  file: "",
};

export const fromData = reactive(clone(defaultData));

export const reset = () => {
  deepmerge(fromData, defaultData, { clone: false });
};

unsafeWindow._bilibili_music_fromData = fromData;

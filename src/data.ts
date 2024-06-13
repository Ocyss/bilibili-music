import { reactive } from "vue";
import { deepmerge, clone } from "./utils/deepmerge";
import { unsafeWindow } from "$";
export const defaultData = {
  data: null as MusicData | null,
  err: null as any,
  upName: undefined as string | undefined,
  coverUrl: null as null | string,
  lyricsId: null as null | number,
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

declare global {
  interface Window {
    _bilibili_music_fromData: typeof defaultData;
  }
}
unsafeWindow._bilibili_music_fromData = fromData;

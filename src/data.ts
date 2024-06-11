import { reactive } from "vue";
import { deepmerge, clone } from "./utils/deepmerge";
import { unsafeWindow } from "$";
export const defaultData = {
  data: null as MusicData | null,
  err: null as any,
  upName: undefined as string | undefined,
  coverUrl: null as null | string,
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

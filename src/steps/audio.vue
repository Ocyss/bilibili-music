<script lang="ts" setup>
import { fromData } from "@/data";
import { request } from "@/utils/requests";
import { GM_download } from "$";
import audiobufferToBlob from "audiobuffer-to-blob";
import * as biliMusic from "../../backend/pkg/bilibili_music_backend.js";

const audioCtx = new AudioContext();

onMounted(() => {
  const avid = fromData.playerData?.aid;
  const cid = fromData.playerData?.cid;
  request
    .get({
      url: `https://api.bilibili.com/x/player/playurl?qn=120&otype=json&fourk=1&fnver=0&fnval=4048&avid=${avid}&cid=${cid}`,
    })
    .then(async (res: any) => {
      let audioUrl = undefined;
      let dash = res.data.dash;
      if (!dash) {
        return;
      }
      let hiRes = dash.flac;
      let dolby = dash.dolby;
      if (hiRes && hiRes.audio) {
        audioUrl = hiRes.audio.baseUrl;
      } else if (dolby && dolby.audio) {
        audioUrl = dolby.audio[0].base_url;
      } else if (dash.audio) {
        audioUrl = dash.audio[0].baseUrl;
      }
      const request = await fetch(audioUrl);
      if (!request.ok) {
        // handle error
        console.error(`Unable to fetch ${audioUrl}`);
      }
      console.log({ r: res.data.dash, request });

      const blob = await new Promise<Blob>((reactive) => {
        request
          .arrayBuffer()
          .then((arrBuf) => {
            console.log({ arrBuf });
            // GM_download({
            //   url: URL.createObjectURL(new Blob([arrBuf])),
            //   name: "testttt.m4a",
            // });
            audioCtx.decodeAudioData(arrBuf, (buf) => {
              console.log({ buf });

              const blob = audiobufferToBlob(buf);
              console.log({ blob });

              reactive(blob);
            });
          })
          .catch((e) => {
            console.log(e);
          });
      });
      // const url = URL.createObjectURL(blob);
      // GM_download({
      //   url,
      //   name: "ttttattata11.wav",
      //   onload: () => {
      //     console.log("ok11");
      //   },
      //   onerror: (e) => {
      //     console.log("err11", e);
      //   },
      //   ontimeout: () => {
      //     console.log("ontimeouterr11");
      //   },
      //   onprogress: (e) => {
      //     console.log("onprogresserr11", e);
      //   },
      // });
      // console.log({ blob, a: "123", url });
      // down();
      // return undefined;
      return blob;
    })
    .then(async (blob) => {
      if (!blob) {
        console.log("no blob");
        return;
      }
      const img = await fetch(
        fromData.coverUrl!.replace("http://", "https://")
      );
      const imgBuf = await img.arrayBuffer();

      const res = biliMusic.add_tag(await blobToUint8Array(blob), {
        author: fromData.author,
        title: fromData.title,
        album: fromData.data?.album ?? "",
        host: location.href.split("?")[0],
        cover: new Uint8Array(imgBuf),
        cover_mime: "image/jpeg",
        layric: [],
      });
      console.log(res);
      const url = URL.createObjectURL(uint8ArrayToBlob(res, "audio/wav"));
      GM_download({
        url,
        name: "ttttattata22.wav",
        onload: () => {
          console.log("ok");
        },
        onerror: (e) => {
          console.log("err", e);
        },
        ontimeout: () => {
          console.log("ontimeouterr");
        },
        onprogress: (e) => {
          console.log("onprogresserr", e);
        },
      });
    });
});

function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      const arrayBuffer = fileReader.result as ArrayBuffer;
      resolve(arrayBuffer);
    };
    fileReader.onerror = reject;
    fileReader.readAsArrayBuffer(blob);
  });
}
function blobToUint8Array(blob: Blob): Promise<Uint8Array> {
  return blobToArrayBuffer(blob).then((buff) => new Uint8Array(buff));
}
function uint8ArrayToBlob(array: Uint8Array, type?: string): Blob {
  return new Blob([array], { type });
}
function down() {
  // console.log(1, url);
}
</script>

<template>
  <div>
    <a-form-item>
      <a-button @click="$emit('prev')" style="margin-right: 10px">
        上一步
      </a-button>
      <a-button @click="down">下一步</a-button>
    </a-form-item>
  </div>
</template>

<style scoped></style>

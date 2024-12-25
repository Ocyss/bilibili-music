<script lang="ts" setup>
import { fromData } from "@/data";
import { request } from "@/utils/requests";
import audiobufferToBlob from "audiobuffer-to-blob";
import * as biliMusic from "@ocyss/bilibili-music-backend";
import Btn from "@/components/btn.vue";
import FileSaver from "file-saver";
import { GM_setValue } from "$";

const audioCtx = new AudioContext();
const steps = [
  "获取音频",
  "下载音频",
  "解码音频\n可能出现假死,耐心等待解码耗时长",
  "下载封面",
  "开始内嵌",
  "准备下载",
];
const stepIndex = ref(0);
const error = ref<string | null>();

const fileBlob = ref();
const status = computed(() =>
  error.value ? "error" : fileBlob.value ? "success" : null
);

function main() {
  stepIndex.value = 0;
  const avid = fromData.playerData?.aid;
  const cid = fromData.playerData?.cid;
  error.value = null;
  fileBlob.value = null;
  request
    .get({
      url: `https://api.bilibili.com/x/player/playurl?qn=120&otype=json&fourk=1&fnver=0&fnval=4048&avid=${avid}&cid=${cid}`,
    })
    .then(async (res: any) => {
      let audioUrl = undefined;
      let dash = res.data.dash;
      if (!dash) {
        error.value = "未找到音频";
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
      stepIndex.value++;
      const request = await fetch(audioUrl);
      if (!request.ok) {
        console.log({ audioUrl, request });
        error.value = `音频下载错误`;
      }
      const blob = await new Promise<Blob>((reactive) => {
        request
          .arrayBuffer()
          .then((arrBuf) => {
            stepIndex.value++;
            audioCtx.decodeAudioData(arrBuf, (buf) => {
              const blob = audiobufferToBlob(buf);
              reactive(blob);
            });
          })
          .catch((e) => {
            console.log(e);
            error.value = `解码失败`;
          });
      });
      return blob;
    })
    .then(async (blob) => {
      if (!blob) {
        error.value = `解码错误,为空`;
        return;
      }
      stepIndex.value++;
      let imgBuf: ArrayBuffer = new ArrayBuffer(0);
      if (fromData.coverUrl) {
        const img = await fetch(
          fromData.coverUrl!.replace("http://", "https://")
        );
        imgBuf = await img.arrayBuffer();
      }

      stepIndex.value++;

      const option: biliMusic.AddTagOption = {
        author: fromData.author,
        title: fromData.title,
        album: fromData.data?.album ?? "",
        host: location.href.split("?")[0],
        cover: new Uint8Array(imgBuf),
        cover_mime: "image/jpeg",
        layric: fromData.lyricsData ?? [],
      };

      console.log("开始内嵌", { data: fromData, option });
      const res = biliMusic.add_tag(await blobToUint8Array(blob), option);
      stepIndex.value++;
      fileBlob.value = uint8ArrayToBlob(res, "audio/wav");
    });
}

const download = () => {
  FileSaver.saveAs(fileBlob.value, fromData.file ?? "bilibili_music.wav");
};

onMounted(() => {
  main();
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

const saveDefault = () => {
  GM_setValue("default_rule", JSON.parse(JSON.stringify(fromData.record)));
};
</script>

<template>
  <div class="audio">
    <a-result
      :status="status"
      :title="error ?? `${stepIndex + 1}/${steps.length}:${steps[stepIndex]}`"
    >
      <template #icon v-if="status === null">
        <div class="loader">
          <svg class="circle-outer" viewBox="0 0 86 86">
            <circle class="back" cx="43" cy="43" r="40"></circle>
            <circle class="front" cx="43" cy="43" r="40"></circle>
            <circle class="new" cx="43" cy="43" r="40"></circle>
          </svg>
          <svg class="circle-middle" viewBox="0 0 60 60">
            <circle class="back" cx="30" cy="30" r="27"></circle>
            <circle class="front" cx="30" cy="30" r="27"></circle>
          </svg>
          <svg class="circle-inner" viewBox="0 0 34 34">
            <circle class="back" cx="17" cy="17" r="14"></circle>
            <circle class="front" cx="17" cy="17" r="14"></circle>
          </svg>
        </div>
      </template>
      <template #extra>
        <a-space v-if="stepIndex === steps.length - 1">
          <a-tooltip
            content="点击无反应/卡死/闪退,可去油猴配置(初学,高级)下更换下载模式尝试"
            position="top"
          >
            <a-button @click="download">开始下载</a-button>
          </a-tooltip>
        </a-space>
      </template>
    </a-result>
    <a-button @click="saveDefault">保存为默认规则</a-button>
    <Btn
      @prev="$emit('prev')"
      @next="main"
      :next="{ disabled: !fileBlob }"
      nextLabel="重试"
    />
  </div>
</template>

<style scoped>
* {
  white-space: pre-wrap;
}
.audio {
  display: flex;
  align-items: center;
  flex-direction: column;
}

.loader {
  --front-color: var(--brand_blue);
  --back-color: #c3c8de;
  --text-color: #414856;
  width: 100%;
  height: 64px;
  border-radius: 50px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 15px;
  svg {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  svg circle {
    position: absolute;
    fill: none;
    stroke-width: 6px;
    stroke-linecap: round;
    stroke-linejoin: round;
    transform: rotate(-100deg);
    transform-origin: center;
  }
  svg circle.back {
    stroke: var(--back-color);
  }

  svg circle.front {
    stroke: var(--front-color);
  }
  svg.circle-outer {
    height: 86px;
    width: 86px;
  }
  svg.circle-outer circle {
    stroke-dasharray: 62.75 188.25;
  }
  svg.circle-outer circle.back {
    animation: circle-outer135 1.8s ease infinite 0.3s;
  }
  svg.circle-outer circle.front {
    animation: circle-outer135 1.8s ease infinite 0.15s;
  }
  svg.circle-middle {
    height: 60px;
    width: 60px;
  }
  svg.circle-middle circle {
    stroke-dasharray: 42.5 127.5;
  }
  svg.circle-middle circle.back {
    animation: circle-middle6123 1.8s ease infinite 0.25s;
  }
  svg.circle-middle circle.front {
    animation: circle-middle6123 1.8s ease infinite 0.1s;
  }
  svg.circle-inner {
    height: 34px;
    width: 34px;
  }
  svg.circle-inner circle {
    stroke-dasharray: 22 66;
  }
  svg.circle-inner circle.back {
    animation: circle-inner162 1.8s ease infinite 0.2s;
  }
  svg.circle-inner circle.front {
    animation: circle-inner162 1.8s ease infinite 0.05s;
  }
}

@keyframes circle-outer135 {
  0% {
    stroke-dashoffset: 25;
  }

  25% {
    stroke-dashoffset: 0;
  }

  65% {
    stroke-dashoffset: 301;
  }

  80% {
    stroke-dashoffset: 276;
  }

  100% {
    stroke-dashoffset: 276;
  }
}

@keyframes circle-middle6123 {
  0% {
    stroke-dashoffset: 17;
  }

  25% {
    stroke-dashoffset: 0;
  }

  65% {
    stroke-dashoffset: 204;
  }

  80% {
    stroke-dashoffset: 187;
  }

  100% {
    stroke-dashoffset: 187;
  }
}

@keyframes circle-inner162 {
  0% {
    stroke-dashoffset: 9;
  }

  25% {
    stroke-dashoffset: 0;
  }

  65% {
    stroke-dashoffset: 106;
  }

  80% {
    stroke-dashoffset: 97;
  }

  100% {
    stroke-dashoffset: 97;
  }
}
</style>

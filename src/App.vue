<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import StepAudio from "@/steps/audio.vue";
import StepCover from "@/steps/cover.vue";
import StepEmbed from "@/steps/embed.vue";
import StepInfo from "@/steps/info.vue";
import StepLyrics from "@/steps/lyrics.vue";
import { fromData, reset } from "./data";
import { clone } from "./utils/deepmerge";
const visible = ref(true);
const current = ref(1);
const steps = [StepInfo, StepCover, StepLyrics, StepAudio, StepEmbed];

const handleOk = () => {
  visible.value = false;
};
const handleCancel = () => {
  visible.value = false;
};

function setCurrent(v: number) {
  current.value = v;
}

function onPrev() {
  current.value = Math.max(1, current.value - 1);
}

function onNext() {
  current.value = Math.min(steps.length, current.value + 1);
}

onMounted(() => {
  //每次运行都重置数据
  reset();
  const bgmTag = document.querySelector<HTMLDivElement & { __vue__: any }>(
    ".tag .bgm-tag"
  );
  const upName = document.querySelector(".up-name");
  fromData.upName = upName?.textContent?.trim();
  const music_id = bgmTag?.__vue__?.$props?.info?.music_id;
  console.log("获取到的Music ID:", music_id, bgmTag?.__vue__);

  fromData.videoData = clone(
    document.querySelector<HTMLDivElement & { __vue__: any }>("#playerWrap")!
      .__vue__.videoData
  );

  fetch(
    "https://api.bilibili.com/x/copyright-music-publicity/bgm/detail?" +
      new URLSearchParams({
        music_id,
      })
  )
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      fromData.data = data.data;
    })
    .catch((e) => {
      fromData.err = e;
    });
});
</script>

<template>
  <a-modal
    v-model:visible="visible"
    @ok="handleOk"
    @cancel="handleCancel"
    okText="默认规则下载"
    :maskClosable="false"
    :escToClose="false"
    :closable="false"
    draggable
  >
    <template #title>音乐姬{{ ">_<" }}下载服务🎶</template>
    <div
      style="display: flex; justify-content: space-between; align-items: center"
    >
      <a-steps
        :current="current"
        @change="setCurrent"
        direction="vertical"
        small
      >
        <a-step>基本信息</a-step>
        <a-step>封面获取</a-step>
        <a-step>歌词获取</a-step>
        <a-step>音频获取</a-step>
        <a-step>标签嵌入</a-step>
      </a-steps>
      <div
        :style="{
          flex: 1,
          textAlign: 'center',
          background: 'var(--color-bg-2)',
          color: '#C2C7CC',
        }"
      >
        <component
          v-if="fromData.data"
          :is="steps[current - 1]"
          @prev="onPrev"
          @next="onNext"
        />
      </div>
    </div>
  </a-modal>
</template>

<style scoped></style>

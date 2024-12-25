<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import StepAudio from "@/steps/audio.vue";
import StepCover from "@/steps/cover.vue";
import StepInfo from "@/steps/info.vue";
import StepMontage from "@/steps/montage.vue";
import StepLyrics from "@/steps/lyrics.vue";
import { fromData, reset } from "./data";
import { clone } from "./utils/deepmerge";
import { GM_getValue, GM_setValue } from "$";
import { Message } from "@arco-design/web-vue";
const visible = ref(true);
const current = ref(1);
const steps = [StepMontage, StepInfo, StepCover, StepLyrics, StepAudio];

const handleOk = () => {
  const defaultRule = GM_getValue("default_rule");
  if (!defaultRule) {
    Message.error("未找到默认规则");
    return false;
  }
  console.log(defaultRule);
  // visible.value = false;
  return false;
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

const sideShow = ref(true);
const fullscreen = ref(false);

function checkSide() {
  sideShow.value = !sideShow.value;
  GM_setValue("sideShow", sideShow.value);
}

onMounted(() => {
  sideShow.value = GM_getValue("sideShow") || true;
  //每次运行都重置数据
  reset();
  const bgmTag = document.querySelector<HTMLDivElement & { __vue__: any }>(
    ".tag .bgm-tag"
  );
  const music_id = bgmTag?.__vue__?.$props?.info?.music_id;
  if (!music_id) {
    fromData.err = "未找到音乐ID，后续操作无法继续";
    return;
  }
  console.log("获取到的Music ID:", music_id, bgmTag?.__vue__);

  fromData.videoData = clone(
    document.querySelector<HTMLDivElement & { __vue__: any }>("#playerWrap")
      ?.__vue__?.videoData
  );
  if (!fromData.videoData) {
    fromData.err = "未找到视频数据，后续操作无法继续";
    return;
  }
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

function onOpen() {
  document.body.style.overflow = "unset";
}
</script>

<template>
  <a-modal
    v-model:visible="visible"
    @open="onOpen"
    :maskClosable="false"
    :escToClose="false"
    :closable="false"
    :mask="false"
    :fullscreen="fullscreen"
    draggable
  >
    <template #title
      >音乐姬{{ ">_<" }}下载服务🎶
      <a-button
        style="position: absolute; right: 20px"
        @click="fullscreen = !fullscreen"
        size="small"
      >
        <template #icon>
          <icon-expand v-if="fullscreen" />
          <icon-shrink v-else />
        </template>
      </a-button>
    </template>
    <template #footer>
      <div style="display: flex; justify-content: space-between">
        <a-space>
          <a-button @click="checkSide"> 侧栏 </a-button>
        </a-space>
        <a-space>
          <a-button @click="handleCancel"> 取消 </a-button>
          <a-button type="primary" @click="handleOk"> 默认下载 </a-button>
        </a-space>
      </div>
    </template>
    <div
      style="display: flex; justify-content: space-between; align-items: center"
    >
      <a-steps
        :current="current"
        @change="setCurrent"
        direction="vertical"
        small
        v-show="sideShow"
      >
        <a-step>音频剪辑</a-step>
        <a-step>基本信息</a-step>
        <a-step>封面获取</a-step>
        <a-step>歌词获取</a-step>
        <a-step>音频内嵌</a-step>
      </a-steps>
      <div
        class="step-content"
        :style="{
          flex: 1,
          textAlign: 'center',
          background: 'var(--color-bg-2)',
          color: '#C2C7CC',
        }"
      >
        <a-result
          v-if="fromData.err"
          status="error"
          :title="fromData.err"
          subtitle="您可以重新打开弹窗, 重新获取数据, 或者刷新页面. 如果多次且更换视频也无法使用请联系开发者"
        />
        <component
          v-else-if="fromData.data"
          :is="steps[current - 1]"
          @prev="onPrev"
          @next="onNext"
        />
        <a-spin v-else />
      </div>
    </div>
  </a-modal>
</template>

<style>
.arco-modal-container,
.arco-modal-wrapper {
  pointer-events: none;
}
.arco-modal {
  pointer-events: auto;
  box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.1);
}
.step-content .arco-spin {
  width: 100%;
}
</style>

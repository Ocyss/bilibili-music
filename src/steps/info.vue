<script lang="ts" setup>
import { fromData } from "@/data";
import Btn from "@/components/btn.vue";

const invalidFileNameRegex = /[<>:"/\\|?*]/g;
onMounted(() => {
  fromData.title = `${fromData.data?.music_title}-${fromData.videoData?.owner.name}`;
  fromData.author = `${fromData.videoData?.owner.name}(原:${fromData.data?.origin_artist})`;
  fromData.file = `${fromData.title.replaceAll(invalidFileNameRegex, "")}.wav`;
});
</script>

<template>
  <a-spin :loading="!fromData.data">
    <a-form auto-label-width>
      <a-form-item label="音乐名">
        <a-input readonly :model-value="fromData.data?.music_title" />
      </a-form-item>
      <a-form-item label="原唱">
        <a-input readonly :model-value="fromData.data?.origin_artist" />
      </a-form-item>
      <a-form-item label="Up主">
        <a-input readonly :model-value="fromData.videoData?.owner.name" />
      </a-form-item>

      <a-form-item label="内嵌标题">
        <a-input v-model="fromData.title" />
      </a-form-item>
      <a-form-item label="内嵌作者">
        <a-input v-model="fromData.author" />
      </a-form-item>
      <a-form-item label="下载文件名">
        <a-input v-model="fromData.file" />
      </a-form-item>
      <Btn
        :prev="{ disabled: true }"
        @next="$emit('next')"
        @prev="$emit('prev')"
      />
    </a-form>
  </a-spin>
</template>

<style scoped></style>

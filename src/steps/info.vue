<script lang="ts" setup>
import { fromData } from "@/data";
</script>

<template>
  <a-spin :loading="!fromData.data">
    <a-form auto-label-width @submit="$emit('next')">
      <a-form-item label="音乐名">
        <a-input readonly :model-value="fromData.data?.music_title" />
      </a-form-item>
      <a-form-item label="原唱">
        <a-input readonly :model-value="fromData.data?.origin_artist" />
      </a-form-item>
      <a-form-item label="Up主">
        <a-input readonly :model-value="fromData.upName" />
      </a-form-item>

      <a-form-item label="内嵌标题">
        <a-input :model-value="fromData.data?.music_title" />
      </a-form-item>
      <a-form-item label="内嵌作者">
        <a-input :model-value="fromData.data?.music_title" />
      </a-form-item>
      <a-form-item label="下载文件名">
        <a-input :model-value="fromData.data?.music_title" />
      </a-form-item>
      <a-form-item>
        <a-button html-type="submit">下一步</a-button>
      </a-form-item>
    </a-form>
  </a-spin>
</template>

<style scoped></style>

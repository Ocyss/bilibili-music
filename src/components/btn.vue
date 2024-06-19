<script lang="ts" setup>
import { Button } from "@arco-design/web-vue";
type butProps = InstanceType<typeof Button>["$props"];
withDefaults(
  defineProps<{
    prev?: butProps;
    prevLabel?: string;
    next?: butProps;
    nextLabel?: string;
  }>(),
  {
    prevLabel: "上一步",
    nextLabel: "下一步",
  }
);
</script>

<template>
  <div
    :style="{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      margin: '20px 0',
    }"
  >
    <a-button v-bind="prev" @click="$emit('prev')" style="margin-right: 10px">
      {{ prevLabel }}
    </a-button>
    <a-button v-bind="next" @click="$emit('next')">{{ nextLabel }}</a-button>
  </div>
</template>

<style lang="scss" scoped></style>

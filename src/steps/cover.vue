<script lang="ts" setup>
import { fromData } from "@/data";
import { onMounted, reactive } from "vue";
import Btn from "@/components/btn.vue";

const covers = reactive<{ label: string; url?: string }[]>([]);

const cover = ref<string[]>([]);

onMounted(() => {
  covers.push({
    label: "视频封面",
    url: fromData.videoData?.pic,
  });
  covers.push({
    label: "音乐封面",
    url: fromData.data?.mv_cover,
  });
  covers.push({
    label: "Up主头像",
    url: fromData.videoData?.owner.face,
  });
  const url = covers?.[0]?.url;
  if (url) cover.value = [url];
});
const onChange = (v: (string | number | boolean)[]) => {
  const val = v.pop();
  if (val) {
    fromData.coverUrl = val.toString();
    cover.value = [val.toString()];
  } else {
    fromData.coverUrl = null;
    cover.value = [];
  }
};
</script>

<template>
  <a-spin :loading="!fromData.data || covers.length !== 3">
    <a-form auto-label-width>
      <a-checkbox-group :model-value="cover" @change="onChange">
        <template v-for="item in covers" :key="item.label">
          <a-checkbox :value="item.url">
            <template #checkbox="{ checked }">
              <a-space
                align="start"
                class="custom-checkbox-card"
                :class="{ 'custom-checkbox-card-checked': checked }"
              >
                <div className="custom-checkbox-card-mask">
                  <div className="custom-checkbox-card-mask-dot" />
                </div>
                <div>
                  <div className="custom-checkbox-card-title">
                    {{ item.label }}
                  </div>
                  <a-image width="80" :src="item.url" :preview="false" />
                </div>
              </a-space>
            </template>
          </a-checkbox>
        </template>
      </a-checkbox-group>

      <Btn @next="$emit('next')" @prev="$emit('prev')" />
    </a-form>
  </a-spin>
</template>

<style scoped></style>

<script lang="ts" setup>
import { fromData } from "@/data";
import { onMounted, reactive } from "vue";
import Btn from "@/components/btn.vue";

const emits = defineEmits(["next", "prev"]);
const covers = reactive<{ label: string; url?: string }[]>([]);

const cover = ref<string[]>([]);

onMounted(() => {

  covers.push({
    label: "视频封面",
    url: fromData.videoData?.pic,
  });

  if (fromData.data) {
    covers.push({
      label: "音乐封面",
      url: fromData.data?.mv_cover,
    });
  }
  covers.push({
    label: "Up主头像",
    url: fromData.videoData?.owner.face,
  });
  const url = covers?.[0]?.url;
  if (url) {
    fromData.coverUrl = url.toString();
    cover.value = [url];
    coverRecord.label = covers?.[0]?.label;
  }
});

const coverRecord = {
  label: undefined as string | undefined,
};

function next() {
  fromData.record.cover = coverRecord.label;
  emits("next");
}

const onChange = (v: (string | number | boolean)[]) => {
  const val = v.pop();
  if (val) {
    fromData.coverUrl = val.toString();
    cover.value = [val.toString()];

    coverRecord.label = covers.find(
      (item) => item.url === val.toString()
    )?.label;
  } else {
    fromData.coverUrl = null;
    cover.value = [];
    coverRecord.label = undefined;
  }
};
</script>

<template>
    <a-form auto-label-width :model="{}">
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

      <Btn @next="next" @prev="$emit('prev')" />
    </a-form>
</template>

<style scoped></style>

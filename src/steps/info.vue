<script lang="ts" setup>
import { fromData } from "@/data";
import Btn from "@/components/btn.vue";
import { GM_getValue, GM_setValue } from "$";

const emits = defineEmits(["next", "prev"]);

const invalidFileNameRegex = /[<>:"/\\|?*]/g;

const infoMaps = computed(() => [
  fromData.videoData?.title || "",
  fromData.videoData?.desc || "",
  fromData.videoData?.owner.name || "",
  fromData.data?.music_title || "",
  fromData.data?.origin_artist || "",
]);

const titleSelects = fromData.data?["4-3", "4-5", "1-3", "4", "1"]:["1-3","1"];
const authorSelects = fromData.data?["3(原:5)", "3-5", "3", "5"]:["3"];
const fileSelects = fromData.data?["4-3", "4-5", "1-3", "4", "1"]:["1-3","1"];

const infoRecord = {
  title: "",
  author: "",
  file: "",
};

function next() {
  fromData.record.format = infoRecord;
  emits("next");
}

const handleSelect = (type: keyof typeof infoRecord, format: string) => {
  GM_setValue(`${type}-format${!fromData.data ? "_no_music" : ""}`, format);
  infoRecord[type] = format;
  const maps = infoMaps.value;
  return format
    .replaceAll("1", maps[0])
    .replaceAll("2", maps[1])
    .replaceAll("3", maps[2])
    .replaceAll("4", maps[3])
    .replaceAll("5", maps[4]);
};

const handleTitleSelect = (value: string) => {
  fromData.title = handleSelect("title", value);
};

const handleAuthorSelect = (value: string) => {
  fromData.author = handleSelect("author", value);
};

const handleFileSelect = (value: string) => {
  const title = handleSelect("file", value);
  fromData.file = `${title.replaceAll(invalidFileNameRegex, "")}.wav`;
};

onMounted(() => {
  const noMusic = !fromData.data ? "_no_music" : "";
  const titleFormat = GM_getValue(`title-format${noMusic}`, titleSelects[0]);
  const authorFormat = GM_getValue(`author-format${noMusic}`, authorSelects[0]);
  const fileFormat = GM_getValue(`file-format${noMusic}`, fileSelects[0]);

  handleTitleSelect(titleFormat);
  handleAuthorSelect(authorFormat);
  handleFileSelect(fileFormat);
});
</script>

<template>
    <a-form auto-label-width :model="{}">
      <template v-if="fromData.videoData">
        <a-form-item label="标题(1)">
          <a-input v-model="fromData.videoData.title" />
        </a-form-item>
        <a-form-item label="简介(2)">
          <a-textarea
            v-model="fromData.videoData.desc"
            :auto-size="{
              minRows: 1,
              maxRows: 3,
            }"
          />
        </a-form-item>
        <a-form-item label="Up主(3)">
          <a-input v-model="fromData.videoData.owner.name" />
        </a-form-item>
      </template>
      <template v-if="fromData.data">
        <a-form-item label="音乐名(4)">
          <a-input v-model="fromData.data.music_title" />
        </a-form-item>
        <a-form-item label="原唱(5)">
          <a-input v-model="fromData.data.origin_artist" />
        </a-form-item>
      </template>

      <a-form-item label="内嵌标题">
        <a-input v-model="fromData.title" />
        <a-dropdown @select="handleTitleSelect">
          <a-button type="primary">
            <template #icon>
              <icon-settings />
            </template>
          </a-button>
          <template #content>
            <a-doption v-for="item in titleSelects" :key="item">
              {{ item }}
            </a-doption>
          </template>
        </a-dropdown>
      </a-form-item>
      <a-form-item label="内嵌作者">
        <a-input v-model="fromData.author" />
        <a-dropdown @select="handleAuthorSelect">
          <a-button type="primary">
            <template #icon>
              <icon-settings />
            </template>
          </a-button>
          <template #content>
            <a-doption v-for="item in authorSelects" :key="item">
              {{ item }}
            </a-doption>
          </template>
        </a-dropdown>
      </a-form-item>
      <a-form-item label="下载文件名">
        <a-input v-model="fromData.file" />
        <a-dropdown @select="handleFileSelect">
          <a-button type="primary">
            <template #icon>
              <icon-settings />
            </template>
          </a-button>
          <template #content>
            <a-doption v-for="item in fileSelects" :key="item">
              {{ item }}
            </a-doption>
          </template>
        </a-dropdown>
      </a-form-item>
      <Btn @next="next" @prev="$emit('prev')" />
    </a-form>
</template>

<style scoped></style>

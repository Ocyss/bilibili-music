<script lang="ts" setup>
import { fromData } from "@/data";
import { onMounted, ref } from "vue";
import { request } from "@/utils/requests";
import Btn from "@/components/btn.vue";
type SubTitle = PlayerData["subtitle"]["subtitles"][number];
const subtitles = ref<SubTitle[]>([]);

const subtitle = ref<string[]>([]);
const onChange = (v: (string | number | boolean)[]) => {
  const val = v.pop();
  if (val) {
    fromData.lyricsId = val.toString();
    subtitle.value = [val.toString()];
  } else {
    fromData.lyricsId = null;
    subtitle.value = [];
  }
};

onMounted(() => {
  if (!fromData.videoData) return;
  const cid = fromData.videoData.cid.toString();
  const bvid = fromData.videoData.bvid;
  const aid = fromData.videoData.aid.toString();
  // if (fromData.data) {
  //   request.get({ url: fromData.data.mv_lyric }).then((res) => {
  //     if (!fromData.data) return;
  //     console.log(fromData.data.mv_lyric, res);
  //     fromData.data.mv_lyric_data = res;
  //   });
  // }
  request
    .get({
      url:
        "https://api.bilibili.com/x/player/v2?" +
        new URLSearchParams({
          cid,
          bvid,
          aid,
        }),
    })
    .then(async (res: any) => {
      fromData.playerData = res.data;
      const _subtitles = await Promise.all(
        (res.data as PlayerData).subtitle.subtitles.map(async (item) => {
          item.data = await request.get({ url: `http:${item.subtitle_url}` });
          return item;
        })
      );
      subtitles.value = _subtitles;
      if (fromData.playerData)
        fromData.playerData.subtitle.subtitles = _subtitles;
      console.log(_subtitles);
    })
    .catch((err) => {
      console.log(err);
    });
});
</script>

<template>
  <a-spin
    :loading="
      !fromData.data ||
      !fromData.playerData ||
      fromData.playerData.subtitle.subtitles.length < 1
    "
  >
    <a-form auto-label-width>
      <a-checkbox-group
        v-model="subtitle"
        @change="onChange"
        v-if="fromData.playerData"
      >
        <template
          v-for="item in fromData.playerData.subtitle.subtitles"
          :key="item.id"
        >
          <a-checkbox :value="item.id_str">
            <template #checkbox="{ checked }">
              <a-space
                align="start"
                class="custom-checkbox-card"
                :class="{ 'custom-checkbox-card-checked': checked }"
                style="width: 100%"
              >
                <div className="custom-checkbox-card-mask">
                  <div className="custom-checkbox-card-mask-dot" />
                </div>
                <div>
                  <div className="custom-checkbox-card-title">
                    {{ item.lan_doc }}
                  </div>
                  <div
                    v-if="item.data"
                    style="
                      width: 100%;
                      height: 280px;
                      white-space: pre;
                      overflow-y: scroll;
                      color: #4f4d4d;
                    "
                  >
                    {{ item.data.body.map((item) => item.content).join("\n") }}
                  </div>
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

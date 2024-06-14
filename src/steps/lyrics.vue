<script lang="ts" setup>
import { fromData } from "@/data";
import { onMounted, ref } from "vue";
import { request } from "@/utils/requests";
type SubTitle = PlayerData["subtitle"]["subtitles"][number];
const subtitles = ref<SubTitle[]>([]);

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
    <a-form auto-label-width @submit="$emit('next')">
      <a-radio-group
        v-model="fromData.lyricsId"
        @change="(v:string) => fromData.lyricsId=v"
        v-if="fromData.playerData"
      >
        <template
          v-for="item in fromData.playerData.subtitle.subtitles"
          :key="item.id"
        >
          <a-radio :value="item.id_str">
            <template #radio="{ checked }">
              <a-space
                align="start"
                class="custom-radio-card"
                :class="{ 'custom-radio-card-checked': checked }"
              >
                <div className="custom-radio-card-mask">
                  <div className="custom-radio-card-mask-dot" />
                </div>
                <div>
                  <div className="custom-radio-card-title">
                    {{ item.lan_doc }}
                  </div>
                  <a-textarea
                    v-if="item.data"
                    style="height: 280px"
                    :model-value="
                      item.data.body.map((item) => item.content).join('\n')
                    "
                  />
                </div>
              </a-space>
            </template>
          </a-radio>
        </template>
      </a-radio-group>
      <a-form-item>
        <a-button @click="$emit('prev')" style="margin-right: 10px">
          上一步
        </a-button>
        <a-button html-type="submit">下一步</a-button>
      </a-form-item>
    </a-form>
  </a-spin>
</template>

<style scoped>
.custom-radio-card {
  padding: 10px 16px;
  border: 1px solid var(--color-border-2);
  border-radius: 4px;
  width: 250px;
  box-sizing: border-box;
}

.custom-radio-card-mask {
  height: 14px;
  width: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 100%;
  border: 1px solid var(--color-border-2);
  box-sizing: border-box;
}

.custom-radio-card-mask-dot {
  width: 8px;
  height: 8px;
  border-radius: 100%;
}

.custom-radio-card-title {
  color: var(--color-text-1);
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 8px;
}

.custom-radio-card:hover,
.custom-radio-card-checked,
.custom-radio-card:hover .custom-radio-card-mask,
.custom-radio-card-checked .custom-radio-card-mask {
  border-color: rgb(var(--primary-6));
}

.custom-radio-card-checked {
  background-color: var(--color-primary-light-1);
}

.custom-radio-card:hover .custom-radio-card-title,
.custom-radio-card-checked .custom-radio-card-title {
  color: rgb(var(--primary-6));
}

.custom-radio-card-checked .custom-radio-card-mask-dot {
  background-color: rgb(var(--primary-6));
}
</style>

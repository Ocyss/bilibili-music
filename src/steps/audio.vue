<script lang="ts" setup>
import { fromData } from "@/data";
import { request } from "@/utils/requests";
import { ID3Writer } from "browser-id3-writer";
import { GM_download } from "$";

onMounted(() => {
  const avid = fromData.playerData?.aid;
  const cid = fromData.playerData?.cid;
  request
    .get({
      url: `https://api.bilibili.com/x/player/playurl?qn=120&otype=json&fourk=1&fnver=0&fnval=4048&avid=${avid}&cid=${cid}`,
    })
    .then(async (res: any) => {
      let audioUrl = undefined;
      let dash = res.data.dash;
      if (!dash) {
        return;
      }
      let hiRes = dash.flac;
      let dolby = dash.dolby;
      if (hiRes && hiRes.audio) {
        audioUrl = hiRes.audio.baseUrl;
      } else if (dolby && dolby.audio) {
        audioUrl = dolby.audio[0].base_url;
      } else if (dash.audio) {
        audioUrl = dash.audio[0].baseUrl;
      }
      const request = await fetch(audioUrl);
      if (!request.ok) {
        // handle error
        console.error(`Unable to fetch ${audioUrl}`);
      }
      return await request.arrayBuffer();
    })
    .then(async (buf) => {
      console.log(buf);
      if (!buf) return;
      const img = await fetch(
        fromData.coverUrl!.replace("http://", "https://")
      );
      const imgBuf = await img.arrayBuffer();
      const writer = new ID3Writer(buf);
      writer
        .setFrame("TPE1", [fromData.author])
        .setFrame("TCOM", [fromData.author])
        .setFrame("TIT2", fromData.title)
        .setFrame("TALB", fromData.data?.album ?? "")
        .setFrame("TCOP", "Bilibili🎶")
        .setFrame(
          "WCOP",
          "Bilibili🎶音乐姬下载,仅供个人学习使用,严谨售卖和其他侵权行为,版权解释权为原作者|Up主|B站"
        )
        .setFrame("WOAS", location.href.split("?")[0])
        .setFrame("APIC", { type: 3, data: imgBuf, description: "cover" })
        .addTag();

      GM_download({
        url: writer.getURL(),
        name: "audio.mp3",
        onload: () => {
          console.log("下载完成");
        },
      });
    });
});
</script>

<template>
  <div>
    <a-form-item>
      <a-button @click="$emit('prev')" style="margin-right: 10px">
        上一步
      </a-button>
      <a-button @click="$emit('next')">下一步</a-button>
    </a-form-item>
  </div>
</template>

<style scoped></style>

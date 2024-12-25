<script lang="ts" setup>
import { fromData, userConfig } from "@/data";
import { onMounted, ref, computed, reactive } from "vue";
import { request } from "@/utils/requests";
import Btn from "@/components/btn.vue";
import { Message, SelectOptionGroup } from "@arco-design/web-vue";
import { callOpenAI } from "@/utils/gpt";
import { diffChars, diffWords, diffLines, Change } from "diff";
const emits = defineEmits(["next", "prev"]);

type SubTitle = PlayerData["subtitle"]["subtitles"][number];

const subtitles = ref<SubTitle[]>([]);

const subtitle = ref<string[]>([]);

const subtitleEdit = ref<SubTitle | null>(null);

const lyricsRecord = {
  label: undefined as string | undefined,
};

const onChange = (v: (string | number | boolean)[]) => {
  const val = v.pop();
  if (val) {
    subtitle.value = [val.toString()];
    const s = subtitles.value.find((item) => item.id_str === val.toString());
    lyricsRecord.label = s?.lan_doc;
  } else {
    fromData.lyricsData = null;
    subtitle.value = [];
    lyricsRecord.label = undefined;
  }
};

const error = ref("");

function next() {
  fromData.record.lyrics = lyricsRecord.label;
  if (subtitleEdit.value && subtitleEdit.value.data) {
    fromData.lyricsData = subtitleEdit.value.data._editBody
      .split("\n")
      .map((item, index) => [
        Math.round(subtitleEdit.value!.data!.body[index].from * 1000),
        item,
      ]);
  } else {
    {
      const s = subtitles.value.find(
        (item) => item.id_str === subtitle.value[0]
      );
      if (!s || !s.data) {
        Message.error("歌词数据错误");
        return;
      }
      fromData.lyricsData = s.data.body.map((item) => [
        Math.round(item.from * 1000),
        item.content,
      ]);
    }
  }
  emits("next");
}

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
        "https://api.bilibili.com/x/player/wbi/v2?" +
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
      if (_subtitles.length > 0) {
        const val = _subtitles[0].id_str;
        subtitle.value = [val];
        lyricsRecord.label = _subtitles[0].lan_doc;
      }
      // console.log(_subtitles);
    })
    .catch((err) => {
      error.value = err.message;
    });
});

const visible = ref(false);

const editLyricsData = ref<SubTitle | null>(null);

const onlineLyrics = ref<string>("");

const diffFunc = {
  no: [
    "不显示差异",
    (oldStr: string, newStr: string) => [{ value: newStr }] as Change[],
  ] as const,
  Chars: ["字符差异", diffChars] as const,
  Words: ["单词差异", diffWords] as const,
  Lines: ["行差异", diffLines] as const,
};

type DiffType = keyof typeof diffFunc;

const lyricsBodySwitch = reactive({
  timeAxis: false,
  blankChar: true,
  metaInfo: false,

  note: true,

  onlineDiff: "no" as DiffType,
  aiDiff: "no" as DiffType,
});

const onlineLyricsDiff = computed(() => {
  if (!editLyricsData.value?.data) return [];
  return diffFunc[lyricsBodySwitch.onlineDiff][1](
    editLyricsData.value.data._editBody,
    onlineLyricsContent.value
  );
});

const lyricsBodyLine = computed(() => {
  if (!editLyricsData.value?.data) return [0, 0];
  return [
    editLyricsData.value.data.body.length,
    editLyricsData.value.data._editBody.split("\n").length,
  ];
});

const lyricsBodyContent = computed(() => {
  if (!editLyricsData.value?.data) return "";
  if (lyricsBodySwitch.note) {
    return editLyricsData.value.data._editBody
      .split("\n")
      .map((item) => `♪ ${item} ♪`)
      .join("\n");
  }
  return editLyricsData.value.data._editBody;
});

function onlineLyricsContentFormat({
  metaInfo,
  timeAxis,
  blankChar,
}: {
  timeAxis: boolean;
  blankChar: boolean;
  metaInfo: boolean;
}) {
  let content = onlineLyrics.value;

  // 如果不显示元信息，移除类似 [ti:xxx] 格式的信息
  if (!metaInfo) {
    content = content.replace(/^\[(ti|ar|al|by|offset):.*?\]\n?/gm, "");
  }

  // 如果不显示时间轴，移除所有时间标记 [00:00.00] 格式
  if (!timeAxis) {
    content = content.replace(/\[\d{2}:\d{2}\.\d{2}\]/g, "");
  }

  // 如果不显示空白字符，移除空行
  if (!blankChar) {
    content = content
      .split("\n")
      .filter((line) => line.trim())
      .join("\n");
  }

  return content;
}

const onlineLyricsContent = computed(() => {
  return onlineLyricsContentFormat(lyricsBodySwitch);
});

const aiRewriteLoading = ref(false);
const aiRewriteContent = ref("");

const aiLyricsDiff = computed(() => {
  if (!editLyricsData.value?.data) return [];
  return diffFunc[lyricsBodySwitch.aiDiff][1](
    editLyricsData.value.data._editBody,
    aiRewriteContent.value
  );
});

const aiRewrite = async () => {
  const editBody = editLyricsData.value?.data?._editBody;
  if (!editBody) {
    Message.warning("没有可用的歌词内容");
    return;
  }
  aiRewriteLoading.value = true;
  const cleanLyrics = onlineLyricsContentFormat({
    timeAxis: false,
    blankChar: false,
    metaInfo: false,
  });

  const prompt = `请帮我纠正以下字幕，参考互联网歌词, 根据上下文和歌词拼音就行纠正：
\`\`\` 待纠正字幕
${editBody}
\`\`\`
\`\`\` 互联网歌词
${cleanLyrics}
\`\`\`
要求：
1. 保持原有的行数和结构
2. 不要改变歌词的基本含义
3. 返回纠正后的完整歌词, 使用 \`\`\` 包裹`;

  try {
    const result = await callOpenAI([
      {
        role: "system",
        content: `你是一个专业的字幕纠正专家。
你的任务是根据上下文和互联网歌词来纠正字幕中的错误。但不要改变字幕的行数和结构, 改变行数会导致字幕时间线错乱。
背景：我利用AI工具给视频添加字幕，但是错误率较高，常常导致我被老板批评, 但好在是音乐区可以联网查询歌词进行纠正，所以请你来配合我，
要是你也纠正不了，我们就只能被辞退了，而你将是导致我辞退的罪魁祸首!!`,
      },
      {
        role: "user",
        content: prompt,
      },
    ]);
    if (result && editLyricsData.value?.data?._editBody) {
      console.log("AI 改写结果", result);
      const match = result.match(/```[\s\S]*?\n([\s\S]*?)\n```/);
      aiRewriteContent.value = match ? match[1].trim() : result;
    }
  } finally {
    aiRewriteLoading.value = false;
  }
};

const onlineSearch = ref<string>(fromData.data?.music_title || "");

const onlineLyricsLoading = ref(false);
const onlineLyricsLoading2 = ref(false);

const onlineLyricsOptions = ref<SelectOptionGroup[]>([]);

const onlineLyricsIndex = ref<string>("");

watch(onlineLyricsIndex, (value) => {
  console.log("watch onlineLyricsIndex", value);
  if (value) {
    onlineLyricsLoading2.value = true;
    try {
      const [label, index] = value.split(".");
      const api = onlineLyricsApis.find((item) => item[0] === label);
      if (api) {
        request
          .get<string, "text">({
            url:
              api[1] +
              new URLSearchParams({ msg: onlineSearch.value, n: index }),
            cookie: false,
            responseType: "text",
          })
          .then((res) => {
            onlineLyrics.value = res;
          });
      }
    } catch (err) {
      Message.error("获取歌词失败" + (err as Error).message);
    } finally {
      onlineLyricsLoading2.value = false;
    }
  }
});

function handleOk() {
  subtitleEdit.value = JSON.parse(JSON.stringify(editLyricsData.value));
  visible.value = false;
}

function handleCancel() {
  visible.value = false;
}

const onlineLyricsApis = [
  ["hhlqilongzhu", "https://www.hhlqilongzhu.cn/api/dg_geci.php?type=2&", "."],
  ["52vmy", "https://api.52vmy.cn/api/music/lrc?type=text&", "、"],
];

async function searchOnlineLyrics() {
  if (!onlineSearch.value) return;
  onlineLyricsLoading.value = true;
  onlineLyricsOptions.value = [];
  onlineLyricsIndex.value = "";
  onlineLyrics.value = "";

  try {
    await Promise.all(
      onlineLyricsApis.map((item) => {
        return request
          .get<string, "text">({
            url:
              item[1] +
              new URLSearchParams({
                msg: onlineSearch.value,
              }),
            cookie: false,
            responseType: "text",
          })
          .then((res) => {
            const opt: SelectOptionGroup = {
              isGroup: true,
              label: item[0],
              options: [],
            };
            res.split("\n").forEach((lyrics) => {
              const [index, ...content] = lyrics.split(item[2]);
              if (index && content.length > 0) {
                const value = `${item[0]}.${index}`;
                opt.options.push({
                  label: content.join(item[2]),
                  value,
                });
                if (!onlineLyricsIndex.value) {
                  onlineLyricsIndex.value = value;
                }
              }
            });
            onlineLyricsOptions.value.push(opt);
          });
      })
    );
  } catch (err) {
    Message.error("搜索歌词失败" + (err as Error).message);
  } finally {
    onlineLyricsLoading.value = false;
  }
}

function editLyrics(item: SubTitle) {
  editLyricsData.value = JSON.parse(JSON.stringify(item)) as Subtitle2;
  if (editLyricsData.value.data) {
    editLyricsData.value.data._editBody = editLyricsData.value.data.body
      .map((item) => item.content.replaceAll(/(^♪ )|( ♪$)/g, ""))
      .join("\n");
  }
  onlineSearch.value = fromData.data?.music_title || "";

  searchOnlineLyrics();
  visible.value = true;
}
</script>

<template>
  <a-spin :loading="!fromData.data || (!fromData.playerData && !error)">
    <a-form auto-label-width :model="{}">
      <a-result
        v-if="error"
        status="error"
        :title="error"
        subtitle="请查看视频是否有字幕,包括AI字幕,如果没有,请跳过"
      />
      <a-checkbox-group
        v-model="subtitle"
        @change="onChange"
        v-else-if="fromData.playerData"
      >
        <template v-for="item in subtitles" :key="item.id">
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
                    <a-button
                      type="primary"
                      size="small"
                      @click="editLyrics(item)"
                    >
                      <template #icon>
                        <icon-settings />
                      </template>
                    </a-button>
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
      <Btn @next="next" @prev="$emit('prev')" />
    </a-form>
  </a-spin>
  <a-modal
    v-model:visible="visible"
    fullscreen
    :body-style="{ height: '100%' }"
  >
    <template #title> 歌词工作台 </template>
    <template #footer>
      <a-button @click="handleCancel"> 取消 </a-button>
      <a-button
        type="primary"
        :disabled="lyricsBodyLine[0] !== lyricsBodyLine[1]"
        @click="handleOk"
      >
        确定
      </a-button>
    </template>
    <div
      v-if="editLyricsData && editLyricsData.data"
      style="display: flex; height: 100%; justify-content: space-around"
    >
      <div style="width: 48%; display: flex; flex-direction: column">
        <div
          style="
            display: flex;
            justify-content: space-between;
            align-items: center;
          "
        >
          <a-alert
            :type="
              lyricsBodyLine[0] === lyricsBodyLine[1] ? 'warning' : 'error'
            "
            >不要手动换行, 改变行数 {{ lyricsBodyLine[0] }}/{{
              lyricsBodyLine[1]
            }}</a-alert
          >
        </div>
        <a-textarea
          style="flex: 1; margin-right: 10px"
          v-model="editLyricsData.data._editBody"
        />
        格式化：
        <a-input-group>
          <a-checkbox v-model="lyricsBodySwitch.note"> ♪ </a-checkbox>
        </a-input-group>
      </div>
      <a-tabs style="width: 48%; display: flex; flex-direction: column" justify>
        <a-tab-pane key="1" title="在线歌词">
          <a-spin
            style="height: 100%; display: flex; flex-direction: column"
            :loading="onlineLyricsLoading || onlineLyricsLoading2"
            tip="正在搜索在线歌词"
          >
            <a-input-group>
              <a-input
                :style="{ width: '160px' }"
                placeholder="歌名"
                v-model="onlineSearch"
              />
              <a-button @click="searchOnlineLyrics">
                <template #icon>
                  <icon-search />
                </template>
              </a-button>
              <a-select
                :options="onlineLyricsOptions"
                :style="{ width: '160px' }"
                placeholder="在线歌词"
                v-model="onlineLyricsIndex"
              />
              <a-checkbox v-model="lyricsBodySwitch.timeAxis"
                >时间轴</a-checkbox
              >
              <a-checkbox v-model="lyricsBodySwitch.blankChar"
                >空白字符</a-checkbox
              >
              <a-checkbox v-model="lyricsBodySwitch.metaInfo"
                >元信息</a-checkbox
              >
            </a-input-group>
            <div style="margin-top: 10px; flex: 1; overflow: auto">
              <a-select
                v-model="lyricsBodySwitch.onlineDiff"
                style="margin-bottom: 10px"
              >
                <a-option
                  v-for="[key, [label]] in Object.entries(diffFunc)"
                  :key="key"
                  :value="key"
                >
                  {{ label }}
                </a-option>
              </a-select>

              <div class="diff-container-textarea">
                <span
                  v-for="(part, index) in onlineLyricsDiff"
                  :key="index"
                  :style="{
                    backgroundColor: part.added
                      ? '#e6ffe6'
                      : part.removed
                      ? '#ffe6e6'
                      : 'transparent',
                  }"
                  >{{ part.value }}</span
                >
              </div>
            </div>
          </a-spin>
        </a-tab-pane>
        <a-tab-pane key="2" title="AI 改写">
          <a-button-group>
            <a-alert type="info"
              >将网络歌词交给AI进行纠正(prompt待优化)</a-alert
            >
            <a-button type="primary" @click="aiRewrite">AI 改写</a-button>
            <a-trigger trigger="click" :unmount-on-close="false">
              <a-button type="primary">
                <template #icon> <icon-settings /> </template>
              </a-button>
              <template #content>
                <div
                  style="
                    padding: 10px;
                    width: 200px;
                    background-color: var(--color-bg-popup);
                    border-radius: 4px;
                    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.15);
                  "
                >
                  <a-input
                    placeholder="Host"
                    v-model="userConfig.openai.host"
                  />
                  <a-input placeholder="Key" v-model="userConfig.openai.key" />
                  <a-input
                    placeholder="Modal"
                    v-model="userConfig.openai.modal"
                  />
                </div>
              </template>
            </a-trigger>
          </a-button-group>
          <a-spin
            style="margin-top: 10px; height: 100%; overflow: auto; width: 100%"
            :loading="aiRewriteLoading"
          >
            <a-select
              v-model="lyricsBodySwitch.aiDiff"
              style="margin-bottom: 10px"
            >
              <a-option
                v-for="[key, [label]] in Object.entries(diffFunc)"
                :key="key"
                :value="key"
              >
                {{ label }}
              </a-option>
            </a-select>
            <div class="diff-container-textarea">
              <span
                v-for="(part, index) in aiLyricsDiff"
                :key="index"
                :style="{
                  backgroundColor: part.added
                    ? '#e6ffe6'
                    : part.removed
                    ? '#ffe6e6'
                    : 'transparent',
                }"
                >{{ part.value }}</span
              >
            </div>
          </a-spin>
        </a-tab-pane>
        <a-tab-pane key="3" title="结果预览">
          <a-textarea style="height: 100%" :model-value="lyricsBodyContent" />
        </a-tab-pane>
      </a-tabs>
    </div>
  </a-modal>
</template>

<style>
.custom-checkbox-card-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.arco-textarea {
  resize: none;
}
.diff-container-textarea {
  white-space: pre-wrap;
  font-family: monospace;
  background: #f5f5f5;
  width: 100%;
  padding-right: 0;
  padding-left: 0;
  color: inherit;
  border: none;
  border-radius: 0;
  outline: 0;
  cursor: inherit;
  /* -webkit-tap-highlight-color: transparent; */
  display: block;
  box-sizing: border-box;
  min-height: 32px;
  padding: 4px 12px;
  font-size: 14px;
  line-height: 1.5715;
  resize: vertical;
  font-family: var(--bew-font-family, var(--bew-fonts-mandarin-cn));
}
</style>

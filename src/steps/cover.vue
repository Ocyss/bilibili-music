<script lang="ts" setup>
import { fromData } from "@/data";
import { onMounted, reactive } from "vue";

const covers = reactive<{ label: string; url?: string }[]>([]);
onMounted(() => {
  const video = document.querySelector<HTMLMetaElement>(
    'meta[itemprop="image"]'
  )?.content;
  covers.push({
    label: "视频封面",
    url: video,
  });
  covers.push({
    label: "音乐封面",
    url: fromData.data?.mv_cover,
  });
  const avatar = document.querySelector<HTMLLinkElement>(
    ".up-info-container .bili-avatar-img"
  )?.dataset?.src;
  covers.push({
    label: "Up主头像",
    url: avatar,
  });
});
</script>

<template>
  <a-spin :loading="!fromData.data || covers.length !== 3">
    <a-form auto-label-width @submit="$emit('next')">
      <a-form-item label="封面选择">
        <a-radio-group
          v-model="fromData.coverUrl"
          @change="(v:string) => fromData.coverUrl=v"
        >
          <template v-for="item in covers" :key="item.label">
            <a-radio :value="item.url">
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
                      {{ item.label }}
                    </div>
                    <a-image width="80" :src="item.url" />
                  </div>
                </a-space>
              </template>
            </a-radio>
          </template>
        </a-radio-group>
      </a-form-item>

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

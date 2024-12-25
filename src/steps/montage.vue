<script lang="ts" setup>
import { fromData } from "@/data";
import { onMounted, reactive, ref, computed } from "vue";
import Btn from "@/components/btn.vue";

interface DeletedSection {
  start: number;
  end: number;
  id: number;
}

let video: HTMLVideoElement | null = null;
const currentTime = ref(0);
const duration = ref(0);
const deletedSections = ref<DeletedSection[]>([]);
const isRecording = ref(false);
const tempStart = ref(0);
const isAuditioning = ref(false);
const isPlaying = ref(false);

// 添加时间提示和拖动状态
const isDragging = ref(false);
const hoverTime = ref<number | null>(null);
const tooltipStyle = ref({
  left: "0px",
  display: "none",
});

// 格式化时间显示
const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

// 计算时间位置
const calculateTimeFromEvent = (event: MouseEvent, element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  const offsetX = event.clientX - rect.left;
  return (offsetX / rect.width) * duration.value;
};

// 处理鼠标移动
const handleTimelineMouseMove = (event: MouseEvent) => {
  const timeline = event.currentTarget as HTMLElement;
  const time = calculateTimeFromEvent(event, timeline);
  hoverTime.value = time;

  // 更新提示框位置
  tooltipStyle.value = {
    left: `${event.clientX}px`,
    display: "block",
  };

  // 如果正在拖动，更新视频时间
  if (isDragging.value && video) {
    video.currentTime = time;
  }
};

// 处理鼠标离开
const handleTimelineMouseLeave = () => {
  if (!isDragging.value) {
    hoverTime.value = null;
    tooltipStyle.value.display = "none";
  }
};

// 处理鼠标按下
const handleTimelineMouseDown = (event: MouseEvent) => {
  isDragging.value = true;
  document.addEventListener("mousemove", handleDocumentMouseMove);
  document.addEventListener("mouseup", handleDocumentMouseUp);
};

// 处理文档鼠标移动（拖动时）
const handleDocumentMouseMove = (event: MouseEvent) => {
  if (isDragging.value) {
    const timeline = document.querySelector(".timeline") as HTMLElement;
    if (timeline) {
      handleTimelineMouseMove({
        ...event,
        currentTarget: timeline,
      } as MouseEvent);
    }
  }
};

// 处理文档鼠标松开
const handleDocumentMouseUp = () => {
  isDragging.value = false;
  hoverTime.value = null;
  tooltipStyle.value.display = "none";
  document.removeEventListener("mousemove", handleDocumentMouseMove);
  document.removeEventListener("mouseup", handleDocumentMouseUp);
};

// 更新当前时间和视频总长度
const updateTime = () => {
  currentTime.value = video?.currentTime ?? 0;
  duration.value = video?.duration ?? 0;
};

// 从当前开始删除（删除从当前到结尾的部分）
const startFromCurrent = () => {
  deletedSections.value.push({
    start: currentTime.value,
    end: duration.value,
    id: Date.now(),
  });
  sortSections();
  mergeSections();
};

// 删除到当前（删除从开始到当前的部分）
const endAtCurrent = () => {
  deletedSections.value.push({
    start: 0,
    end: currentTime.value,
    id: Date.now(),
  });
  sortSections();
  mergeSections();
};

// 开始记录要删除的片段
const startRecording = () => {
  isRecording.value = true;
  tempStart.value = currentTime.value;
};

// 结束记录要删除的片段
const endRecording = () => {
  if (currentTime.value === tempStart.value) {
    isRecording.value = false;
    return;
  }
  if (isRecording.value) {
    deletedSections.value.push({
      start: tempStart.value,
      end: currentTime.value,
      id: Date.now(),
    });
    isRecording.value = false;
    sortSections();
    mergeSections();
  }
};

// 删除标记的删除片段
const removeSection = (id: number) => {
  deletedSections.value = deletedSections.value.filter(
    (section) => section.id !== id
  );
};

// 按时间排序删除片段
const sortSections = () => {
  deletedSections.value.sort((a, b) => a.start - b.start);
};

// 合并重叠的删除片段
const mergeSections = () => {
  if (deletedSections.value.length <= 1) return;

  const merged: DeletedSection[] = [];
  let current = { ...deletedSections.value[0] };

  for (let i = 1; i < deletedSections.value.length; i++) {
    const section = deletedSections.value[i];
    if (section.start <= current.end) {
      // 有重叠，合并片段
      current.end = Math.max(current.end, section.end);
    } else {
      // 无重叠，保存当前片段并开始新片段
      merged.push(current);
      current = { ...section };
    }
  }
  merged.push(current);

  deletedSections.value = merged;
};

function seekTo(time: number) {
  if (video) {
    video.currentTime = time;
  }
}

// 添加临时记录片段的显示
const tempSection = computed(() => {
  if (!isRecording.value) return null;
  return {
    start: tempStart.value,
    end: currentTime.value,
  };
});

// 修改试听功能，添加跳过删除片段的逻辑
const startAudition = () => {
  if (isAuditioning.value) {
    if (video) {
      video.pause();
      isAuditioning.value = false;
    }
  } else {
    isAuditioning.value = true;
    if (video) {
      video.currentTime = 0;
      video.play().catch((error) => {
        console.error("视频播放失败:", error);
        isAuditioning.value = false;
      });
    }
  }
};

// 添加视频时间更新处理函数
const handleTimeUpdate = () => {
  if (!video) return;

  updateTime();

  // 试听时检查是否在删除片段中
  if (isAuditioning.value) {
    const currentVideoTime = video.currentTime;
    for (const section of deletedSections.value) {
      if (currentVideoTime >= section.start && currentVideoTime < section.end) {
        // 如果在删除片段中，跳到片段结束位置
        video.currentTime = section.end;
        break;
      }
    }
  }
};

// 添加播放/暂停功能
const togglePlay = () => {
  if (!video) return;

  if (isPlaying.value) {
    video.pause();
  } else {
    video.play().catch((error) => {
      console.error("视频播放失败:", error);
    });
  }
};

// 提取事件处理函数
const handlePlay = () => {
  isPlaying.value = true;
};

const handlePause = () => {
  isPlaying.value = false;
};

const handleEnded = () => {
  isAuditioning.value = false;
};

onMounted(() => {
  video = document.querySelector(`.bpx-player-video-wrap video`);
  if (video) {
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    currentTime.value = video.currentTime;
    duration.value = video.duration;
  }
});

onUnmounted(() => {
  if (video) {
    video.removeEventListener("timeupdate", handleTimeUpdate);
    video.removeEventListener("ended", handleEnded);
    video.removeEventListener("play", handlePlay);
    video.removeEventListener("pause", handlePause);
  }
  document.removeEventListener("mousemove", handleDocumentMouseMove);
  document.removeEventListener("mouseup", handleDocumentMouseUp);
});

// 添加进度条点击跳转
const handleTimelineClick = (event: MouseEvent) => {
  const timeline = event.currentTarget as HTMLElement;
  const rect = timeline.getBoundingClientRect();
  const offsetX = event.clientX - rect.left;
  const percentage = offsetX / rect.width;
  const newTime = percentage * duration.value;

  if (video) {
    video.currentTime = newTime;
  }
};
</script>

<template>
  <a-spin :loading="!fromData.data">
    <div class="montage-container">
      <a-spin :loading="isAuditioning">
        <!-- 控制按钮 -->
        <div class="control-buttons">
          <div>
            <a-button @click="endAtCurrent">从这开头</a-button>
            <a-button @click="startFromCurrent">从这结尾</a-button>
          </div>
          <div>
            <a-button
              type="primary"
              @click="startRecording"
              :disabled="isRecording"
            >
              <template #icon>
                <icon-play-circle-fill v-if="!isPlaying" />
                <icon-pause-circle-fill v-else />
              </template>
              开始记录
            </a-button>
            <a-button @click="togglePlay">
              <template #icon>
                <icon-play-circle-fill v-if="!isPlaying" />
                <icon-pause-circle-fill v-else />
              </template>
            </a-button>
            <a-button
              @click="endRecording"
              :disabled="!isRecording"
              type="primary"
            >
              <template #icon>
                <icon-play-circle-fill v-if="!isPlaying" />
                <icon-pause-circle-fill v-else />
              </template>
              结束记录
            </a-button>
          </div>
        </div>

        <!-- 进度条 -->
        <div
          class="timeline"
          v-if="duration"
          @mousemove="handleTimelineMouseMove"
          @mouseleave="handleTimelineMouseLeave"
          @mousedown="handleTimelineMouseDown"
        >
          <div class="timeline-inner">
            <div
              v-for="section in deletedSections"
              :key="section.id"
              class="deleted-segment"
              :style="{
                left: `${(section.start / duration) * 100}%`,
                width: `${((section.end - section.start) / duration) * 100}%`,
              }"
            ></div>
            <div
              v-if="tempSection"
              class="recording-segment"
              :style="{
                left: `${(tempSection.start / duration) * 100}%`,
                width: `${
                  ((tempSection.end - tempSection.start) / duration) * 100
                }%`,
              }"
            ></div>
          </div>
          <div
            class="current-time-marker"
            :style="{ left: `${(currentTime / duration) * 100}%` }"
          ></div>
          <!-- 添加时间提示 -->
          <div
            v-if="hoverTime !== null"
            class="time-tooltip"
            :style="tooltipStyle"
          >
            {{ formatTime(hoverTime) }}
          </div>
        </div>

        <!-- 删除片段列表 -->
        <a-list :max-height="200">
          <a-list-item v-for="section in deletedSections" :key="section.id">
            <span style="margin-right: 10px">
              <a @click="seekTo(section.start)"
                >{{ section.start.toFixed(2) }}s</a
              >
              -
              <a @click="seekTo(section.end)">{{ section.end.toFixed(2) }}s</a>
            </span>
            <a-button status="danger" @click="removeSection(section.id)">
              <template #icon> <icon-close /> </template
            ></a-button>
          </a-list-item>
        </a-list>
      </a-spin>
      <Btn prevLabel="试听" @next="$emit('next')" @prev="startAudition" />
    </div>
  </a-spin>
</template>

<style scoped>
.montage-container {
  padding: 20px;
}

.control-buttons {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  flex-direction: column;
  > div {
    display: flex;
    justify-content: space-around;
  }
}

.timeline {
  height: 30px;
  background: #52c41a;
  position: relative;
  margin: 20px 0;
  cursor: pointer;
  user-select: none; /* 防止拖动时选中文本 */
}

.timeline-inner {
  height: 100%;
  position: relative;
}

.deleted-segment {
  position: absolute;
  height: 100%;
  background: #ff4d4f; /* 删除部分显示红色 */
  opacity: 0.6;
}

.current-time-marker {
  position: absolute;
  top: 0;
  width: 2px;
  height: 100%;
  background: #1890ff;
  transform: translateX(-50%);
}

.sections-list {
  margin-top: 20px;
}

.section-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.recording-segment {
  position: absolute;
  height: 100%;
  background: #722ed1; /* 使用紫色表示正在记录 */
  opacity: 0.6;
}

.time-tooltip {
  position: fixed;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.75);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  pointer-events: none; /* 防止提示框影响鼠标事件 */
  top: -30px; /* 调整提示框位置 */
  z-index: 1;
}
</style>

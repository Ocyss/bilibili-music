export async function drop(droppedFiles?: FileList) {
  if (!droppedFiles?.length) {
    showError("没有检测到文件");
    return;
  }
  for (let i = 0; i < droppedFiles.length; i++) {
    const audioFile = droppedFiles[i];
    if (!audioFile.name.toLowerCase().endsWith(".wav")) {
      showError("请拖入WAV格式的音频文件");
      return;
    }

    try {
      const arrayBuffer = await audioFile.arrayBuffer();

      const buffer = new Uint8Array(arrayBuffer);
      const id3Start = findID3Tag(buffer);

      if (id3Start === -1) {
        showError("未找到音频源信息");
        return;
      }

      const sourceUrl = findAudioSourceWebpage(buffer.slice(id3Start));

      if (!sourceUrl) {
        showError("未找到原始视频链接");
        return;
      }

      window.open(sourceUrl, "_blank");
    } catch (err: any) {
      showError(`文件读取失败: ${err.message}`);
    }
  }
}

function showError(message: string) {
  const errorDiv = document.createElement("div");
  errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background-color: #ff4444;
      color: white;
      padding: 12px 24px;
      border-radius: 4px;
      z-index: 10000;
      font-size: 14px;
    `;
  errorDiv.textContent = message;
  document.body.appendChild(errorDiv);

  setTimeout(() => {
    errorDiv.style.opacity = "0";
    errorDiv.style.transition = "opacity 0.3s";
    setTimeout(() => errorDiv.remove(), 300);
  }, 3000);
}

function findID3Tag(buffer: Uint8Array): number {
  for (let i = 0; i < buffer.length - 3; i++) {
    if (
      buffer[i] === 0x49 && // 'I'
      buffer[i + 1] === 0x44 && // 'D'
      buffer[i + 2] === 0x33
    ) {
      // '3'
      return i;
    }
  }
  return -1;
}

function findAudioSourceWebpage(buffer: Uint8Array): string | null {
  const decoder = new TextDecoder();

  // 跳过ID3头部10字节
  let pos = 10;

  // 添加最大帧大小限制，防止异常数据
  const MAX_FRAME_SIZE = 1024 * 1024; // 1MB

  while (pos < buffer.length - 10) {
    // 确保有足够的字节来读取帧头
    if (pos + 10 > buffer.length) {
      break;
    }

    // 验证帧ID是否包含有效的ASCII字符
    const isValidFrameId = buffer
      .slice(pos, pos + 4)
      .every((byte) => (byte >= 0x20 && byte <= 0x7e) || byte === 0x00);

    if (!isValidFrameId) {
      console.warn("检测到无效的帧ID");
      break;
    }

    // 读取帧ID（4字节）
    const frameId = decoder.decode(buffer.slice(pos, pos + 4));

    // 使用无符号整数读取帧大小，避免负数
    const frameSize =
      ((buffer[pos + 4] & 0x7f) << 24) |
      ((buffer[pos + 5] & 0x7f) << 16) |
      ((buffer[pos + 6] & 0x7f) << 8) |
      (buffer[pos + 7] & 0x7f);

    // 验证frameSize的有效性
    if (frameSize <= 0 || frameSize > MAX_FRAME_SIZE) {
      console.warn(`无效的帧大小: ${frameSize}, frameId: ${frameId}`);
      break;
    }

    // 确保有足够的字节来读取帧内容
    if (pos + 10 + frameSize > buffer.length) {
      console.warn("帧大小超出缓冲区范围");
      break;
    }

    // 跳过帧标志（2字节）
    pos += 10;

    if (frameId === "WOAS") {
      try {
        const urlData = decoder.decode(buffer.slice(pos, pos + frameSize - 1));
        if (urlData.startsWith("http")) {
          return urlData;
        }
      } catch (e) {
        console.warn("URL解码失败");
      }
    }

    console.log("bilibili_drop", frameId, frameSize);
    pos += frameSize;
  }

  return null;
}

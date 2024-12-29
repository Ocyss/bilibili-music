# Bilibili🎶音乐姬

## 项目简介

**Bilibili🎶音乐姬** 是一个油猴脚本，旨在帮助用户从哔哩哔哩（Bilibili）视频网站下载音频。此脚本支持下载音频封面、标签（Tags）、歌词和字幕并写入音频文件。用户可以选择使用视频封面或UP主的头像作为音频封面。

## 主要功能和特点

- **音频下载**: 直接从哔哩哔哩视频中提取并下载音频。
- **封面选择**: 可以选择使用视频封面或UP主的头像作为音频封面。
- **标签和元数据**: 自动添加标签（Tags）和元数据到下载的音频文件。
- **歌词嵌入**: 支持将AI字幕当作歌词嵌入到音频文件中。

### v0.0.4

- **歌词工作台**: 支持编辑歌词，联网修正歌词，歌词样式, AI修正
- **音频工作台**: 简易的片段选择，去除不需要的片段

### v0.0.5

- **音频拖拽**: 支持拖拽音频文件到B站任意位置即可打开对应的视频

## 预览图

- 椒盐音乐(安卓)
[![pAXi28S.jpg](https://s21.ax1x.com/2024/12/21/pAXi28S.jpg)](https://imgse.com/i/pAXi28S)

- MusicPlayer2(Windows)
[![pAXiDHI.png](https://s21.ax1x.com/2024/12/21/pAXiDHI.png)](https://imgse.com/i/pAXiDHI)

- 下载页面
[![pkrWLb8.md.png](https://s21.ax1x.com/2024/06/23/pkrWLb8.md.png)](https://imgse.com/i/pkrWLb8)

- Mini剪辑
[![pAvDzPH.md.png](https://s21.ax1x.com/2024/12/27/pAvDzPH.md.png)](https://imgse.com/i/pAvDzPH)

- 歌词工作台
[![pAvDvIe.md.png](https://s21.ax1x.com/2024/12/27/pAvDvIe.md.png)](https://imgse.com/i/pAvDvIe)

## 已知问题

1. 使用了`WASM`技术,低版本浏览器可能会导致下载失败。
2. 不同应用程序读取歌词的逻辑各不相同,无法确定是否支持。
3. 转码音频页面卡死

## TODO (欢迎PR)

1. 使用`WASM`进行转码
2. 后端错误处理优化
3. 歌词工作台，支持确认后再编辑，重置编辑内容等
4. 允许调整歌词时间轴，让歌词显示更加和谐

- **脚本模板**: 根据预设一键下载音频，跳过繁琐步骤
- **额外标签嵌入**: 支持更多标签，自定义内容嵌入


## 安全声明

使用本脚本下载音频文件时，请注意以下几点：

1. **个人使用**: 本脚本仅供个人学习和娱乐使用，请勿用于商业用途。
2. **尊重版权**: 请尊重视频和音频的原始创作者的版权。下载的音频文件仅供个人收藏，请勿进行再分发或商业化。
3. **风险提示**: 使用本脚本可能会违反哔哩哔哩网站的服务条款，请自行承担使用本脚本可能带来的风险。

## 相关链接

Github开源地址: <https://github.com/ocyss/bilibili-music>

greasyfork地址: <https://greasyfork.org/zh-CN/scripts/>

## 鸣谢

- <https://github.com/lisonge/vite-plugin-monkey>

歌词Api提供商:

- <https://api.aa1.cn/doc/qqmusic_geci.html>
- <https://api.aa1.cn/doc/geci.html>

## 最后

嗯...

## Star 趋势

<a href="https://star-history.com/#ocyss/bilibili-music&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=ocyss/bilibili-music&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=ocyss/bilibili-music&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=ocyss/bilibili-music&type=Date" />
 </picture>
</a>
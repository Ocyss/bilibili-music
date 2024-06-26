# Bilibili🎶音乐姬

## 项目简介

**Bilibili🎶音乐姬** 是一个油猴脚本，旨在帮助用户从哔哩哔哩（Bilibili）视频网站下载音频。此脚本支持下载音频封面、标签（Tags）、歌词和字幕并写入音频文件。用户可以选择使用视频封面或UP主的头像作为音频封面。

## 主要功能和特点

- **音频下载**: 直接从哔哩哔哩视频中提取并下载音频。
- **封面选择**: 可以选择使用视频封面或UP主的头像作为音频封面。
- **标签和元数据**: 自动添加标签（Tags）和元数据到下载的音频文件。
- **歌词嵌入**: 支持将AI字幕当作歌词嵌入到音频文件中。

## 预览图

- 椒盐音乐(安卓)
[![pkrWXVS.md.jpg](https://s21.ax1x.com/2024/06/23/pkrWXVS.md.jpg)](https://imgse.com/i/pkrWXVS)

- MusicPlayer2(Windows)
[![pkrWjUg.md.png](https://s21.ax1x.com/2024/06/23/pkrWjUg.md.png)](https://imgse.com/i/pkrWjUg)

- 下载页面
[![pkrWLb8.md.png](https://s21.ax1x.com/2024/06/23/pkrWLb8.md.png)](https://imgse.com/i/pkrWLb8)

## 已知问题

1. 使用了`WASM`技术,低版本浏览器可能会导致下载失败。
2. 不同应用程序读取歌词的逻辑各不相同,无法确定是否支持。
3. 转码音频页面卡死

## TODO

1. 使用`WASM`进行转码

## 安全声明

使用本脚本下载音频文件时，请注意以下几点：

1. **个人使用**: 本脚本仅供个人学习和娱乐使用，请勿用于商业用途。
2. **尊重版权**: 请尊重视频和音频的原始创作者的版权。下载的音频文件仅供个人收藏，请勿进行再分发或商业化。
3. **风险提示**: 使用本脚本可能会违反哔哩哔哩网站的服务条款，请自行承担使用本脚本可能带来的风险。

## 相关链接

Github开源地址: <https://github.com/ocyss/bilibili-music>

greasyfork地址: <https://greasyfork.org/zh-CN/scripts/>

## 参与贡献

> 本项目写的一托,包括文件名,变量名,不完整的注释,解释不到位的help...,如果有更好的命名,功能解释,文件结构优化方案,请直接提交pr,让你的名字出现到贡献者名单中。

1. Fork 本仓库并克隆到本地。
2. 在新分支上进行您的更改：`git checkout -b 您的分支名称`
3. 提交更改：`git commit -am '描述您的更改'`
4. 推送更改到您的 Fork：`git push origin 您的分支名称`
5. 提交 Pull 请求。

- 在开发时server模式会注入脚本,也可能导致跨域问题请禁用以下两个策略
  
  chrome 用户:

  - chrome://flags/#block-insecure-private-network-requests
  - chrome://flags/#private-network-access-respect-preflight-results

  edge 用户:

  - edge://flags/#block-insecure-private-network-requests
  - edge://flags/#private-network-access-respect-preflight-results

## 鸣谢

- <https://github.com/lisonge/vite-plugin-monkey>

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
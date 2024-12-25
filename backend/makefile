SHELL = /bin/bash
.SHELLFLAGS := -eu -o pipefail -c
.DEFAULT_GOAL := build
.DELETE_ON_ERROR:
.SUFFIXES:

# 添加 .PHONY 标记确保这些目标总是执行
.PHONY: build pkg

build: pkg

pkg:
	wasm-pack build
	sed -i 's/"name": "bilibili-music-backend"/"name": "@ocyss\/bilibili-music-backend"/g' pkg/package.json
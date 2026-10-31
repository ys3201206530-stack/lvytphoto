# media-pipeline Specification

## Purpose

摄影站以图片为核心，需要在保证清晰度的同时控制体积与加载速度。图片在浏览器端压缩成三档 WebP 与一张模糊占位图，直接上传到 Supabase Storage，再由同源图片接口带长缓存分发，避免浏览器直连海外存储。

## Requirements

### Requirement: 浏览器端压缩

系统 SHALL 在浏览器里把原图压缩为最长边 480、1280、2560 的三档 WebP（质量 0.86），并生成 20px 宽的模糊占位图；只接受 JPG、PNG、WebP，源文件上限 100MB。

#### Scenario: 上传大图

- **WHEN** 用户选择一张 20MB 的 JPG
- **THEN** 浏览器生成三档 WebP 与占位图后再上传，不把原图传给服务器

#### Scenario: 不支持的格式

- **WHEN** 用户选择 HEIC 等不在允许列表的文件
- **THEN** 立即提示格式不支持，不发起上传

### Requirement: 直传与路径约定

图片 SHALL 由浏览器直接上传到 `photos` 桶，作品记录只保存不带扩展名的路径前缀（`yyyy/mm/<uuid>`），三档文件分别为 `-sm`、`-md`、`-lg`。

#### Scenario: 上传成功后写库

- **WHEN** 三个文件上传成功且写库成功
- **THEN** 前台能通过路径前缀拼出三档图片地址

### Requirement: 同源图片代理与缓存

系统 SHALL 通过 `/api/img/[...path]` 代理读取存储中的图片，并返回 `Cache-Control: public, max-age=31536000, immutable`。

#### Scenario: 重复访问同一张图

- **WHEN** 同一张图片被第二次请求
- **THEN** 命中缓存，响应头包含 immutable，耗时明显低于首次

#### Scenario: 非法路径

- **WHEN** 请求包含 `..` 或不在允许字符集内的路径
- **THEN** 返回 404，不代理任意地址

### Requirement: 响应式展示

作品墙 SHALL 用 `srcSet` 提供三档图片并按视口选择，详情页 SHALL 使用最大档。

#### Scenario: 手机访问作品墙

- **WHEN** 手机打开作品墙
- **THEN** 浏览器选择 480 或 1280 档，而不是 2560 档

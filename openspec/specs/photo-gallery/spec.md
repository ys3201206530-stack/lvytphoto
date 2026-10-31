# photo-gallery Specification

## Purpose

让访客无需登录即可浏览摄影作品：首页精选、作品墙、按分类筛选，以及单张照片的详情页与大图查看。已发布的照片对所有人可见；草稿、已删除和不存在的照片不可访问，也不会通过前台页面泄露标题或图片。该能力同时覆盖详情页的元信息展示与灯箱缩放交互。

## Requirements

### Requirement: 公开浏览作品

系统 SHALL 允许未登录访客浏览首页、作品墙、分类筛选结果与照片详情页（`/`、`/works`、`/works?category=<slug>`、`/photo/<id>`）。

#### Scenario: 访客打开作品墙

- **WHEN** 访客访问 `/works`
- **THEN** 返回 200，展示所有已发布作品，按创建时间倒序

#### Scenario: 按分类筛选

- **WHEN** 访客访问 `/works?category=landscape`
- **THEN** 只展示该分类下已发布的作品，并高亮该分类

### Requirement: 草稿与非法照片不可访问

系统 SHALL 只公开 `is_published = true` 的作品；草稿、已删除或不存在的照片详情 SHALL 返回 404。

#### Scenario: 访客访问草稿照片

- **WHEN** 访客访问一张 `is_published = false` 的照片详情
- **THEN** 页面返回 404，且不泄露标题与图片

#### Scenario: 非法 id

- **WHEN** 访客访问 `/photo/not-a-uuid`
- **THEN** 页面返回 404

### Requirement: 照片详情展示元信息

照片详情页 SHALL 展示大图、标题、分类、拍摄日期、上传日期与描述，并提供点赞与评论区入口。

#### Scenario: 已发布照片详情

- **WHEN** 访客打开已发布照片详情
- **THEN** 返回 200，包含大图、标题与分类
- **AND** 未登录时点赞按钮跳转登录，评论框提示登录后可评论

### Requirement: 图片放大查看

详情页大图 SHALL 支持点击后全屏查看，并提供桌面滚轮缩放与移动端双指缩放。

#### Scenario: 打开灯箱

- **WHEN** 用户点击详情页大图
- **THEN** 出现全屏灯箱，背景滚动被锁定

#### Scenario: 关闭灯箱

- **WHEN** 用户按 Esc、点击空白处或点关闭按钮
- **THEN** 灯箱关闭并恢复页面滚动

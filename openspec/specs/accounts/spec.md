# accounts Specification

## Purpose

提供邮箱注册与登录、个人资料维护和身份区分。普通用户可以浏览、点赞和评论；管理员额外拥有后台权限。角色只能由数据库侧设置，前端无法通过修改请求把自己提升为管理员。

## Requirements

### Requirement: 邮箱注册

系统 SHALL 允许访客用昵称、邮箱和密码注册；注册成功后 SHALL 直接建立登录会话，不依赖邮件确认。

#### Scenario: 新邮箱注册

- **WHEN** 访客提交未注册的邮箱、昵称与两次一致的密码
- **THEN** 创建账号并跳转到 `/account`，顶栏显示昵称

#### Scenario: 邮箱已存在

- **WHEN** 访客使用已注册的邮箱注册
- **THEN** 返回明确的中文错误提示，不创建重复账号

### Requirement: 登录与退出

系统 SHALL 支持邮箱密码登录；管理员登录后进入 `/admin`，普通用户回到来源页或首页；退出后回到首页并清除会话。

#### Scenario: 管理员登录

- **WHEN** 管理员用正确密码登录
- **THEN** 跳转到 `/admin`，能看到后台导航与管理数据

#### Scenario: 未登录访问账号页

- **WHEN** 未登录用户访问 `/account`
- **THEN** 被重定向到 `/login?next=/account`

### Requirement: 个人资料

登录用户 SHALL 能修改昵称与头像，并在保存后立即在顶栏生效。

#### Scenario: 修改昵称

- **WHEN** 用户把昵称改成新的 1–20 字名称
- **THEN** 数据库中的资料被更新，页面与顶栏显示新昵称

#### Scenario: 上传头像

- **WHEN** 用户选择一张 JPG/PNG/WebP 图片
- **THEN** 浏览器裁剪为 512px 正方形 WebP 后上传，头像立即更新

### Requirement: 角色不可被前端篡改

系统 SHALL 只允许通过数据库侧操作设置 `profiles.role`，认证用户对 `role` 列没有写权限。

#### Scenario: 尝试修改角色

- **WHEN** 已登录用户直接调用接口尝试把自己的 role 改成 admin
- **THEN** 数据库拒绝写入，权限不变

# platform-security Specification

## Purpose

站点把权限边界放在数据库与服务端，而不是前端。所有公开表启用行级安全策略，匿名只能读已发布内容，写操作必须满足本人或管理员条件；服务端密钥不出现在浏览器；响应带基础安全头。

## Requirements

### Requirement: 行级安全策略

系统 SHALL 为所有公开表启用 RLS；匿名用户只能读取已发布的照片、分类、站点设置和对应评论，任何写操作 SHALL 被拒绝。

#### Scenario: 匿名写入

- **WHEN** 匿名请求向 `photos`、`categories`、`likes`、`comments` 插入数据
- **THEN** 数据库返回权限错误，不写入任何行

### Requirement: 角色与资料保护

`profiles.role` SHALL 只能由数据库侧修改；认证用户只能更新自己的昵称与头像。

#### Scenario: 越权修改角色

- **WHEN** 普通用户直接调用接口修改自己的 role
- **THEN** 请求被拒绝

### Requirement: 密钥与响应头

服务端密钥 SHALL 只存在于服务端环境变量；页面响应 SHALL 包含 `X-Content-Type-Options`、`X-Frame-Options`、`Referrer-Policy` 与 `Permissions-Policy`。

#### Scenario: 检查响应头

- **WHEN** 请求任意页面
- **THEN** 四个安全响应头均存在，且前端代码中不含服务端密钥

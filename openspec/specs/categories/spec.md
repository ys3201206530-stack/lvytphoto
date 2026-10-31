# categories Specification

## Purpose

分类用于把作品按主题组织，访客可在作品墙按分类筛选，管理员可在后台新增、改名、排序、删除分类，并为每个分类设置一张招牌图。分类的英文标识创建后不可修改，避免已经分享出去的筛选链接失效。

## Requirements

### Requirement: 按分类筛选作品

系统 SHALL 在作品墙提供分类筛选，访问 `/works?category=<slug>` 时只展示该分类下的已发布作品。

#### Scenario: 筛选已存在的分类

- **WHEN** 访客访问 `/works?category=landscape`
- **THEN** 页面返回 200，只列出属于 landscape 的已发布作品，并高亮该分类

#### Scenario: 空分类

- **WHEN** 访客筛选的分类下没有已发布作品
- **THEN** 显示空状态提示，页面不报错

### Requirement: 分类展示与招牌图

系统 SHALL 在首页展示全部分类；分类有招牌图时展示该图，没有时回退为渐变占位。

#### Scenario: 已设置招牌图

- **WHEN** 访客打开首页的分类区域
- **THEN** 该分类卡片展示招牌图，文字直接压在图上并有渐变保证可读

### Requirement: 分类管理

管理员 SHALL 能新增、改名、调整排序和删除分类；删除分类时其作品 SHALL 保留并变为未分类。

#### Scenario: 删除有作品的分类

- **WHEN** 管理员删除一个下挂 N 张作品的分类
- **THEN** 分类被删除，N 张作品仍然存在，分类字段变为空

#### Scenario: 英文标识不可改

- **WHEN** 管理员编辑分类
- **THEN** 只能修改名称与排序，英文标识保持只读

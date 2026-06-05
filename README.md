# README

## 1.项目背景

本课题来源于日常生活中用户对手机、电脑等数码产品信息查询和配置对比的实际需求随着数码产品更新速度不断加快，市场上的手机、电脑品牌和型号越来越多，不同产品在价格、处理器、内存、存储容量、屏幕尺寸、电池容量、摄像头、显卡等配置方面存在较大差异

 用户在购买数码产品前，通常需要通过多个平台查询产品信息，并对不同产品的参数进行人工比较这种方式不仅效率较低，而且容易出现信息分散、数据不统一、对比不直观等问题因此，有必要设计一个数码产品信息管理与配置对比系统，对手机、电脑等产品的基本信息和详细配置进行集中管理 

本系统以数码产品信息管理为基础，以产品配置查询和对比为特色，通过数据库存储用户、管理员、产品分类、品牌、产品、配置参数、产品图片、收藏和评论等信息，实现数码产品数据的统一管理、快速查询和直观对比



## 2.需求分析

### 2.1  信息需求

通过对数码产品信息管理与配置对比系统的分析，可以确定系统需要保存以下几类信息：

1. 用户基本信息：包括用户编号、用户名、密码、手机号、邮箱、性别、用户状态、注册时间
2. 管理员信息：包括管理员编号、管理员账号、管理员密码、邮箱、权限角色、账号状态
3. 产品分类信息：包括分类编号、分类名称、父级分类编号、分类描述、排序号、分类图标、分类状态
4. 品牌信息：包括品牌编号、品牌名称、品牌Logo、所属国家、官方网站、品牌介绍、品牌状态
5. 产品基本信息：包括产品编号、产品名称、所属分类、所属品牌、产品价格、产品主图、产品简介、浏览量、发布时间、产品状态
8. 产品图片信息：包括图片编号、产品编号、图片地址、图片名称、图片类型、图片描述、是否主图、上传时间、图片状态
10. 评论信息：包括评论编号、评论内容、评论时间、点赞数、回复数、评论状态

根据系统信息需求分析，各类数据之间存在如下关系：

1. 一个管理员可以管理多个产品分类，一个产品分类由多个管理员进行管理
2. 一个管理员可以添加或维护多个品牌信息，一个品牌信息由多个管理员进行管理
3. 一个管理员可以添加或维护多个产品，一个产品信息由多个管理员进行录入或修改
4. 一个产品分类下可以包含多个产品，但一个产品只能属于一个分类
5. 一个品牌可以拥有多个产品，但一个产品只能属于一个品牌
6. 一个产品可以拥有多张图片，一张图片只能属于一个产品
7. 一个用户可以收藏多个产品，一个产品也可以被多个用户收藏
8. 一个用户可以对多个产品发表评论，一个产品可以被多个用户评论
9. 一个管理员可以管理多条评论信息，一条评论由多个管理员管理
10. 一个产品拥有多个评论，一个评论对应一个产品

### 2.2 处理需求

本系统主要面向普通用户和管理员两类角色，不同角色具有不同的操作需求

普通用户的主要处理需求如下：

（1）用户可以进行注册和登录，登录后可以使用收藏、评论等功能

（2）用户可以浏览手机、电脑等数码产品信息，查看产品名称、品牌、价格、图片和简介等内容

（3）用户可以根据产品名称、分类、品牌、价格等条件查询产品信息

（4）用户可以查看产品详情，包括产品基本信息、产品图片、手机配置或电脑配置等内容

（5）用户可以选择两个或多个产品进行配置对比，系统以表格形式展示产品之间的价格、处理器、内存、存储、屏幕、电池、摄像头或显卡等差异

（6）用户可以收藏感兴趣的产品，也可以查看或取消自己的收藏记录

（7）用户可以对产品进行评分和评论，发表自己对产品的看法

管理员的主要处理需求如下：

（1）管理员可以登录后台管理系统

（2）管理员可以对用户信息进行查看、修改、禁用或删除

（3）管理员可以对产品分类信息进行添加、修改、删除和查询

（4）管理员可以对品牌信息进行添加、修改、删除和查询

（5）管理员可以对产品基础信息进行添加、修改、删除和查询

（6）管理员可以维护手机配置和电脑配置信息，保证产品配置数据准确

（7）管理员可以管理产品图片，包括上传、修改、删除和设置主图

（8）管理员可以查看和管理用户评论，对不合适的评论进行隐藏或删除

### 2.3 安全性和完整性要求

为了保证系统数据的安全性和完整性，需要满足以下要求：

（1）安全性要求：普通用户和管理员需要通过账号和密码登录系统，不同角色拥有不同的操作权限

（2）用户权限要求：普通用户只能查看产品信息、收藏产品、评论产品和管理自己的个人信息，不能修改系统中的产品、品牌和分类数据

（3）管理员权限要求：管理员可以对用户、产品、分类、品牌、配置、图片和评论等信息进行管理

（4）数据完整性要求：产品信息必须关联正确的产品分类和品牌，手机配置或电脑配置必须关联对应的产品

（5）主键唯一性要求（实体完整性）：每张表中的主键必须唯一

（6）外键约束要求（参照完整性）：收藏表和评论表中的用户编号必须来自用户表，产品编号必须来自产品表；产品表中的分类编号和品牌编号必须分别来自分类表和品牌表

（7）数据合理性要求：产品价格不能小于0，评分应在规定范围（1-5）内，用户状态、产品状态、评论状态等字段应使用统一的状态值

（8）数据一致性要求：当产品、用户或评论信息发生修改时，相关数据应保持一致，避免出现无效数据或错误关联



## 3.概念结构设计

首先是对应实体存在的关系

1. 一个管理员可以管理多个产品分类，一个产品分类由多个管理员进行管理
2. 一个管理员可以添加或维护多个品牌信息，一个品牌信息由多个管理员进行管理
3. 一个管理员可以添加或维护多个产品，一个产品信息由多个管理员进行录入或修改
4. 一个产品分类下可以包含多个产品，但一个产品只能属于一个分类
5. 一个品牌可以拥有多个产品，但一个产品只能属于一个品牌
6. 一个产品可以拥有多张图片，一张图片只能属于一个产品
7. 一个用户可以收藏多个产品，一个产品也可以被多个用户收藏
8. 一个用户可以对多个产品发表评论，一个产品可以被多个用户评论
9. 一个管理员可以管理多条评论信息，一条评论由多个管理员管理
10. 一个产品拥有多个评论，一个评论对应一个产品



由以上关系，可以得出如下E-R图

![image-20260601195956512](README.assets/image-20260601195956512.png)

## 4.逻辑结构设计

### 4.1 关系模式设计

管理员（<u>管理员编号</u>，管理员账号，管理员密码，邮箱，权限角色，账号状态）

产品分类（<u>分类编号</u>，分类名称，<span style="text-decoration: underline wavy;">父级分类编号</span>，分类描述，排序号，分类图标，分类状态）

品牌（<u>品牌编号</u>，品牌名称，品牌Logo，所属国家，官方网站，品牌介绍，品牌状态）

产品（<u>产品编号</u>，产品名称，<span style="text-decoration: underline wavy;">分类编号</span>，<span style="text-decoration: underline wavy;">品牌编号</span>，产品价格，产品主图，产品简介，浏览量，发布时间，产品状态）

产品图片（<u>图片编号</u>，<span style="text-decoration: underline wavy;">产品编号</span>，图片地址，图片名称，图片类型，图片描述，是否主图，上传时间，图片状态）

用户（<u>用户编号</u>，用户名，密码，手机号，邮箱，性别，用户状态，注册时间）

评论（<u>评论编号</u>，<span style="text-decoration: underline wavy;">用户编号</span>，<span style="text-decoration: underline wavy;">产品编号</span>，评论内容，评论时间，点赞数，回复数，评论状态）

管理员分类管理（<u><span style="text-decoration: underline wavy;">管理员编号</span>，<span style="text-decoration: underline wavy;">分类编号</span></u>）

管理员品牌管理（<u><span style="text-decoration: underline wavy;">管理员编号</span>，<span style="text-decoration: underline wavy;">品牌编号</span></u>）
管理员产品管理（<u><span style="text-decoration: underline wavy;">管理员编号</span>，<span style="text-decoration: underline wavy;">产品编号</span></u>）

收藏（<u>收藏编号</u>，<span style="text-decoration: underline wavy;">用户编号</span>，<span style="text-decoration: underline wavy;">产品编号</span>，收藏时间，收藏状态）

管理员评论管理（<u><span style="text-decoration: underline wavy;">管理员编号</span>，<span style="text-decoration: underline wavy;">评论编号</span></u>）

==注：横线代表主键，波浪线代表外键==

### 4.2 关系模式优化

由上面关系模式设计可知：

1. 管理员关系中所有非主属性都完全依赖于管理员编号，属于 BCNF
2. 产品分类关系中分类名称、父级分类编号、分类描述、排序号、分类图标、分类状态都依赖于分类编号，属于 BCNF
3. 品牌关系中所有非主属性都完全依赖于品牌编号，属于 BCNF
4. 产品关系中产品名称、分类编号、品牌编号、产品价格、产品简介、浏览量、发布时间、产品状态都依赖于产品编号，属于 BCNF
5. 产品图片关系中所有非主属性都完全依赖于图片编号，且产品编号作为外键用于表示产品与图片之间的 1:n 关系，属于 BCNF
6. 用户关系中所有非主属性都完全依赖于用户编号，属于 BCNF
7. 评论关系中评论内容、评论时间、点赞数、回复数、评论状态都依赖于评论编号，用户编号和产品编号作为外键分别表示用户发表评论、产品拥有评论的关系，属于 BCNF
8. 管理员分类管理由管理员编号和分类编号两个外键共同组成联合主键，表中不存在非主属性，属于 BCNF
9. 管理员品牌管理由管理员编号和品牌编号两个外键共同组成联合主键，表中不存在非主属性，属于 BCNF
10. 管理员产品管理由管理员编号和产品编号两个外键共同组成联合主键，表中不存在非主属性，属于 BCNF
11. 管理员评论管理由管理员编号和评论编号两个外键共同组成联合主键，表中不存在非主属性，属于 BCNF
12. 收藏关系中收藏时间、收藏状态依赖于用户编号和产品编号组成的联合主键，用户编号和产品编号同时作为外键，属于 BCNF

由此可见，所有关系模式均已到达BCNF

但是产品主图可以由产品图片表中是否主图推出，属于冗余设计，故可以把产品表中的产品主图去掉，利用是否主图来进行判断即可

优化以后的：

管理员（<u>管理员编号</u>，管理员账号，管理员密码，邮箱，权限角色，账号状态）

产品分类（<u>分类编号</u>，分类名称，<span style="text-decoration: underline wavy;">父级分类编号</span>，分类描述，排序号，分类图标，分类状态）

品牌（<u>品牌编号</u>，品牌名称，品牌Logo，所属国家，官方网站，品牌介绍，品牌状态）

产品（<u>产品编号</u>，产品名称，<span style="text-decoration: underline wavy;">分类编号</span>，<span style="text-decoration: underline wavy;">品牌编号</span>，产品价格，产品简介，浏览量，发布时间，产品状态）

产品图片（<u>图片编号</u>，<span style="text-decoration: underline wavy;">产品编号</span>，图片地址，图片名称，图片类型，图片描述，是否主图，上传时间，图片状态）

用户（<u>用户编号</u>，用户名，密码，手机号，邮箱，性别，用户状态，注册时间）

评论（<u>评论编号</u>，<span style="text-decoration: underline wavy;">用户编号</span>，<span style="text-decoration: underline wavy;">产品编号</span>，评论内容，评论时间，点赞数，回复数，评论状态）

管理员分类管理（<u><span style="text-decoration: underline wavy;">管理员编号</span>，<span style="text-decoration: underline wavy;">分类编号</span></u>）

管理员品牌管理（<u><span style="text-decoration: underline wavy;">管理员编号</span>，<span style="text-decoration: underline wavy;">品牌编号</span></u>）
管理员产品管理（<u><span style="text-decoration: underline wavy;">管理员编号</span>，<span style="text-decoration: underline wavy;">产品编号</span></u>）

收藏（收藏编号，<u><span style="text-decoration: underline wavy;">用户编号</span>，<span style="text-decoration: underline wavy;">产品编号</span></u>，收藏时间，收藏状态）

管理员评论管理（<u><span style="text-decoration: underline wavy;">管理员编号</span>，<span style="text-decoration: underline wavy;">评论编号</span></u>）

## 5.物理结构设计

### 5.1 确定存储引擎

由于信息化数据管理平台涉及的应用需要多次进行增删改查操作,因此,该平台数据库采用MySQL的Innodb存储引擎。

### 5.2 数据表设计

在实际应用过程中，为了便于数据库实现和系统开发，本系统在数据表设计时根据关系模式设置主键和外键，以保证数据的完整性和一致性。

管理员模块中设置管理员信息表，用于保存后台管理员的账号及权限信息。该表以 admin_id 作为主键，用于唯一标识每一位管理员。管理员账号 admin_account 设置为唯一约束，保证不同管理员账号不重复。管理员密码 admin_password 用于保存登录密码，email 用于保存管理员邮箱，role 用于区分管理员权限角色，status 用于表示账号状态。通过该表可以实现管理员登录、权限区分以及账号状态管理。具体关系表如表所示

admin

| 字段名         | 数据类型 | 默认值 | 数据长度 | 是否主键 | 是否为空 | 是否外键 | 自定义约束 | 说明                       |
| -------------- | -------- | ------ | -------- | -------- | -------- | -------- | ---------- | -------------------------- |
| admin_id       | int      |        | 10       | 是       | 否       | 否       |            | 管理员编号                 |
| admin_account  | varchar  |        | 30       | 否       | 否       | 否       | 唯一       | 管理员账号                 |
| admin_password | varchar  |        | 50       | 否       | 否       | 否       |            | 管理员密码                 |
| email          | varchar  |        | 45       | 否       | 是       | 否       |            | 管理员邮箱                 |
| role           | varchar  |        | 5        | 否       | 否       | 否       |            | 管理员权限                 |
| status         | int      | 1      | 1        | 否       | 否       | 否       |            | 账号状态，0为禁用，1为启用 |

产品分类表用于存储产品分类信息，其中 category_id 为主键，parent_id 为外键，用于表示父级分类编号，status 字段表示分类状态。

categories

| 字段名        | 数据类型 | 默认值 | 数据长度 | 是否主键 | 是否为空 | 是否外键 | 自定义约束       | 说明                   |
| ------------- | -------- | ------ | -------- | -------- | -------- | -------- | ---------------- | ---------------------- |
| category_id   | int      |        | 10       | 是       | 否       | 否       | 自增             | 分类编号               |
| category_name | varchar  |        | 50       | 否       | 否       | 否       |                  | 分类名称               |
| parent_id     | int      |        | 10       | 否       | 是       | 是       | 关联 category_id | 父级分类编号           |
| description   | text     |        | 255      | 否       | 是       | 否       |                  | 分类描述               |
| sort_order    | int      | 0      | 10       | 否       | 是       | 否       |                  | 排序号                 |
| icon          | varchar  |        | 255      | 否       | 是       | 否       |                  | 分类图标               |
| status        | int      | 1      | 1        | 否       | 否       | 否       |                  | 分类状态，1启用，0禁用 |

品牌信息表用于存储产品品牌信息，其中 brand_id 为主键，brand_name 字段设置唯一约束，用于保证品牌名称不重复，status 字段表示品牌状态。

brands

| 字段名      | 数据类型 | 默认值 | 数据长度 | 是否主键 | 是否为空 | 是否外键 | 自定义约束 | 说明                   |
| ----------- | -------- | ------ | -------- | -------- | -------- | -------- | ---------- | ---------------------- |
| brand_id    | int      |        | 10       | 是       | 否       | 否       | 自增       | 品牌编号               |
| brand_name  | varchar  |        | 50       | 否       | 否       | 否       | 唯一       | 品牌名称               |
| logo        | varchar  |        | 255      | 否       | 是       | 否       |            | 品牌Logo               |
| country     | varchar  |        | 50       | 否       | 是       | 否       |            | 所属国家               |
| website     | varchar  |        | 255      | 否       | 是       | 否       |            | 官方网站               |
| description | varchar  |        | 500      | 否       | 是       | 否       |            | 品牌介绍               |
| status      | int      | 1      | 1        | 否       | 否       | 否       |            | 品牌状态，1启用，0禁用 |

产品信息表用于存储产品基本信息，其中 product_id 为主键，category_id 和 brand_id 为外键，分别表示产品所属分类和所属品牌，price 字段表示产品价格，status 字段表示产品状态。

products

| 字段名       | 数据类型 | 默认值 | 数据长度 | 是否主键 | 是否为空 | 是否外键 | 自定义约束 | 说明                                     |
| ------------ | -------- | ------ | -------- | -------- | -------- | -------- | ---------- | ---------------------------------------- |
| product_id   | int      |        | 10       | 是       | 否       | 否       | 自增       | 产品编号                                 |
| product_name | varchar  |        | 100      | 否       | 否       | 否       |            | 产品名称                                 |
| category_id  | int      |        | 10       | 否       | 否       | 是       |            | 分类编号，关联categories中的 category_id |
| brand_id     | int      |        | 10       | 否       | 否       | 是       |            | 品牌编号，关联brands中的brand_id         |
| price        | double   | 0.00   | 8        | 否       | 否       | 否       | price >= 0 | 产品价格                                 |
| description  | varchar  |        | 500      | 否       | 是       | 否       |            | 产品简介                                 |
| view_count   | int      | 0      | 10       | 否       | 否       | 否       |            | 浏览量                                   |
| release_time | datetime |        |          | 否       | 是       | 否       |            | 发布时间                                 |
| status       | int      | 1      | 1        | 否       | 否       | 否       |            | 产品状态                                 |

产品图片表用于存储产品图片信息，其中 image_id 为主键，product_id 为外键，用于表示图片所属产品，is_main 字段表示是否为主图，status 字段表示图片状态。

product_images

| 字段名      | 数据类型 | 默认值 | 数据长度 | 是否主键 | 是否为空 | 是否外键 | 自定义约束 | 说明                                  |
| ----------- | -------- | ------ | -------- | -------- | -------- | -------- | ---------- | ------------------------------------- |
| image_id    | int      |        | 10       | 是       | 否       | 否       | 自增       | 图片编号                              |
| product_id  | int      |        | 10       | 否       | 否       | 是       |            | 产品编号，关联 products中的product_id |
| image_url   | varchar  |        | 255      | 否       | 否       | 否       |            | 图片地址                              |
| image_name  | varchar  |        | 100      | 否       | 是       | 否       |            | 图片名称                              |
| image_type  | varchar  |        | 20       | 否       | 是       | 否       |            | 图片类型                              |
| description | varchar  |        | 255      | 否       | 是       | 否       |            | 图片描述                              |
| is_main     | int      | 0      | 1        | 否       | 否       | 否       |            | 是否主图，0否，1是                    |
| upload_time | datetime |        |          | 否       | 否       | 否       |            | 上传时间                              |
| status      | int      | 1      | 1        | 否       | 否       | 否       |            | 图片状态                              |

用户信息表用于存储普通用户的基本信息，其中 user_id 为主键，username 字段设置唯一约束，用于保证用户名不重复，status 字段表示用户状态。

users

| 字段名        | 数据类型 | 默认值 | 数据长度 | 是否主键 | 是否为空 | 是否外键 | 自定义约束 | 说明     |
| ------------- | -------- | ------ | -------- | -------- | -------- | -------- | ---------- | -------- |
| user_id       | int      |        | 10       | 是       | 否       | 否       | 自增       | 用户编号 |
| username      | varchar  |        | 50       | 否       | 否       | 否       | 唯一       | 用户名   |
| password      | varchar  |        | 50       | 否       | 否       | 否       |            | 密码     |
| phone         | varchar  |        | 11       | 否       | 否       | 否       |            | 手机号   |
| email         | varchar  |        | 45       | 否       | 是       | 否       |            | 邮箱     |
| gender        | varchar  |        | 5        | 否       | 是       | 否       |            | 性别     |
| status        | int      | 1      | 1        | 否       | 否       | 否       |            | 用户状态 |
| register_time | datetime |        |          | 否       | 否       | 否       |            | 注册时间 |

评论信息表用于存储用户对产品的评论信息，其中 comment_id 为主键，user_id 和 product_id 为外键，分别表示发表评论的用户和被评论的产品，status 字段表示评论状态。

comments

| 字段名       | 数据类型 | 默认值 | 数据长度 | 是否主键 | 是否为空 | 是否外键 | 自定义约束 | 说明                                  |
| ------------ | -------- | ------ | -------- | -------- | -------- | -------- | ---------- | ------------------------------------- |
| comment_id   | int      |        | 10       | 是       | 否       | 否       | 自增       | 评论编号                              |
| user_id      | int      |        | 10       | 否       | 否       | 是       |            | 用户编号,关联 users中的user_id        |
| product_id   | int      |        | 10       | 否       | 否       | 是       |            | 产品编号，关联 products中的product_id |
|              |          |        | 500      | 否       | 否       | 否       |            | 评论内容                              |
| comment_time | datetime |        |          | 否       | 否       | 否       |            | 评论时间                              |
| like_count   | int      | 0      | 10       | 否       | 否       | 否       |            | 点赞数                                |
| reply_count  | int      | 0      | 10       | 否       | 否       | 否       |            | 回复数                                |
| status       | int      | 1      | 1        | 否       | 否       | 否       |            | 评论状态                              |

管理员分类管理表用于存储管理员与产品分类之间的管理关系，其中 admin_id 和 category_id 共同作为联合主键，同时也是外键。

admin_category

| 字段名      | 数据类型 | 默认值 | 数据长度 | 是否主键 | 是否为空 | 是否外键 | 自定义约束 | 说明                                              |
| ----------- | -------- | ------ | -------- | -------- | -------- | -------- | ---------- | ------------------------------------------------- |
| admin_id    | int      |        | 10       | 是       | 否       | 是       |            | 管理员编号，联合主键，关联 admins中的admin_id     |
| category_id | int      |        | 10       | 是       | 否       | 是       |            | 分类编号，联合主键，关联categories中的category_id |

管理员品牌管理表用于存储管理员与品牌之间的管理关系，其中 admin_id 和 brand_id 共同作为联合主键，同时也是外键。

 admin_brand

| 字段名   | 数据类型 | 默认值 | 数据长度 | 是否主键 | 是否为空 | 是否外键 | 自定义约束 | 说明                                          |
| -------- | -------- | ------ | -------- | -------- | -------- | -------- | ---------- | --------------------------------------------- |
| admin_id | int      |        | 10       | 是       | 否       | 是       |            | 管理员编号，联合主键，关联 admins中的admin_id |
| brand_id | int      |        | 10       | 是       | 否       | 是       |            | 品牌编号，联合主键，关联brands中的brand_id    |

管理员产品管理表用于存储管理员与产品之间的管理关系，其中 admin_id 和 product_id 共同作为联合主键，同时也是外键。

admin_product

| 字段名     | 数据类型 | 默认值 | 数据长度 | 是否主键 | 是否为空 | 是否外键 | 自定义约束 | 说明                              |
| ---------- | -------- | ------ | -------- | -------- | -------- | -------- | ---------- | --------------------------------- |
| admin_id   | int      |        | 10       | 是       | 否       | 是       |            | 管理员编号，联合主键，关联 admins |
| product_id | int      |        | 10       | 是       | 否       | 是       |            | 产品编号，联合主键，关联 products |

收藏表用于存储用户收藏产品的信息，其中 user_id 和 product_id 共同作为联合主键，同时也是外键，favorite_id 字段用于表示收藏编号，status 字段表示收藏状态。

favorites

| 字段名        | 数据类型 | 默认值 | 数据长度 | 是否主键 | 是否为空 | 是否外键 | 自定义约束 | 说明                              |
| ------------- | -------- | ------ | -------- | -------- | -------- | -------- | ---------- | --------------------------------- |
| favorite_id   | int      |        | 10       | 否       | 否       | 否       | 唯一       | 收藏编号                          |
| user_id       | int      |        | 10       | 是       | 否       | 是       |            | 用户编号，联合主键，关联 users    |
| product_id    | int      |        | 10       | 是       | 否       | 是       |            | 产品编号，联合主键，关联 products |
| favorite_time | datetime |        |          | 否       | 否       | 否       |            | 收藏时间                          |
| status        | int      | 1      | 1        | 否       | 否       | 否       |            | 收藏状态                          |

管理员评论管理表用于存储管理员与评论之间的管理关系，其中 admin_id 和 comment_id 共同作为联合主键，同时也是外键。

admin_comment

| 字段名     | 数据类型 | 默认值 | 数据长度 | 是否主键 | 是否为空 | 是否外键 | 自定义约束              | 说明       |
| ---------- | -------- | ------ | -------- | -------- | -------- | -------- | ----------------------- | ---------- |
| admin_id   | int      |        | 10       | 是       | 否       | 是       | 联合主键，关联 admins   | 管理员编号 |
| comment_id | int      |        | 10       | 是       | 否       | 是       | 联合主键，关联 comments | 评论编号   |

### 5.3 索引设计

为提高查询效率，系统对各表主键字段自动建立主键索引；对用户表 username、管理员表 admin_account、品牌表 brand_name 等唯一字段建立唯一索引，用于保证数据唯一性；对产品表 category_id、brand_id，评论表 user_id、product_id，产品图片表 product_id，收藏表 user_id、product_id 等外键字段建立普通索引，以提高表连接和条件查询效率。

 

## 6.数据库实施

### 6.1 建数据库

```sql
create database device_choose;
use device_choose
```

![image-20260603171228183](README.assets/image-20260603171228183.png)

### 6.2 建表

1. admin表创建

```sql
create table admin (
    admin_id int not null comment '管理员编号',
    admin_account varchar(30) not null comment '管理员账号',
    admin_password varchar(50) not null comment '管理员密码',
    email varchar(45) comment '管理员邮箱',
    role varchar(5) not null comment '管理员权限',
    status int not null default 1 comment '账号状态，0为禁用，1为启用',
    primary key (admin_id),
    unique index uk_admin_account (admin_account)
) engine=innodb;
```

![image-20260603200811257](README.assets/image-20260603200811257.png)

2. categories

```sql
create table categories (
    category_id int not null auto_increment comment '分类编号',
    category_name varchar(50) not null comment '分类名称',
    parent_id int comment '父级分类编号',
    description varchar(255) comment '分类描述',
    sort_order int default 0 comment '排序号',
    icon varchar(255) comment '分类图标',
    status int not null default 1 comment '分类状态，1启用，0禁用',
    primary key (category_id),
    index idx_categories_parent_id (parent_id),
    foreign key (parent_id) references categories(category_id)
) engine=innodb;
```

![image-20260603200825103](README.assets/image-20260603200825103.png)

3. brands表创建

```sql
create table brands (
    brand_id int not null auto_increment comment '品牌编号',
    brand_name varchar(50) not null comment '品牌名称',
    logo varchar(255) comment '品牌logo',
    country varchar(50) comment '所属国家',
    website varchar(255) comment '官方网站',
    description text comment '品牌介绍',
    status int not null default 1 comment '品牌状态，1启用，0禁用',
    primary key (brand_id),
    unique index uk_brand_name (brand_name)
) engine=innodb;
```

![image-20260603200838263](README.assets/image-20260603200838263.png)

4. products表创建

```sql
create table products (
    product_id int not null auto_increment comment '产品编号',
    product_name varchar(100) not null comment '产品名称',
    category_id int not null comment '分类编号',
    brand_id int not null comment '品牌编号',
    price double not null default 0.00 comment '产品价格',
    description text comment '产品简介',
    view_count int not null default 0 comment '浏览量',
    release_time datetime comment '发布时间',
    status int not null default 1 comment '产品状态',
    primary key (product_id),
    index idx_products_category_id (category_id),
    index idx_products_brand_id (brand_id),
    check (price >= 0),
    foreign key (category_id) references categories(category_id),
    foreign key (brand_id) references brands(brand_id),
    on delete cascade
) engine=innodb;
```

![image-20260603200719874](README.assets/image-20260603200719874.png)

5. product_images表创建

```sql
create table product_images (
    image_id int not null auto_increment comment '图片编号',
    product_id int not null comment '产品编号',
    image_url varchar(255) not null comment '图片地址',
    image_name varchar(100) comment '图片名称',
    image_type varchar(20) comment '图片类型',
    description text comment '图片描述',
    is_main int not null default 0 comment '是否主图，0否，1是',
    upload_time datetime not null comment '上传时间',
    status int not null default 1 comment '图片状态',
    primary key (image_id),
    index idx_product_images_product_id (product_id),
    foreign key (product_id) references products(product_id)
) engine=innodb;
```

![image-20260603200734226](README.assets/image-20260603200734226.png)

6. users表创建

```sql
create table users (
    user_id int not null auto_increment comment '用户编号',
    username varchar(50) not null comment '用户名',
    password varchar(50) not null comment '密码',
    phone varchar(11) not null comment '手机号',
    email varchar(45) comment '邮箱',
    gender varchar(2) comment '性别',
    status int not null default 1 comment '用户状态',
    register_time datetime not null comment '注册时间',
    primary key (user_id),
    unique index uk_username (username)
) engine=innodb;
```

![image-20260603200755413](README.assets/image-20260603200755413.png)

7. comments表创建

```sql
create table comments (
    comment_id int not null auto_increment comment '评论编号',
    user_id int not null comment '用户编号',
    product_id int not null comment '产品编号',
    content varchar(500) not null comment '评论内容',
    comment_time datetime not null comment '评论时间',
    like_count int not null default 0 comment '点赞数',
    reply_count int not null default 0 comment '回复数',
    status int not null default 1 comment '评论状态',
    primary key (comment_id),
    index idx_comments_user_id (user_id),
    index idx_comments_product_id (product_id),
    foreign key (user_id) references users(user_id),
    foreign key (product_id) references products(product_id)
) engine=innodb;
```

![image-20260603200348140](README.assets/image-20260603200348140.png)

8. admin_category表创建

```sql
create table admin_category (
    admin_id int not null comment '管理员编号',
    category_id int not null comment '分类编号',
    primary key (admin_id, category_id),
    index idx_admin_category_category_id (category_id),
    foreign key (admin_id) references admin(admin_id),
    foreign key (category_id) references categories(category_id)
) engine=innodb;
```

![image-20260603200416462](README.assets/image-20260603200416462.png)

9. admin_brand表创建

```sql
create table admin_brand (
    admin_id int not null comment '管理员编号',
    brand_id int not null comment '品牌编号',
    primary key (admin_id, brand_id),
    index idx_admin_brand_brand_id (brand_id),
    foreign key (admin_id) references admin(admin_id),
    foreign key (brand_id) references brands(brand_id)
) engine=innodb;
```

![image-20260603200440976](README.assets/image-20260603200440976.png)

10. admin_product表创建

```sql
create table admin_product (
    admin_id int not null comment '管理员编号',
    product_id int not null comment '产品编号',
    primary key (admin_id, product_id),
    index idx_admin_product_product_id (product_id),
    foreign key (admin_id) references admin(admin_id),
    foreign key (product_id) references products(product_id)
) engine=innodb;
```

![image-20260603200542135](README.assets/image-20260603200542135.png)

11. favorites表创建

```sql
create table favorites (
    favorite_id int not null comment '收藏编号',
    user_id int not null comment '用户编号',
    product_id int not null comment '产品编号',
    favorite_time datetime not null comment '收藏时间',
    status int not null default 1 comment '收藏状态',
    primary key (user_id, product_id),
    unique index uk_favorite_id (favorite_id),
    index idx_favorites_product_id (product_id),
    foreign key (user_id) references users(user_id),
    foreign key (product_id) references products(product_id)
) engine=innodb;
```

![image-20260603200624206](README.assets/image-20260603200624206.png)

12. admin_comment

```sql
create table admin_comment (
    admin_id int not null comment '管理员编号',
    comment_id int not null comment '评论编号',
    primary key (admin_id, comment_id),
    index idx_admin_comment_comment_id (comment_id),
    foreign key (admin_id) references admin(admin_id),
    foreign key (comment_id) references comments(comment_id)
) engine=innodb;
```

!![image-20260603200657745](README.assets/image-20260603200657745.png)

### 6.3 创建用户

#### 6.3.1 添加用户

```sql
insert into users
values(114510,'gin','123456','15860827759','cole36620@gmail.com','男',1,now()),
(114511,'lisa','pass789','13912345678','lisa_wang@qq.com','女',1,now()),
(114512,'tom_chen','tom2024','15012345678','tomchen@163.com','男',1,now()),
(114513,'emma_li','emma@123','18612345678','emma.li@gmail.com','女',1,now()),
(114514,'jack_ma','jack666','13712345678','jackma@outlook.com','男',1,now()),
(114515,'sophia','soph@2024','15912345678','sophia.z@gmail.com','女',1,now()),
(114516,'alex_wu','alex1234','13812345678','alexwu@qq.com','男',1,now()),
(114517,'mia_zhang','mia@pass','18712345678','miazhang@126.com','女',1,now()),
(114518,'leo_huang','leo2024','13612345678','leo.huang@gmail.com','男',1,now()),
(114519,'olivia','olivia@1','15212345678','olivia.liu@163.com','女',1,now()),
(114520,'ryan_zhou','ryan6666','18512345678','ryan.zhou@qq.com','男',1,now()),
(114521,'luna_he','luna123','15512345678','lunahe@gmail.com','女',0,now()),
(114522,'ethan_sun','ethan@88','13312345678','ethansun@outlook.com','男',1,now()),
(114523,'ava_yang','ava2024!','18912345678','ava.yang@126.com','女',1,now()),
(114524,'noah_lin','noahpass','15112345678','noahlin@gmail.com','男',1,now()),
(114525,'ella_deng','ella@555','18212345678','elladeng@163.com','女',1,now()),
(114526,'liam_guo','liam1234','15712345678','liam.guo@qq.com','男',0,now()),
(114527,'zoe_pan','zoe_pass','13512345678','zoepan@gmail.com','女',1,now()),
(114528,'mason_shi','mason666','18812345678','masonshi@outlook.com','男',1,now()),
(114529,'ivy_jiang','ivy@2024','15312345678','ivy.jiang@163.com','女',1,now());
```

![image-20260604192229322](README.assets/image-20260604192229322.png)

#### 6.3.2 添加管理员账号

```sql
insert into admin
values(1,'admin1','123456','3277314262@qq.com','超级管理员',1),
(2,'admin2','123456','1145144@163.com','普通管理员',1),
(3,'admin3','123456','zhangwei@qq.com','普通管理员',1),
(4,'admin4','123456','liqiang@163.com','普通管理员',1),
(5,'admin5','123456','wangfang@126.com','普通管理员',1),
(6,'admin6','123456','chenjie@qq.com','普通管理员',1),
(7,'admin7','123456','yangliu@163.com','普通管理员',1),
(8,'admin8','123456','huangfei@outlook.com','普通管理员',1),
(9,'admin9','123456','zhaomin@gmail.com','普通管理员',1),
(10,'admin10','123456','wuxin@126.com','普通管理员',1),
(11,'admin11','123456','sunlei@qq.com','普通管理员',1),
(12,'admin12','123456','maxia@163.com','普通管理员',1),
(13,'admin13','123456','guojing@outlook.com','普通管理员',1),
(14,'admin14','123456','linfang@gmail.com','普通管理员',1),
(15,'admin15','123456','heyun@126.com','普通管理员',1),
(16,'admin16','123456','liuqiang@qq.com','普通管理员',1),
(17,'admin17','123456','zhoujie@163.com','普通管理员',1),
(18,'admin18','123456','xuting@outlook.com','普通管理员',1),
(19,'admin19','123456','zhenghao@gmail.com','普通管理员',1),
(20,'admin20','123456','tanwei@126.com','普通管理员',1);
```

![image-20260604192515733](README.assets/image-20260604192515733.png)

### 6.4 创建索引

```sql
show index from admin;
show index from admin_brand;
show index from admin_category;
show index from admin_comment;
show index from admin_product;
show index from brands;
show index from categories;
show index from comments;
show index from favorites;
show index from product_images;
show index from products;
show index from users;
```

![image-20260604191354114](README.assets/image-20260604191354114.png)![image-20260604191416040](README.assets/image-20260604191416040.png)

![image-20260604191425153](README.assets/image-20260604191425153.png)

![image-20260604191442817](README.assets/image-20260604191442817.png)

![image-20260604191459637](README.assets/image-20260604191459637.png)

![image-20260604191512548](README.assets/image-20260604191512548.png)

![image-20260604191526126](README.assets/image-20260604191526126.png)

![image-20260604191535573](README.assets/image-20260604191535573.png)

![image-20260604191547806](README.assets/image-20260604191547806.png)

![image-20260604191559566](README.assets/image-20260604191559566.png)

![image-20260604191609040](README.assets/image-20260604191609040.png)

![image-20260604191617144](README.assets/image-20260604191617144.png)

### 6.5 数据装载

#### 6.5.1 加入种类

```sql
insert into categories (category_name,parent_id,description,sort_order,status)
values('手机',null,'手机类数码产品',1,1),('电脑',null,'电脑类数码产品',2,1);
```

![image-20260603201722364](README.assets/image-20260603201722364.png)



#### 6.5.2 添加品牌

```sql
insert into brands (brand_name, logo, country, website, status)
values
('华为','brand_icon/HUAWEI.png','中国','https://consumer.huawei.com/cn/',1),
('小米','brand_icon/Xiaomi.png','中国','https://www.mi.com/about/index.html',1),
('OPPO','brand_icon/OPPO.svg','中国','https://www.oppo.com/cn/smartphones/',1),
('vivo','brand_icon/Vivo.png','中国','https://www.vivo.com.cn/',1),
('荣耀','brand_icon/Honor.png','中国','https://www.honor.com/cn/phones/',1),
('魅族','brand_icon/MEIZU.png','中国','https://www.meizu.com/index.html',1),
('中兴','brand_icon/ZTE.png','中国','https://www.ztedevices.com/cn/',1),
('Apple','brand_icon/Apple.png','美国','https://www.apple.com.cn/',1),
('三星','brand_icon/Samsung.png','韩国','https://www.samsung.com.cn/',1),
('联想','brand_icon/Lenovo.png','中国','https://www.lenovo.com.cn/',1),
('戴尔','brand_icon/Dell.png','美国','https://www.dell.com/zh-cn',1),
('惠普','brand_icon/HP.png','美国','https://www.hp.com/cn-zh/home.html',1),
('华硕','brand_icon/Asus.png','中国台湾','https://www.asus.com.cn/',1),
('宏碁','brand_icon/acer.png','中国台湾','https://www.acer.com.cn/',1),
('机械革命','brand_icon/MECHREVO.jpg','中国','https://www.mechrevo.com/',1),
('七彩虹','brand_icon/Colorful.jpg','中国','https://www.colorful.cn/',1),
('火影','brand_icon/FIREBAT.png','中国','https://www.firebat.com.cn/',1);
```

![image-20260603204402213](README.assets/image-20260603204402213.png)

#### 6.3.3 插入手机，电脑与对应图片

由于数量过多，故不插入图片与源码

#### 6.3.4 插入评论

```sql
use choose_device;

insert into comments
(user_id, product_id, content, rating, comment_time, like_count, reply_count, status)
values
(
  (select user_id from users where username = 'gin' limit 1),
  (select product_id from products where product_name = 'HUAWEI Mate 60' limit 1),
  '外观设计很有辨识度，日常使用非常流畅，续航表现也比较稳定。',
  5,
  now(),
  12,
  0,
  1
);

insert into comments
(user_id, product_id, content, rating, comment_time, like_count, reply_count, status)
values
(
  (select user_id from users where username = 'gin' limit 1),
  (select product_id from products where product_name = 'HUAWEI Mate 60 Pro' limit 1),
  '屏幕显示效果细腻，拍照能力很强，就是机身握持感稍微偏厚。',
  4,
  date_sub(now(), interval 1 day),
  8,
  0,
  1
);

insert into comments
(user_id, product_id, content, rating, comment_time, like_count, reply_count, status)
values
(
  (select user_id from users where username = 'gin' limit 1),
  (select product_id from products where product_name = 'HUAWEI Mate 70' limit 1),
  '系统动画顺滑，电池容量够用，作为主力机体验不错。',
  5,
  date_sub(now(), interval 2 day),
  16,
  0,
  1
);

insert into comments
(user_id, product_id, content, rating, comment_time, like_count, reply_count, status)
values
(
  (select user_id from users where username = 'gin' limit 1),
  (select product_id from products where product_name = 'MacBook Air 13 (M4)' limit 1),
  '机身轻薄，续航时间长，日常学习和办公都很合适。',
  5,
  date_sub(now(), interval 3 day),
  21,
  0,
  1
);

insert into comments
(user_id, product_id, content, rating, comment_time, like_count, reply_count, status)
values
(
  (select user_id from users where username = 'gin' limit 1),
  (select product_id from products where product_name = 'ThinkPad X1 Carbon' limit 1),
  '键盘手感很好，商务办公体验扎实，价格如果再低一点会更香。',
  4,
  date_sub(now(), interval 4 day),
  7,
  0,
  1
);

insert into comments
(user_id, product_id, content, rating, comment_time, like_count, reply_count, status)
values
(
  (select user_id from users where username = 'gin' limit 1),
  (select product_id from products where product_name = '拯救者 Y7000P 2025' limit 1),
  '游戏性能比较强，散热表现不错，运行大型游戏比较稳定。',
  4,
  date_sub(now(), interval 5 day),
  18,
  0,
  1
);
```

![image-20260605221052982](README.assets/image-20260605221052982.png)

### 6.6 数据库测试与试运行

#### 6.6.1 管理员功能

##### 6.6.1.1 用户管理

首先先添加一个用户名为zewei的数据，如图

![image-20260604205054543](README.assets/image-20260604205054543.png)

添加完成后，在管理员系统即可看到对应用户信息![image-20260604205451916](README.assets/image-20260604205451916.png)

选择对应用户关闭按钮，即可实现状态的切换

![image-20260604205911879](README.assets/image-20260604205911879.png)

点击编辑，即可对用户执行修改信息操作

![image-20260604210029584](README.assets/image-20260604210029584.png)

![image-20260604210039063](README.assets/image-20260604210039063.png)

点击删除，即可对用户进行删除操作

![image-20260605223644182](README.assets/image-20260605223644182.png)

![image-20260605223659632](README.assets/image-20260605223659632.png)

##### 6.6.1.2 产品分类管理

点击产品分类，即可进入产品分类页面

![image-20260605224401867](README.assets/image-20260605224401867.png)

点击新增分类，即可添加新的分类

![image-20260605224546294](README.assets/image-20260605224546294.png)

![image-20260605224600006](README.assets/image-20260605224600006.png)

点击编辑，即可进行修改

![image-20260605224705503](README.assets/image-20260605224705503.png)

点击状态，即可切换目前的状态

![image-20260605225034050](README.assets/image-20260605225034050.png)

![image-20260605224719314](README.assets/image-20260605224719314.png)

点击删除，即可删除对应的分类

![image-20260605224743234](README.assets/image-20260605224743234.png)

![image-20260605224800593](README.assets/image-20260605224800593.png)

##### 6.6.1.3 品牌信息管理

点击产品管理，即可看到所有品牌

![image-20260605224917368](README.assets/image-20260605224917368.png)

点击新增品牌，即可添加品牌

![image-20260605233708326](README.assets/image-20260605233708326.png)



![image-20260605233845623](README.assets/image-20260605233845623.png)

点击保存

![image-20260605233928438](README.assets/image-20260605233928438.png)

点击状态按钮，即可禁用

![image-20260605234019257](README.assets/image-20260605234019257.png)

点击编辑，即可改动数据

![image-20260605234102592](README.assets/image-20260605234102592.png)

![image-20260605234121887](README.assets/image-20260605234121887.png)

点击删除，即可删除对应品牌

![image-20260605234143843](README.assets/image-20260605234143843.png)

![image-20260605234201509](README.assets/image-20260605234201509.png)

##### 6.6.1.4 产品信息管理

点击设备信息，即可选择所需要的设备进行查询

![image-20260605234314246](README.assets/image-20260605234314246.png)

![image-20260605234327285](README.assets/image-20260605234327285.png)

这里以手机为例

点击新增手机，即可添加手机

![image-20260606000001927](README.assets/image-20260606000001927.png)

点击保存，即可在后台看到数据

![image-20260606000033503](README.assets/image-20260606000033503.png)

点击编辑，即可编辑数据

![image-20260606000237214](README.assets/image-20260606000237214.png)

点击删除，即可删除对应数据

![image-20260606000327650](README.assets/image-20260606000327650.png)

![image-20260606010140653](README.assets/image-20260606010140653.png)

##### 6.6.1.5 配置信息管理

在对应设备信息中，点击配置即可添加配置

![image-20260606010227511](README.assets/image-20260606010227511.png)

输入对应的配置，即可添加

![image-20260606010321757](README.assets/image-20260606010321757.png)

点击编辑，即可编辑对应配置

![image-20260606010408831](README.assets/image-20260606010408831.png)

![image-20260606010417404](README.assets/image-20260606010417404.png)

点击删除即可删除对应配置

![image-20260606010538790](README.assets/image-20260606010538790.png)

##### 6.6.1.6 产品图片管理

还是以手机为例

点击图片，即可进行商品图片管理

![image-20260606010617476](README.assets/image-20260606010617476.png)

上传图片，即可

![image-20260606010656525](README.assets/image-20260606010656525.png)

并且可以设置主图，点击主图即可替换

![image-20260606010731390](README.assets/image-20260606010731390.png)

点击删除即可删除对应图片

![image-20260606010754446](README.assets/image-20260606010754446.png)

##### 6.6.1.7 评论管理

选择评论管理，即可查看对应评论

![image-20260606010821352](README.assets/image-20260606010821352.png)

点击隐藏，即可隐藏对应商品的评论![image-20260606010859270](README.assets/image-20260606010859270.png)

![image-20260606011046505](README.assets/image-20260606011046505.png)

点击删除，即可删除对应的评论![image-20260606010916983](README.assets/image-20260606010916983.png)

![image-20260606010927960](README.assets/image-20260606010927960.png)

![image-20260606011026760](README.assets/image-20260606011026760.png)

#### 6.6.2 用户功能

##### 6.6.2.1 用户登录与注册

点击注册，即可进入注册页面![image-20260606014409970](README.assets/image-20260606014409970.png)

点击注册，即可注册账号![image-20260606014426279](README.assets/image-20260606014426279.png)

点击登录，即可登录

![image-20260606014448627](README.assets/image-20260606014448627.png)、

登录后自动进入个人中心

![image-20260606014539916](README.assets/image-20260606014539916.png)

##### 6.6.2.2 查看商品信息

点击商品挑选进入对应页面

![image-20260606014610501](README.assets/image-20260606014610501.png)

可以直观的看到对应设备的信息

##### 6.6.2.3 查询产品

在搜索框里面搜索需要设备的信息即可![image-20260606014740248](README.assets/image-20260606014740248.png)

##### 6.6.2.4 查看商品详情

点击想看的商品，即可查看商品详情

![image-20260606014813208](README.assets/image-20260606014813208.png)

##### 6.6.2.5 商品对比

挑选想要的商品即可，最多五个

![image-20260606014901326](README.assets/image-20260606014901326.png)

##### 6.6.2.6 收藏商品

点击收藏，即可收藏商品，可在我的收藏里面查看

![image-20260606014926323](README.assets/image-20260606014926323.png)

![image-20260606015024805](README.assets/image-20260606015024805.png)

##### 6.6.2.7 评分与评论

进入详情，在用户评分与评论中输入自己想要的评论即可

![image-20260606015109363](README.assets/image-20260606015109363.png)

## 7.数据库运行与维护

### 7.1 运行与备份数据库

点击备份按钮，点击新建备份。进行数据库备份

![image-20260606020515937](README.assets/image-20260606020515937.png)

### 7.2 维护数据库

1. 在products表中不小心把手机处理器名称给改错了![image-20260606020730560](README.assets/image-20260606020730560.png)

2. 此时，点击备份，选择还原备份，进行数据库恢复![image-20260606020823875](README.assets/image-20260606020823875.png)

3. 此时，在打开products表看对应手机配置，即为正确配置![image-20260606020906635](README.assets/image-20260606020906635.png)

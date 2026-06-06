create database choose_device;
use choose_device;
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
create table admin_category (
    admin_id int not null comment '管理员编号',
    category_id int not null comment '分类编号',
    primary key (admin_id, category_id),
    index idx_admin_category_category_id (category_id),
    foreign key (admin_id) references admin(admin_id),
    foreign key (category_id) references categories(category_id)
) engine=innodb;
create table admin_brand (
    admin_id int not null comment '管理员编号',
    brand_id int not null comment '品牌编号',
    primary key (admin_id, brand_id),
    index idx_admin_brand_brand_id (brand_id),
    foreign key (admin_id) references admin(admin_id),
    foreign key (brand_id) references brands(brand_id)
) engine=innodb;
create table admin_product (
    admin_id int not null comment '管理员编号',
    product_id int not null comment '产品编号',
    primary key (admin_id, product_id),
    index idx_admin_product_product_id (product_id),
    foreign key (admin_id) references admin(admin_id),
    foreign key (product_id) references products(product_id)
) engine=innodb;
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
create table admin_comment (
    admin_id int not null comment '管理员编号',
    comment_id int not null comment '评论编号',
    primary key (admin_id, comment_id),
    index idx_admin_comment_comment_id (comment_id),
    foreign key (admin_id) references admin(admin_id),
    foreign key (comment_id) references comments(comment_id)
) engine=innodb;
-- 添加种类
insert into categories (category_name,parent_id,description,sort_order,status)
values('手机',null,'手机类数码产品',1,1),('电脑',null,'电脑类数码产品',2,1);
-- 添加品牌
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

-- 插入手机
insert into products (product_name, category_id, brand_id, price, description, status)
values
('HUAWEI Mate 60', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = '华为' limit 1), 4999, '处理器：麒麟9000S；电池容量：4750mAh', 1),
('HUAWEI Mate 60 Pro', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = '华为' limit 1), 5699, '处理器：麒麟9000S；电池容量：5000mAh', 1),
('HUAWEI Mate 60 Pro+', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = '华为' limit 1), 7999, '处理器：麒麟9000S；电池容量：5000mAh', 1),
('HUAWEI Mate 60 RS 非凡大师', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = '华为' limit 1), 11999, '处理器：麒麟9000S；电池容量：5000mAh', 1),
('HUAWEI Mate 70', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = '华为' limit 1), 5499, '处理器：麒麟9010；电池容量：5300mAh', 1),
('HUAWEI Mate 70 Pro', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = '华为' limit 1), 6499, '处理器：麒麟9020；电池容量：5500mAh', 1),
('HUAWEI Mate 70 RS 非凡大师', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = '华为' limit 1), 11999, '处理器：麒麟9020；电池容量：5700mAh', 1),
('HUAWEI Mate 80', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = '华为' limit 1), 4699, '处理器：麒麟9020；电池容量：5750mAh', 1),
('HUAWEI Mate 80 Pro', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = '华为' limit 1), 5999, '处理器：麒麟9030 / 麒麟9030 Pro；电池容量：5750mAh', 1),
('HUAWEI Mate 80 Pro Max', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = '华为' limit 1), 6999, '处理器：麒麟9030 Pro；电池容量：6000mAh', 1),
('HUAWEI Mate 80 RS 非凡大师', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = '华为' limit 1), 11999, '处理器：麒麟9030 Pro；电池容量：6000mAh', 1),
('HUAWEI P60', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = '华为' limit 1), 4488, '处理器：骁龙8+ Gen1；电池容量：4815mAh', 1),
('HUAWEI P60 Pro', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = '华为' limit 1), 6188, '处理器：骁龙8+ Gen1；电池容量：4815mAh', 1),
('HUAWEI P60 Art', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = '华为' limit 1), 8988, '处理器：骁龙8+ Gen1；电池容量：5060mAh', 1),
('HUAWEI Pura 70', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = '华为' limit 1), 4999, '处理器：麒麟9010；电池容量：4900mAh', 1),
('HUAWEI Pura 70 Pro', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = '华为' limit 1), 5999, '处理器：麒麟9020；电池容量：5050mAh', 1),
('HUAWEI Pura 70 Pro+', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = '华为' limit 1), 7499, '处理器：麒麟9020；电池容量：5050mAh', 1),
('HUAWEI Pura 70 Ultra', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = '华为' limit 1), 9999, '处理器：麒麟9020；电池容量：5200mAh', 1),
('HUAWEI Pura 80', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = '华为' limit 1), 5299, '处理器：官网未标注；电池容量：5600mAh', 1),
('HUAWEI Pura 80 Pro', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = '华为' limit 1), 6299, '处理器：麒麟9020；电池容量：5700mAh', 1),
('HUAWEI Pura 80 Pro+', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = '华为' limit 1), 7699, '处理器：麒麟9020；电池容量：5700mAh', 1),
('HUAWEI Pura 80 Ultra', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = '华为' limit 1), 10999, '处理器：麒麟9020；电池容量：5700mAh', 1),
('HUAWEI Pura 90', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = '华为' limit 1), 5599, '处理器：麒麟9010S；电池容量：6500mAh', 1),
('HUAWEI Pura 90 Pro', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = '华为' limit 1), 6599, '处理器：麒麟9030S；电池容量：6000mAh', 1),
('HUAWEI Pura 90 Pro Max', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = '华为' limit 1), 7999, '处理器：麒麟9030S；电池容量：6000mAh', 1),
('小米  17', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = '小米' limit 1), 4499, '处理器：骁龙 8Elite Gen5；电池容量：7100mAh', 1),
('小米 17 Pro', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = '小米' limit 1), 5299, '处理器：骁龙 8Elite Gen5；电池容量：6300mAh', 1),
('小米 17 Pro Max', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = '小米' limit 1), 5999, '处理器：骁龙 8Elite Gen5；电池容量：7500mAh', 1),
('小米 17 Max', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = '小米' limit 1), 0, '处理器：骁龙 8Elite Gen5；电池容量：8000mAh', 1),
('小米 17 Ultra', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = '小米' limit 1), 6999, '处理器：骁龙 8Elite Gen5；电池容量：6800mAh', 1),
('小米 17 Ultra徕卡版', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = '小米' limit 1), 7499, '处理器：骁龙 8Elite Gen5；电池容量：6800mAh', 1),
('小米 15s Pro', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = '小米' limit 1), 5299, '处理器：Xring O1；电池容量：6100mAh', 1),
('小米 15 Pro', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = '小米' limit 1), 5299, '处理器：骁龙 8 至尊版；电池容量：6100mAh', 1),
('小米 15', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = '小米' limit 1), 4499, '处理器：骁龙 8 至尊版；电池容量：5400mAh', 1),
('小米 14 Ultra', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = '小米' limit 1), 6499, '处理器：骁龙 8 Gen3；电池容量：5300mAh', 1),
('小米 14 Pro', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = '小米' limit 1), 4999, '处理器：骁龙 8 Gen3；电池容量：5400mAh', 1),
('小米 14', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = '小米' limit 1), 3999, '处理器：骁龙 8 Gen3；电池容量：4610mAh', 1),
('REDMI K90 Max', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = '小米' limit 1), 3499, '处理器：天玑9500；电池容量：8550mAh', 1),
('REDMI K90 Pro Max', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = '小米' limit 1), 3999, '处理器：骁龙 8 Elite Gen5；电池容量：7500mAh', 1),
('REDMI K90 ', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = '小米' limit 1), 2599, '处理器：骁龙 8 至尊版；电池容量：7100mAh', 1),
('Redmi K80 Ultra', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = '小米' limit 1), 2599, '处理器：天玑9400+；电池容量：6500mAh', 1),
('Redmi K80 Pro', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = '小米' limit 1), 3699, '处理器：骁龙 8 至尊版；电池容量：6000mAh', 1),
('Redmi K80', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = '小米' limit 1), 2599, '处理器：骁龙 8 Gen3；电池容量：6550mAh', 1),
('OPPO Find X9 Ultra', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = 'OPPO' limit 1), 7499, '处理器：骁龙8 Elite Gen5；电池容量：7050mAh', 1),
('OPPO Find X9s Pro', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = 'OPPO' limit 1), 5299, '处理器：天玑 9500；电池容量：7025mAh', 1),
('OPPO Find N6', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = 'OPPO' limit 1), 9999, '处理器：骁龙8 Elite；电池容量：6000mAh', 1),
('OPPO Find X9 Pro', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = 'OPPO' limit 1), 4799, '处理器：天玑 9500；电池容量：7500mAh', 1),
('OPPO Find X9', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = 'OPPO' limit 1), 3999, '处理器：天玑 9500；电池容量：7500mAh', 1),
('OPPO Find X8 Ultra', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = 'OPPO' limit 1), 5999, '处理器：骁龙8 至尊版；电池容量：6100mAh', 1),
('OPPO Find X8s+', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = 'OPPO' limit 1), 3619, '处理器：天玑 9400+；电池容量：6000mAh', 1),
('OPPO Find X8s', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = 'OPPO' limit 1), 3399, '处理器：天玑 9400+；电池容量：5700mAh', 1),
('OPPO Find X8 Pro', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = 'OPPO' limit 1), 5299, '处理器：天玑 9400；电池容量：5910mAh', 1),
('OPPO Find X8', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = 'OPPO' limit 1), 3399, '处理器：天玑 9400；电池容量：5630mAh', 1),
('一加 15', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = 'OPPO' limit 1), 4499, '处理器：骁龙 8Elite Gen5；电池容量：7300mAh', 1),
('一加 13', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = 'OPPO' limit 1), 4499, '处理器：骁龙 8 至尊版；电池容量：6000mAh', 1),
('一加 12', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = 'OPPO' limit 1), 4299, '处理器：骁龙 8 Gen3；电池容量：5400mAh', 1),
('vivo X300 Ultra', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = 'vivo' limit 1), 6999, '处理器：骁龙 8Elite Gen5；电池容量：6600mAh', 1),
('vivo X300 Pro', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = 'vivo' limit 1), 5599, '处理器：天玑 9500；电池容量：6510mAh', 1),
('vivo X300s', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = 'vivo' limit 1), 4999, '处理器：天玑 9500；电池容量：7100mAh', 1),
('vivo X300', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = 'vivo' limit 1), 4599, '处理器：天玑 9500；电池容量：6040mAh', 1),
('iQOO 15', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = 'vivo' limit 1), 4599, '处理器：骁龙 8Elite Gen5；电池容量：7000mAh', 1),
('iQOO 13', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = 'vivo' limit 1), 3999, '处理器：骁龙 8 至尊版；电池容量：6150mAh', 1),
('荣耀 Magic7 Pro', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = '荣耀' limit 1), 5699, '处理器：骁龙 8 至尊版；电池容量：5850mAh', 1),
('魅族 21 Pro', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = '魅族' limit 1), 4999, '处理器：骁龙 8 Gen 3；电池容量：5050mAh', 1),
('iPhone 17 Pro Max', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = 'Apple' limit 1), 9999, '处理器：A19 Pro；电池容量：4823mAh', 1),
('iPhone 17 Pro', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = 'Apple' limit 1), 8999, '处理器：A19 Pro；电池容量：3988mAh', 1),
('iPhone Air', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = 'Apple' limit 1), 7999, '处理器：A19 Pro(5核CPU)；电池容量：3036mAh', 1),
('iPhone 17', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = 'Apple' limit 1), 5999, '处理器：A19；电池容量：3692mAh', 1),
('iPhone 17e', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = 'Apple' limit 1), 4499, '处理器：A19(4核GPU)；电池容量：4005mAh', 1),
('iPhone 16 Pro Max', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = 'Apple' limit 1), 9999, '处理器：A18Pro；电池容量：4685mAh', 1),
('iPhone 16 Pro', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = 'Apple' limit 1), 8999, '处理器：A18Pro；电池容量：3582mAh', 1),
('iPhone 16Plus', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = 'Apple' limit 1), 5999, '处理器：A18；电池容量：4674mAh', 1),
('iPhone 16', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = 'Apple' limit 1), 5199, '处理器：A18；电池容量：3561mAh', 1),
('iPhone 16e', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = 'Apple' limit 1), 4499, '处理器：A18；电池容量：3561mAh', 1),
('iPhone 15 Pro Max', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = 'Apple' limit 1), 9999, '处理器：A17Pro；电池容量：4422mAh', 1),
('iPhone 15 Pro', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = 'Apple' limit 1), 8999, '处理器：A17Pro；电池容量：3274mAh', 1),
('iPhone 15Plus', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = 'Apple' limit 1), 5999, '处理器：A16；电池容量：4383mAh', 1),
('iPhone 15', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = 'Apple' limit 1), 5199, '处理器：A16；电池容量：3349mAh', 1),
('Samsung Galaxy S26 Ultra', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = '三星' limit 1), 9999, '处理器：骁龙 8Elite Gen5 for Galaxy；电池容量：5000mAh', 1),
('Samsung Galaxy S26+', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = '三星' limit 1), 7999, '处理器：骁龙 8Elite Gen5 for Galaxy；电池容量：4900mAh', 1),
('Samsung Galaxy S26', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = '三星' limit 1), 5999, '处理器：骁龙 8Elite Gen5 for Galaxy；电池容量：4300mAh', 1),
('Samsung Galaxy S25 Ultra', (select category_id from categories where category_name = '手机' limit 1), (select brand_id from brands where brand_name = '三星' limit 1), 9699, '处理器：骁龙 8 至尊版 for Galaxy；电池容量：5000mAh', 1);
-- 插入手机图片
insert into product_images (product_id, image_url, image_name, image_type, is_main, upload_time, status)
values
((select product_id from products where product_name = 'HUAWEI Mate 60' limit 1), 'phone_image/Mate60.jpg', 'Mate60.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = 'HUAWEI Mate 60 Pro' limit 1), 'phone_image/Mate60 Pro.jpg', 'Mate60 Pro.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = 'HUAWEI Mate 60 Pro+' limit 1), 'phone_image/Mate60Pro+.jpg', 'Mate60Pro+.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = 'HUAWEI Mate 60 RS 非凡大师' limit 1), 'phone_image/Mate60RS.jpg', 'Mate60RS.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = 'HUAWEI Mate 70' limit 1), 'phone_image/Mate 70.jpg', 'Mate 70.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = 'HUAWEI Mate 70 Pro' limit 1), 'phone_image/mate70pro.jpg', 'mate70pro.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = 'HUAWEI Mate 70 RS 非凡大师' limit 1), 'phone_image/Mate70RS.png', 'Mate70RS.png', 'png', 1, now(), 1),
((select product_id from products where product_name = 'HUAWEI Mate 80' limit 1), 'phone_image/Mate 80.png', 'Mate 80.png', 'png', 1, now(), 1),
((select product_id from products where product_name = 'HUAWEI Mate 80 Pro' limit 1), 'phone_image/Mate 80 Pro.png', 'Mate 80 Pro.png', 'png', 1, now(), 1),
((select product_id from products where product_name = 'HUAWEI Mate 80 Pro Max' limit 1), 'phone_image/Mate 80 Pro Max.png', 'Mate 80 Pro Max.png', 'png', 1, now(), 1),
((select product_id from products where product_name = 'HUAWEI Mate 80 RS 非凡大师' limit 1), 'phone_image/Mate80RS.png', 'Mate80RS.png', 'png', 1, now(), 1),
((select product_id from products where product_name = 'HUAWEI P60' limit 1), 'phone_image/P60.jpg', 'P60.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = 'HUAWEI P60 Pro' limit 1), 'phone_image/P60Pro.jpg', 'P60Pro.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = 'HUAWEI P60 Art' limit 1), 'phone_image/P60Art.jpg', 'P60Art.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = 'HUAWEI Pura 70' limit 1), 'phone_image/Pura70.jpg', 'Pura70.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = 'HUAWEI Pura 70 Pro' limit 1), 'phone_image/Pura70Pro.jpg', 'Pura70Pro.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = 'HUAWEI Pura 70 Pro+' limit 1), 'phone_image/Pura70Pro+.jpg', 'Pura70Pro+.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = 'HUAWEI Pura 70 Ultra' limit 1), 'phone_image/Pura70Ultra.jpg', 'Pura70Ultra.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = 'HUAWEI Pura 80' limit 1), 'phone_image/Pura80.jpg', 'Pura80.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = 'HUAWEI Pura 80 Pro' limit 1), 'phone_image/Pura80Pro.jpg', 'Pura80Pro.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = 'HUAWEI Pura 80 Pro+' limit 1), 'phone_image/Pura80Pro+.jpg', 'Pura80Pro+.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = 'HUAWEI Pura 80 Ultra' limit 1), 'phone_image/Pura80Ultra.jpg', 'Pura80Ultra.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = 'HUAWEI Pura 90' limit 1), 'phone_image/Pura90.jpg', 'Pura90.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = 'HUAWEI Pura 90 Pro' limit 1), 'phone_image/Pura90Pro.jpg', 'Pura90Pro.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = 'HUAWEI Pura 90 Pro Max' limit 1), 'phone_image/Pura90ProMax.jpg', 'Pura90ProMax.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = '小米  17' limit 1), 'phone_image/xm17.jpg', 'xm17.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = '小米 17 Pro' limit 1), 'phone_image/xm17Pro.jpg', 'xm17Pro.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = '小米 17 Pro Max' limit 1), 'phone_image/xm17ProMax.jpg', 'xm17ProMax.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = '小米 17 Max' limit 1), 'phone_image/xm17Max.jpg', 'xm17Max.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = '小米 17 Ultra' limit 1), 'phone_image/xm17Ultra.jpg', 'xm17Ultra.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = '小米 17 Ultra徕卡版' limit 1), 'phone_image/xm17Ultra For LEICA.png', 'xm17Ultra For LEICA.png', 'png', 1, now(), 1),
((select product_id from products where product_name = '小米 15s Pro' limit 1), 'phone_image/xm15sPro.jpg', 'xm15sPro.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = '小米 15 Pro' limit 1), 'phone_image/xm15Pro.jpg', 'xm15Pro.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = '小米 15' limit 1), 'phone_image/xm15.jpg', 'xm15.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = '小米 14 Ultra' limit 1), 'phone_image/xm14Ultra.jpg', 'xm14Ultra.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = '小米 14 Pro' limit 1), 'phone_image/xm14Pro.jpg', 'xm14Pro.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = '小米 14' limit 1), 'phone_image/xm14.jpg', 'xm14.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = 'REDMI K90 Max' limit 1), 'phone_image/K90Max.jpg', 'K90Max.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = 'REDMI K90 Pro Max' limit 1), 'phone_image/K90ProMax.jpg', 'K90ProMax.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = 'REDMI K90 ' limit 1), 'phone_image/K90.jpg', 'K90.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = 'Redmi K80 Ultra' limit 1), 'phone_image/K80Ultra.jpg', 'K80Ultra.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = 'Redmi K80 Pro' limit 1), 'phone_image/K80Pro.jpg', 'K80Pro.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = 'Redmi K80' limit 1), 'phone_image/K80.jpg', 'K80.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = 'OPPO Find X9 Ultra' limit 1), 'phone_image/FindX9 Ultra.png', 'FindX9 Ultra.png', 'png', 1, now(), 1),
((select product_id from products where product_name = 'OPPO Find X9s Pro' limit 1), 'phone_image/FindX9s Pro.png', 'FindX9s Pro.png', 'png', 1, now(), 1),
((select product_id from products where product_name = 'OPPO Find N6' limit 1), 'phone_image/FindN6.png', 'FindN6.png', 'png', 1, now(), 1),
((select product_id from products where product_name = 'OPPO Find X9 Pro' limit 1), 'phone_image/FindX9 Pro.png', 'FindX9 Pro.png', 'png', 1, now(), 1),
((select product_id from products where product_name = 'OPPO Find X9' limit 1), 'phone_image/FindX9.png', 'FindX9.png', 'png', 1, now(), 1),
((select product_id from products where product_name = 'OPPO Find X8 Ultra' limit 1), 'phone_image/FindX8 Ultra.png', 'FindX8 Ultra.png', 'png', 1, now(), 1),
((select product_id from products where product_name = 'OPPO Find X8s+' limit 1), 'phone_image/FindX8s+.png', 'FindX8s+.png', 'png', 1, now(), 1),
((select product_id from products where product_name = 'OPPO Find X8s' limit 1), 'phone_image/FindX8s.png', 'FindX8s.png', 'png', 1, now(), 1),
((select product_id from products where product_name = 'OPPO Find X8 Pro' limit 1), 'phone_image/FindX8 Pro.png', 'FindX8 Pro.png', 'png', 1, now(), 1),
((select product_id from products where product_name = 'OPPO Find X8' limit 1), 'phone_image/FindX8.png', 'FindX8.png', 'png', 1, now(), 1),
((select product_id from products where product_name = '一加 15' limit 1), 'phone_image/1+15.png', '1+15.png', 'png', 1, now(), 1),
((select product_id from products where product_name = '一加 13' limit 1), 'phone_image/1+13.png', '1+13.png', 'png', 1, now(), 1),
((select product_id from products where product_name = '一加 12' limit 1), 'phone_image/1+12.png', '1+12.png', 'png', 1, now(), 1),
((select product_id from products where product_name = 'vivo X300 Ultra' limit 1), 'phone_image/X300Ultra.png', 'X300Ultra.png', 'png', 1, now(), 1),
((select product_id from products where product_name = 'vivo X300 Pro' limit 1), 'phone_image/X300Pro.png', 'X300Pro.png', 'png', 1, now(), 1),
((select product_id from products where product_name = 'vivo X300s' limit 1), 'phone_image/X300s.png', 'X300s.png', 'png', 1, now(), 1),
((select product_id from products where product_name = 'vivo X300' limit 1), 'phone_image/X300.png', 'X300.png', 'png', 1, now(), 1),
((select product_id from products where product_name = 'iQOO 15' limit 1), 'phone_image/iQOO15.png', 'iQOO15.png', 'png', 1, now(), 1),
((select product_id from products where product_name = 'iQOO 13' limit 1), 'phone_image/iQOO13.png', 'iQOO13.png', 'png', 1, now(), 1),
((select product_id from products where product_name = '荣耀 Magic7 Pro' limit 1), 'phone_image/Magic7Pro.png', 'Magic7Pro.png', 'png', 1, now(), 1),
((select product_id from products where product_name = '魅族 21 Pro' limit 1), 'phone_image/MEIZU 21Pro.jpg', 'MEIZU 21Pro.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = 'iPhone 17 Pro Max' limit 1), 'phone_image/17ProMax.jpg', '17ProMax.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = 'iPhone 17 Pro' limit 1), 'phone_image/17Pro.jpg', '17Pro.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = 'iPhone Air' limit 1), 'phone_image/iPhone Air.jpg', 'iPhone Air.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = 'iPhone 17' limit 1), 'phone_image/17.jpg', '17.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = 'iPhone 17e' limit 1), 'phone_image/17e.jpg', '17e.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = 'iPhone 16 Pro Max' limit 1), 'phone_image/16ProMax.png', '16ProMax.png', 'png', 1, now(), 1),
((select product_id from products where product_name = 'iPhone 16 Pro' limit 1), 'phone_image/16Pro.png', '16Pro.png', 'png', 1, now(), 1),
((select product_id from products where product_name = 'iPhone 16Plus' limit 1), 'phone_image/16Plus.png', '16Plus.png', 'png', 1, now(), 1),
((select product_id from products where product_name = 'iPhone 16' limit 1), 'phone_image/16.jpg', '16.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = 'iPhone 16e' limit 1), 'phone_image/16e.png', '16e.png', 'png', 1, now(), 1),
((select product_id from products where product_name = 'iPhone 15 Pro Max' limit 1), 'phone_image/15ProMax.png', '15ProMax.png', 'png', 1, now(), 1),
((select product_id from products where product_name = 'iPhone 15 Pro' limit 1), 'phone_image/15Pro.png', '15Pro.png', 'png', 1, now(), 1),
((select product_id from products where product_name = 'iPhone 15Plus' limit 1), 'phone_image/15Plus.png', '15Plus.png', 'png', 1, now(), 1),
((select product_id from products where product_name = 'iPhone 15' limit 1), 'phone_image/15.png', '15.png', 'png', 1, now(), 1),
((select product_id from products where product_name = 'Samsung Galaxy S26 Ultra' limit 1), 'phone_image/Galaxy-S26-Ultra.jpg', 'Galaxy-S26-Ultra.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = 'Samsung Galaxy S26+' limit 1), 'phone_image/S26.jpg', 'S26.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = 'Samsung Galaxy S26' limit 1), 'phone_image/S26.jpg', 'S26.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = 'Samsung Galaxy S25 Ultra' limit 1), 'phone_image/S25Ultra.jpg', 'S25Ultra.jpg', 'jpg', 1, now(), 1);

-- 插入电脑
insert into products (product_name, category_id, brand_id, price, description, status)
values
('MacBook Air 13 (M3)', (select category_id from categories where category_name = '电脑' limit 1), (select brand_id from brands where brand_name = 'Apple' limit 1), 8999, '类型：轻薄本；处理器：Apple M3；显卡：至高 8 核 GPU；内存：16GB；存储：512GB SSD', 1),
('MacBook Pro 14 (M4 Pro)', (select category_id from categories where category_name = '电脑' limit 1), (select brand_id from brands where brand_name = 'Apple' limit 1), 16999, '类型：创作本；处理器：Apple M4 Pro；显卡：至高 16 核 GPU；内存：24GB；存储：1TB SSD', 1),
('MacBook Air 13 (M4)', (select category_id from categories where category_name = '电脑' limit 1), (select brand_id from brands where brand_name = 'Apple' limit 1), 10999, '类型：轻薄本；处理器：Apple M4；显卡：10核图形处理器；内存：24GB；存储：512GB SSD', 1),
('MacBook Pro 13 (M2)', (select category_id from categories where category_name = '电脑' limit 1), (select brand_id from brands where brand_name = 'Apple' limit 1), 9999, '类型：轻薄本；处理器：Apple M2；显卡：10核图形处理器；内存：8GB；存储：256GB SSD', 1),
('ThinkPad X1 Carbon', (select category_id from categories where category_name = '电脑' limit 1), (select brand_id from brands where brand_name = '联想' limit 1), 12999, '类型：商务本；处理器：酷睿 Ultra 7-255H；显卡：Intel Arc 140T 核显；内存：32GB；存储：1TB SSD', 1),
('拯救者 Y7000P 2025', (select category_id from categories where category_name = '电脑' limit 1), (select brand_id from brands where brand_name = '联想' limit 1), 7999, '类型：游戏本；处理器：酷睿 i7-14700HX；显卡：RTX 4070；内存：16GB；存储：1TB SSD', 1),
('拯救者R9000P 2025 AI元启', (select category_id from categories where category_name = '电脑' limit 1), (select brand_id from brands where brand_name = '联想' limit 1), 11149, '类型：游戏本；处理器：AMD Ryzen 9 8945HX；显卡：RTX 5070；内存：32GB；存储：1TB SSD', 1),
('拯救者Y7000P 2025 AI元启', (select category_id from categories where category_name = '电脑' limit 1), (select brand_id from brands where brand_name = '联想' limit 1), 9499, '类型：游戏本；处理器：酷睿 i9 14900HX；显卡：RTX 5060；内存：16GB；存储：1TB SSD', 1),
('小新Pro16GT 2026 AI元启版', (select category_id from categories where category_name = '电脑' limit 1), (select brand_id from brands where brand_name = '联想' limit 1), 0, '类型：轻薄本；处理器：酷睿 Ultra X9 388H；显卡：Intel Arc B390；内存：32GB；存储：1TB SSD', 1),
('MateBook X Pro', (select category_id from categories where category_name = '电脑' limit 1), (select brand_id from brands where brand_name = '华为' limit 1), 11199, '类型：轻薄本；处理器：酷睿 Ultra 9 185H；显卡：Intel Arc 核显；内存：32GB；存储：2TB SSD', 1),
('MateBook 14', (select category_id from categories where category_name = '电脑' limit 1), (select brand_id from brands where brand_name = '华为' limit 1), 6499, '类型：全能本；处理器：酷睿 Ultra 5 125H；显卡：Intel Arc 核显；内存：16GB；存储：1TB SSD', 1),
('MateBook Fold 非凡大师', (select category_id from categories where category_name = '电脑' limit 1), (select brand_id from brands where brand_name = '华为' limit 1), 19999, '类型：轻薄本；处理器：麒麟X90；显卡：集成显卡；内存：32GB；存储：2TB SSD', 1),
('MateBook Pro', (select category_id from categories where category_name = '电脑' limit 1), (select brand_id from brands where brand_name = '华为' limit 1), 7999, '类型：轻薄本；处理器：麒麟X90；显卡：集成显卡；内存：32GB；存储：1TB SSD', 1),
('XPS 13 2024', (select category_id from categories where category_name = '电脑' limit 1), (select brand_id from brands where brand_name = '戴尔' limit 1), 16999, '类型：轻薄本；处理器：酷睿 Ultra 7 258V；显卡：Intel Arc 140V 核显；内存：16GB；存储：1TB SSD', 1),
('Alienware m16 R2', (select category_id from categories where category_name = '电脑' limit 1), (select brand_id from brands where brand_name = '戴尔' limit 1), 17999, '类型：游戏本；处理器：酷睿 Ultra 9-185H；显卡：RTX 4070；内存：32GB；存储：1TB SSD', 1),
('Latitude 5440', (select category_id from categories where category_name = '电脑' limit 1), (select brand_id from brands where brand_name = '戴尔' limit 1), 7299, '类型：商务本；处理器：酷睿 i7 1355U；显卡：集成显卡；内存：16GB；存储：1TB SSD', 1),
('Latitude 5530', (select category_id from categories where category_name = '电脑' limit 1), (select brand_id from brands where brand_name = '戴尔' limit 1), 5699, '类型：商务本；处理器：酷睿 i7 1255U；显卡：集成显卡；内存：32GB；存储：512GB SSD', 1),
('XPS14', (select category_id from categories where category_name = '电脑' limit 1), (select brand_id from brands where brand_name = '戴尔' limit 1), 25999, '类型：商务本；处理器：酷睿 UltraX7 358H；显卡：ARC B390；内存：32GB；存储：1TB SSD', 1),
('XPS16', (select category_id from categories where category_name = '电脑' limit 1), (select brand_id from brands where brand_name = '戴尔' limit 1), 26999, '类型：商务本；处理器：酷睿 UltraX7 358H；显卡：ARC B390；内存：32GB；存储：1TB SSD', 1),
('星 Book Pro 14', (select category_id from categories where category_name = '电脑' limit 1), (select brand_id from brands where brand_name = '惠普' limit 1), 5999, '类型：轻薄本；处理器：酷睿 Ultra 5 225H；显卡：Intel Arc 130T 核显；内存：16GB；存储：1TB SSD', 1),
('暗影精灵 10', (select category_id from categories where category_name = '电脑' limit 1), (select brand_id from brands where brand_name = '惠普' limit 1), 8299, '类型：游戏本；处理器：酷睿 i7-14650HX；显卡：RTX 4060；内存：16GB；存储：1TB SSD', 1),
('暗影精灵11', (select category_id from categories where category_name = '电脑' limit 1), (select brand_id from brands where brand_name = '惠普' limit 1), 9999, '类型：游戏本；处理器：酷睿 i9 14900HX；显卡：RTX 5070；内存：32GB；存储：1TB SSD', 1),
('战66 2025 酷睿Ultra版 16英寸', (select category_id from categories where category_name = '电脑' limit 1), (select brand_id from brands where brand_name = '惠普' limit 1), 6199, '类型：商务本；处理器：酷睿 Ultra 7 155H；显卡：集成显卡；内存：32GB；存储：1TB SSD', 1),
('灵耀 14', (select category_id from categories where category_name = '电脑' limit 1), (select brand_id from brands where brand_name = '华硕' limit 1), 7999, '类型：轻薄本；处理器：酷睿 Ultra 7 155H；显卡：Intel Arc 核显；内存：32GB；存储：1TB SSD', 1),
('ROG 魔霸新锐 2025', (select category_id from categories where category_name = '电脑' limit 1), (select brand_id from brands where brand_name = '华硕' limit 1), 12999, '类型：游戏本；处理器：锐龙 9 8940HX；显卡：RTX 5070；内存：32GB；存储：1TB SSD', 1),
('ProArt创13 2026', (select category_id from categories where category_name = '电脑' limit 1), (select brand_id from brands where brand_name = '华硕' limit 1), 14999, '类型：创作本；处理器：锐龙 AI Max+ 395；显卡：Radeon 8060S；内存：64GB；存储：1TB SSD', 1),
('无畏14 2024', (select category_id from categories where category_name = '电脑' limit 1), (select brand_id from brands where brand_name = '华硕' limit 1), 3799, '类型：轻薄本；处理器：酷睿 i5 13500H；显卡：集成显卡；内存：16GB；存储：1TB SSD', 1),
('天选4 13代酷睿版', (select category_id from categories where category_name = '电脑' limit 1), (select brand_id from brands where brand_name = '华硕' limit 1), 10499, '类型：游戏本；处理器：酷睿 i9 13900H；显卡：RTX 4060；内存：16GB；存储：1TB SSD', 1),
('ROG 幻16Air 酷睿版', (select category_id from categories where category_name = '电脑' limit 1), (select brand_id from brands where brand_name = '华硕' limit 1), 13499, '类型：游戏本；处理器：酷睿 Ultra 9 185H；显卡：RTX 4060；内存：32GB；存储：1TB SSD', 1),
('ROG 幻16Air 锐龙AI版', (select category_id from categories where category_name = '电脑' limit 1), (select brand_id from brands where brand_name = '华硕' limit 1), 14999, '类型：游戏本；处理器：Ryzen AI9 HX370；显卡：RTX 4060；内存：32GB；存储：1TB SSD', 1),
('掠夺者 Neo 16', (select category_id from categories where category_name = '电脑' limit 1), (select brand_id from brands where brand_name = '宏碁' limit 1), 11999, '类型：游戏本；处理器：酷睿 i9-14900HX；显卡：RTX 4070；内存：32GB；存储：1TB SSD', 1),
('非凡 Go Pro', (select category_id from categories where category_name = '电脑' limit 1), (select brand_id from brands where brand_name = '宏碁' limit 1), 6999, '类型：轻薄本；处理器：酷睿 Ultra 7 155H；显卡：Intel Arc 核显；内存：32GB；存储：1TB SSD', 1),
('掠夺者·刀锋8', (select category_id from categories where category_name = '电脑' limit 1), (select brand_id from brands where brand_name = '宏碁' limit 1), 19999, '类型：游戏本；处理器：酷睿 Ultra 9 288V；显卡：RTX 5070；内存：32GB；存储：2TB SSD', 1),
('非凡 X14', (select category_id from categories where category_name = '电脑' limit 1), (select brand_id from brands where brand_name = '宏碁' limit 1), 7299, '类型：全能本；处理器：酷睿 i5 13500H；显卡：RTX 4050；内存：16GB；存储：1TB SSD', 1),
('蛟龙 16 Pro', (select category_id from categories where category_name = '电脑' limit 1), (select brand_id from brands where brand_name = '机械革命' limit 1), 8999, '类型：游戏本；处理器：锐龙 9 7945HX；显卡：RTX 4070；内存：32GB；存储：1TB SSD', 1),
('蛟龙15K', (select category_id from categories where category_name = '电脑' limit 1), (select brand_id from brands where brand_name = '机械革命' limit 1), 5699, '类型：游戏本；处理器：Ryzen 7 7735H；显卡：RTX 3050；内存：16GB；存储：512GB SSD', 1),
('无界15X 酷睿版 2024', (select category_id from categories where category_name = '电脑' limit 1), (select brand_id from brands where brand_name = '机械革命' limit 1), 6999, '类型：轻薄本；处理器：酷睿 Ultra 7 155H；显卡：集成显卡；内存：32GB；存储：1TB SSD', 1),
('将星 X15 AT', (select category_id from categories where category_name = '电脑' limit 1), (select brand_id from brands where brand_name = '七彩虹' limit 1), 6999, '类型：游戏本；处理器：酷睿 i7-14650HX；显卡：RTX 4060；内存：16GB；存储：1TB SSD', 1),
('隐星 P16 TA', (select category_id from categories where category_name = '电脑' limit 1), (select brand_id from brands where brand_name = '七彩虹' limit 1), 9999, '类型：游戏本；处理器：酷睿 i9-14900HX；显卡：RTX 4070；内存：32GB；存储：1TB SSD', 1),
('隐星 P16', (select category_id from categories where category_name = '电脑' limit 1), (select brand_id from brands where brand_name = '七彩虹' limit 1), 5999, '类型：游戏本；处理器：酷睿 i7 12650H；显卡：RTX 4060；内存：16GB；存储：512GB SSD', 1),
('E14', (select category_id from categories where category_name = '电脑' limit 1), (select brand_id from brands where brand_name = '七彩虹' limit 1), 3799, '类型：轻薄本；处理器：Ryzen 7 7735HS；显卡：Radeon 680M；内存：32GB；存储：1TB SSD', 1),
('众颜 U6', (select category_id from categories where category_name = '电脑' limit 1), (select brand_id from brands where brand_name = '火影' limit 1), 3999, '类型：轻薄本；处理器：酷睿 i5-12500H；显卡：Intel Iris Xe；内存：16GB；存储：512GB SSD', 1),
('T9 Plus', (select category_id from categories where category_name = '电脑' limit 1), (select brand_id from brands where brand_name = '火影' limit 1), 6499, '类型：游戏本；处理器：酷睿 i7-14650HX；显卡：RTX 4060；内存：16GB；存储：1TB SSD', 1),
('众颜U6 2024', (select category_id from categories where category_name = '电脑' limit 1), (select brand_id from brands where brand_name = '火影' limit 1), 0, '类型：轻薄本；处理器：Ryzen 7 8845HS；显卡：集成显卡；内存：32GB；存储：1TB SSD', 1),
('T9 系列', (select category_id from categories where category_name = '电脑' limit 1), (select brand_id from brands where brand_name = '火影' limit 1), 0, '类型：游戏本；处理器：酷睿 i7；显卡：RTX 系列独显；内存：16GB；存储：1TB SSD', 1),
('MagicBook Pro 16', (select category_id from categories where category_name = '电脑' limit 1), (select brand_id from brands where brand_name = '荣耀' limit 1), 8999, '类型：全能本；处理器：酷睿 Ultra 7 155H；显卡：RTX 4060；内存：32GB；存储：1TB SSD', 1),
('MagicBook Pro 14', (select category_id from categories where category_name = '电脑' limit 1), (select brand_id from brands where brand_name = '荣耀' limit 1), 5999, '类型：轻薄本；处理器：酷睿 Ultra 5 285H；显卡：Intel Arc 140T核显；内存：16GB；存储：1TB SSD', 1),
('MagicBook Pro 16 2026', (select category_id from categories where category_name = '电脑' limit 1), (select brand_id from brands where brand_name = '荣耀' limit 1), 10999, '类型：轻薄本；处理器：酷睿 Ultra X9 388H；显卡：集成显卡；内存：32GB；存储：1TB SSD', 1),
('MagicBook Pro 16 HUNTER版', (select category_id from categories where category_name = '电脑' limit 1), (select brand_id from brands where brand_name = '荣耀' limit 1), 0, '类型：全能本；处理器：酷睿 Ultra 7 155H；显卡：RTX 4060；内存：32GB；存储：1TB SSD', 1);

-- 插入电脑图片
insert into product_images (product_id, image_url, image_name, image_type, is_main, upload_time, status)
values
((select product_id from products where product_name = 'MacBook Air 13 (M3)' limit 1), 'computer_image/MacBook Air M3.png', 'MacBook Air M3.png', 'png', 1, now(), 1),
((select product_id from products where product_name = 'MacBook Pro 14 (M4 Pro)' limit 1), 'computer_image/MacBook Pro.jpg', 'MacBook Pro.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = 'MacBook Air 13 (M4)' limit 1), 'computer_image/MacBook Air M3.png', 'MacBook Air M3.png', 'png', 1, now(), 1),
((select product_id from products where product_name = 'MacBook Pro 13 (M2)' limit 1), 'computer_image/MacBook Pro.jpg', 'MacBook Pro.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = 'ThinkPad X1 Carbon' limit 1), 'computer_image/ThinkPad X1 Carbon.jpg', 'ThinkPad X1 Carbon.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = '拯救者 Y7000P 2025' limit 1), 'computer_image/拯救者 Y7000P 2025.jpg', '拯救者 Y7000P 2025.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = '拯救者R9000P 2025 AI元启' limit 1), 'computer_image/拯救者R9000P 2025 AI元启.jpg', '拯救者R9000P 2025 AI元启.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = '拯救者Y7000P 2025 AI元启' limit 1), 'computer_image/拯救者Y7000P 2025 AI元启.jpg', '拯救者Y7000P 2025 AI元启.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = '小新Pro16GT 2026 AI元启版' limit 1), 'computer_image/小新Pro16GT 2026 AI元启版.jpg', '小新Pro16GT 2026 AI元启版.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = 'MateBook X Pro' limit 1), 'computer_image/MateBook X Pro.png', 'MateBook X Pro.png', 'png', 1, now(), 1),
((select product_id from products where product_name = 'MateBook 14' limit 1), 'computer_image/MateBook 14.png', 'MateBook 14.png', 'png', 1, now(), 1),
((select product_id from products where product_name = 'MateBook Fold 非凡大师' limit 1), 'computer_image/MateBook Fold 非凡大师.png', 'MateBook Fold 非凡大师.png', 'png', 1, now(), 1),
((select product_id from products where product_name = 'MateBook Pro' limit 1), 'computer_image/MateBook Pro.png', 'MateBook Pro.png', 'png', 1, now(), 1),
((select product_id from products where product_name = 'XPS 13 2024' limit 1), 'computer_image/XPS 13 2024.jpg', 'XPS 13 2024.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = 'Alienware m16 R2' limit 1), 'computer_image/Alienware m16 R2.jpg', 'Alienware m16 R2.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = 'Latitude 5440' limit 1), 'computer_image/Latitude 5440.png', 'Latitude 5440.png', 'png', 1, now(), 1),
((select product_id from products where product_name = 'Latitude 5530' limit 1), 'computer_image/Latitude 5530.png', 'Latitude 5530.png', 'png', 1, now(), 1),
((select product_id from products where product_name = 'XPS14' limit 1), 'computer_image/XPS14.png', 'XPS14.png', 'png', 1, now(), 1),
((select product_id from products where product_name = 'XPS16' limit 1), 'computer_image/XPS16.png', 'XPS16.png', 'png', 1, now(), 1),
((select product_id from products where product_name = '星 Book Pro 14' limit 1), 'computer_image/星 Book Pro 14.png', '星 Book Pro 14.png', 'png', 1, now(), 1),
((select product_id from products where product_name = '暗影精灵 10' limit 1), 'computer_image/暗影精灵 10.jpg', '暗影精灵 10.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = '暗影精灵11' limit 1), 'computer_image/暗影精灵11.jpg', '暗影精灵11.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = '战66 2025 酷睿Ultra版 16英寸' limit 1), 'computer_image/战66 2025 酷睿Ultra版 16英寸.jpg', '战66 2025 酷睿Ultra版 16英寸.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = '灵耀 14' limit 1), 'computer_image/灵耀 14.jpg', '灵耀 14.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = 'ROG 魔霸新锐 2025' limit 1), 'computer_image/ROG 魔霸新锐2025.png', 'ROG 魔霸新锐2025.png', 'png', 1, now(), 1),
((select product_id from products where product_name = 'ProArt创13 2026' limit 1), 'computer_image/ProArt创13 2026.jpg', 'ProArt创13 2026.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = '无畏14 2024' limit 1), 'computer_image/无畏14 2024.png', '无畏14 2024.png', 'png', 1, now(), 1),
((select product_id from products where product_name = '天选4 13代酷睿版' limit 1), 'computer_image/天选4 13代酷睿版.png', '天选4 13代酷睿版.png', 'png', 1, now(), 1),
((select product_id from products where product_name = 'ROG 幻16Air 酷睿版' limit 1), 'computer_image/ROG 幻16Air 酷睿版.jpg', 'ROG 幻16Air 酷睿版.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = 'ROG 幻16Air 锐龙AI版' limit 1), 'computer_image/ROG 幻16Air 锐龙AI版.jpg', 'ROG 幻16Air 锐龙AI版.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = '掠夺者 Neo 16' limit 1), 'computer_image/掠夺者 Neo 16.jpg', '掠夺者 Neo 16.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = '非凡 Go Pro' limit 1), 'computer_image/非凡 Go Pro.jpg', '非凡 Go Pro.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = '掠夺者·刀锋8' limit 1), 'computer_image/掠夺者·刀锋8.jpg', '掠夺者·刀锋8.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = '非凡 X14' limit 1), 'computer_image/非凡 X14.jpg', '非凡 X14.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = '蛟龙 16 Pro' limit 1), 'computer_image/蛟龙 16 Pro.png', '蛟龙 16 Pro.png', 'png', 1, now(), 1),
((select product_id from products where product_name = '蛟龙15K' limit 1), 'computer_image/蛟龙15K.png', '蛟龙15K.png', 'png', 1, now(), 1),
((select product_id from products where product_name = '无界15X 酷睿版 2024' limit 1), 'computer_image/无界15X 酷睿版 2024.png', '无界15X 酷睿版 2024.png', 'png', 1, now(), 1),
((select product_id from products where product_name = '将星 X15 AT' limit 1), 'computer_image/将星 X15 AT.png', '将星 X15 AT.png', 'png', 1, now(), 1),
((select product_id from products where product_name = '隐星 P16 TA' limit 1), 'computer_image/隐星 P16 TA.png', '隐星 P16 TA.png', 'png', 1, now(), 1),
((select product_id from products where product_name = '隐星 P16' limit 1), 'computer_image/隐星 P16.png', '隐星 P16.png', 'png', 1, now(), 1),
((select product_id from products where product_name = 'E14' limit 1), 'computer_image/E14.png', 'E14.png', 'png', 1, now(), 1),
((select product_id from products where product_name = '众颜 U6' limit 1), 'computer_image/众颜 U6.jpg', '众颜 U6.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = 'T9 Plus' limit 1), 'computer_image/T9 Plus.jpg', 'T9 Plus.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = '众颜U6 2024' limit 1), 'computer_image/众颜U6 2024.jpg', '众颜U6 2024.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = 'T9 系列' limit 1), 'computer_image/T9 系列.jpg', 'T9 系列.jpg', 'jpg', 1, now(), 1),
((select product_id from products where product_name = 'MagicBook Pro 16' limit 1), 'computer_image/MagicBook Pro 16.png', 'MagicBook Pro 16.png', 'png', 1, now(), 1),
((select product_id from products where product_name = 'MagicBook Pro 14' limit 1), 'computer_image/MagicBook Pro 14.png', 'MagicBook Pro 14.png', 'png', 1, now(), 1),
((select product_id from products where product_name = 'MagicBook Pro 16 2026' limit 1), 'computer_image/MagicBook Pro 16 2026.png', 'MagicBook Pro 16 2026.png', 'png', 1, now(), 1),
((select product_id from products where product_name = 'MagicBook Pro 16 HUNTER版' limit 1), 'computer_image/MagicBook Pro 16.png', 'MagicBook Pro 16.png', 'png', 1, now(), 1);

-- 添加用户
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
-- 添加管理员
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

-- 查询索引
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

-- 添加商品评论
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

-- 查询用户
select user_id,username,password,phone,email,gender,status,register_time
from users
where username= ? or email=?
limit 1;

-- 根据user_id查询用户
select user_id,username,password,phone,email,gender,status,register_time
from users
where user_id= ?
limit 1;

-- 判断用户信息是否有重复
select user_id,username,phone,email
from users
where username=? or phone= ? or email=?
limit 1;

-- 获取所有用户列表
select *
from users
order by user_id;

-- 创建用户
insert into users
values(?,?,?,?,?,now());

-- 更改用户信息
update users
set username=?,phone=?,email=?,password=?,status=?,gender=?
where user_id=?;

-- 重置密码
update users
set password=?
where user_id=?;

-- 更改用户状态
update users
set status=?
where user_id=?;

-- 删除用户
delete from users
where user_id=?;

-- 管理员登录
select * from admin
where admin_account=?
limit 1;

-- 根据id查找产品
select *
from products
where product_id = ?
limit 1;

-- 前台产品列表
select
  p.product_id,
  p.product_name,
  p.price,
  p.description,
  p.view_count,
  p.status,
  c.category_id,
  c.category_name,
  b.brand_id,
  b.brand_name,
  b.logo as brand_logo,
  pi.image_url
from products p
inner join categories c on c.category_id = p.category_id
inner join brands b on b.brand_id = p.brand_id
left join (
  select product_id, min(image_url) as image_url
  from product_images
  where is_main = 1 and status = 1
  group by product_id
) pi on pi.product_id = p.product_id
where p.status = 1 and c.status = 1 and b.status = 1
and (p.product_name like ? or p.description like ? or b.brand_name like ?)
and p.category_id = ?
and p.brand_id in (?, ?, ...)
and p.price >= ?
and p.price <= ?
order by p.view_count desc, p.product_id asc

-- 后台产品列表
select
  p.product_id,
  p.product_name,
  p.price,
  p.description,
  p.view_count,
  p.status,
  c.category_id,
  c.category_name,
  b.brand_id,
  b.brand_name,
  b.logo as brand_logo,
  pi.image_url
from products p
inner join categories c on c.category_id = p.category_id
inner join brands b on b.brand_id = p.brand_id
left join (
  select product_id, min(image_url) as image_url
  from product_images
  where is_main = 1 and status = 1
  group by product_id
) pi on pi.product_id = p.product_id
where p.category_id = ?
order by p.product_id asc

-- 新增设备
insert into products
 (product_name, category_id, brand_id, price, description, view_count, release_time, status)
values (?, ?, ?, ?, ?, 0, now(), ?)

-- 完整更新设备信息
update products
set product_name = ?, category_id = ?, brand_id = ?, price = ?, description = ?, status = ?
where product_id = ?

-- 切换启用/禁用状态
update products set status = ? where product_id = ?

-- 删除设备
delete from products where product_id = ?

-- 查询分类
select category_id, category_name, description
from categories
where status = 1
order by sort_order asc, category_id asc

-- 查询品牌
select brand_id, brand_name, logo, country
from brands
where status = 1
order by brand_name asc

-- 查询产品图片
select product_id, min(image_url) as image_url
from product_images
where is_main = 1 and status = 1
group by product_id

-- 检查 comments 表是否已有 rating 评分字段
show columns from comments like 'rating';

-- 给 comments 表添加 rating 评分字段
alter table comments add column rating tinyint not null default 5 after content;

-- 检查 favorites 表 favorite_id 是否存在
show columns from favorites like 'favorite_id';

-- 将 favorites.favorite_id 改为自增主键字段
alter table favorites modify favorite_id int not null auto_increment;

-- 查询还没有写入 product_specs 的产品描述，用于初始化配置数据
select p.product_id, p.description from products p where p.description is not null and not exists (select 1 from product_specs ps where ps.product_id = p.product_id);

-- 根据产品描述初始化产品配置，重复配置会忽略
insert ignore into product_specs (product_id, spec_name, spec_value, sort_order, status) values (?, ?, ?, ?, 1);

-- 按用户名或邮箱查询普通用户，用于登录
select user_id, username, password, phone, email, gender, status, register_time from users where username = ? or email = ? limit 1;

-- 按用户编号查询普通用户详情
select user_id, username, password, phone, email, gender, status, register_time from users where user_id = ? limit 1;

-- 检查用户名、手机号、邮箱是否已被占用
select user_id, username, phone, email from users where username = ? or phone = ? or email = ? limit 1;

-- 新增普通用户
insert into users (username, password, phone, email, gender, status, register_time) values (?, ?, ?, ?, ?, ?, now());

-- 修改普通用户基础信息和密码
update users set username = ?, phone = ?, email = ?, gender = ?, password = ?, status = ? where user_id = ?;

-- 重置普通用户密码
update users set password = ? where user_id = ?;

-- 启用或禁用普通用户
update users set status = ? where user_id = ?;

-- 删除普通用户
delete from users where user_id = ?;

-- 按产品编号查询产品基础信息
select product_id, product_name, category_id, brand_id, price, description, view_count, status from products where product_id = ? limit 1;

-- 查询产品所属分类名称，用于判断图片保存到 phone_image 还是 computer_image
select c.category_name from products p left join categories c on p.category_id = c.category_id where p.product_id = ? limit 1;

-- 判断产品是否存在
select product_id from products where product_id = ? limit 1;

-- 查询某分类下的产品
select product_id from products where category_id = ?;

-- 查询某品牌下的产品
select product_id from products where brand_id = ?;

-- 产品详情访问量加一
update products set view_count = view_count + 1 where product_id = ?;

-- 启用或禁用产品
update products set status = ? where product_id = ?;

-- 新增产品
insert into products (product_name, category_id, brand_id, price, description, view_count, release_time, status) values (?, ?, ?, ?, ?, 0, now(), ?);

-- 修改产品基础信息
update products set product_name = ?, category_id = ?, brand_id = ?, price = ?, description = ?, status = ? where product_id = ?;

-- 删除产品
delete from products where product_id = ?;

-- 查询产品图片地址，用于删除产品时清理上传文件
select image_url from product_images where product_id = ?;

-- 查询某产品的全部图片
select image_id, product_id, image_url, image_name, image_type, description, is_main, upload_time, status from product_images where product_id = ? order by is_main desc, image_id asc;

-- 按图片编号查询图片
select * from product_images where image_id = ? limit 1;

-- 将某产品的全部图片取消主图
update product_images set is_main = 0 where product_id = ?;

-- 将某张图片设置为主图并启用
update product_images set is_main = 1, status = 1 where image_id = ?;

-- 新增产品图片
insert into product_images (product_id, image_url, image_name, image_type, description, is_main, upload_time, status) values (?, ?, ?, ?, ?, ?, now(), ?);

-- 修改产品图片信息
update product_images set image_url = ?, image_name = ?, image_type = ?, description = ?, is_main = ?, status = ? where image_id = ?;

-- 删除某产品的全部图片
delete from product_images where product_id = ?;

-- 删除某张产品图片
delete from product_images where image_id = ?;

-- 查询某产品的配置列表
select spec_id, product_id, spec_name, spec_value, sort_order, status from product_specs where product_id = ? order by sort_order asc, spec_id asc;

-- 按配置编号查询配置
select * from product_specs where spec_id = ? limit 1;

-- 新增产品配置
insert into product_specs (product_id, spec_name, spec_value, sort_order, status) values (?, ?, ?, ?, ?);

-- 修改产品配置
update product_specs set spec_name = ?, spec_value = ?, sort_order = ?, status = ? where spec_id = ?;

-- 删除某产品的全部配置
delete from product_specs where product_id = ?;

-- 删除单条产品配置
delete from product_specs where spec_id = ?;

-- 查询分类是否存在
select category_id from categories where category_id = ? limit 1;

-- 查询某分类的子分类
select category_id from categories where parent_id = ?;

-- 查询启用状态的分类列表，供前台筛选使用
select category_id, category_name, parent_id, description, sort_order, icon, status from categories where status = 1 order by sort_order asc, category_id asc;

-- 查询全部分类列表，供后台管理使用
select category_id, category_name, parent_id, description, sort_order, icon, status from categories order by sort_order asc, category_id asc;

-- 按分类编号查询分类
select * from categories where category_id = ? limit 1;

-- 新增分类
insert into categories (category_name, parent_id, description, sort_order, icon, status) values (?, ?, ?, ?, ?, ?);

-- 修改分类
update categories set category_name = ?, parent_id = ?, description = ?, sort_order = ?, icon = ?, status = ? where category_id = ?;

-- 启用或禁用分类
update categories set status = ? where category_id = ?;

-- 删除分类
delete from categories where category_id = ?;

-- 查询品牌是否存在，并取出 logo 地址
select brand_id, logo from brands where brand_id = ? limit 1;

-- 查询启用状态的品牌列表，供前台筛选使用
select brand_id, brand_name, logo, country, website, description, status from brands where status = 1 order by brand_name asc;

-- 查询全部品牌列表，供后台管理使用
select brand_id, brand_name, logo, country, website, description, status from brands order by brand_id asc;

-- 按品牌编号查询品牌
select * from brands where brand_id = ? limit 1;

-- 新增品牌
insert into brands (brand_name, logo, country, website, description, status) values (?, ?, ?, ?, ?, ?);

-- 修改品牌
update brands set brand_name = ?, logo = ?, country = ?, website = ?, description = ?, status = ? where brand_id = ?;

-- 启用或禁用品牌
update brands set status = ? where brand_id = ?;

-- 删除品牌
delete from brands where brand_id = ?;

-- 查询某产品下的评论编号，用于删除产品时清理评论
select comment_id from comments where product_id = ?;

-- 查询评论是否存在
select comment_id from comments where comment_id = ? limit 1;

-- 查询某用户的评论编号，用于删除用户时清理评论
select comment_id from comments where user_id = ?;

-- 新增评论
insert into comments (user_id, product_id, content, rating, comment_time, like_count, reply_count, status) values (?, ?, ?, ?, now(), 0, 0, 1);

-- 修改自己的评论
update comments set content = ?, rating = ?, comment_time = now() where comment_id = ? and user_id = ?;

-- 启用、隐藏评论
update comments set status = ? where comment_id = ?;

-- 管理员删除评论
delete from comments where comment_id = ?;

-- 用户删除自己的评论
delete from comments where comment_id = ? and user_id = ?;

-- 管理员登录时按账号查询管理员
select admin_id, admin_account, admin_password, email, role, status from admin where admin_account = ? limit 1;

-- 查询所有普通管理员
select admin_id, admin_account, email, role, status from admin where role = ? order by admin_id asc;

-- 按编号查询普通管理员
select admin_id, admin_account, email, role, status from admin where admin_id = ? and role = ? limit 1;

-- 检查管理员账号是否重复
select admin_id from admin where admin_account=? limit 1;

-- 生成新的管理员编号
select coalesce(max(admin_id), 0) + 1 as next_id from admin;

-- 新增普通管理员
insert into admin (admin_id, admin_account, admin_password, email, role, status) values (?, ?, ?, ?, ?, ?);

-- 启用或禁用普通管理员
update admin set status = ? where admin_id = ? and role = ?;

-- 删除普通管理员
delete from admin where admin_id = ? and role = ?;

-- 删除某产品的收藏记录
delete from favorites where product_id = ?;

-- 删除某用户的收藏记录
delete from favorites where user_id = ?;

-- 删除某用户对某产品的收藏
delete from favorites where user_id = ? and product_id = ?;

-- 新增收藏，已收藏则恢复并更新时间
insert into favorites (user_id, product_id, favorite_time, status) values (?, ?, now(), 1) on duplicate key update favorite_time = now(), status = 1;

-- 没有主图时自动设置第一张启用图片为主图
update product_images pi
inner join (
  select product_id, min(image_id) as image_id
  from product_images
  where status = 1
  group by product_id
  having sum(case when is_main = 1 then 1 else 0 end) = 0
) fallback_image on fallback_image.image_id = pi.image_id
set pi.is_main = 1;

-- 开启事务
start transaction;

-- 提交事务
commit;

-- 回滚事务
rollback;

-- 删除产品对应的管理员产品关联
delete from admin_product where product_id = ?;

-- 删除分类对应的管理员分类关联
delete from admin_category where category_id = ?;

-- 删除品牌对应的管理员品牌关联
delete from admin_brand where brand_id = ?;

-- 删除评论对应的管理员评论关联
delete from admin_comment where comment_id = ?;

-- 根据用户编号检查用户是否存在
select user_id from users where user_id = ? limit 1;

-- 删除普通管理员对应的分类关联
delete from admin_category where admin_id = ?;

-- 删除普通管理员对应的品牌关联
delete from admin_brand where admin_id = ?;

-- 删除普通管理员对应的产品关联
delete from admin_product where admin_id = ?;

-- 删除普通管理员对应的评论关联
delete from admin_comment where admin_id = ?;

-- 检查接口健康状态
select 1 as ok;

-- 查询指定产品的启用评论
select c.comment_id, c.user_id, u.username, c.product_id, p.product_name, c.content,
       c.rating, c.comment_time, c.like_count, c.reply_count, c.status
from comments c
inner join users u on u.user_id = c.user_id
inner join products p on p.product_id = c.product_id
where c.product_id = ? and c.status = 1
order by c.comment_time desc, c.comment_id desc;

-- 查询我的收藏列表
select p.product_id, p.product_name, p.price, p.description, p.view_count, p.release_time,
       p.status, c.category_id, c.category_name, b.brand_id, b.brand_name,
       b.logo as brand_logo, pi.image_url, f.favorite_time, 1 as is_favorite
from favorites f
inner join products p on p.product_id = f.product_id
inner join categories c on c.category_id = p.category_id
inner join brands b on b.brand_id = p.brand_id
left join (
  select product_id, coalesce(min(case when is_main = 1 then image_url end), min(image_url)) as image_url
  from product_images
  where status = 1
  group by product_id
) pi on pi.product_id = p.product_id
where f.user_id = ? and f.status = 1
order by f.favorite_time desc;

-- 管理员查询用户列表
select user_id, username, phone, email, gender, status, register_time
from users
order by user_id asc;

-- 批量删除管理员评论关联
delete from admin_comment where comment_id in (?, ?, ?);

-- 批量删除评论
delete from comments where comment_id in (?, ?, ?);

-- 修改普通管理员时检查账号是否重复
select admin_id from admin where admin_account = ? and admin_id <> ? limit 1;

-- 修改普通管理员信息：不改密码
update admin set admin_account = ?, email = ?, status = ? where admin_id = ? and role = ?;

-- 修改普通管理员信息：同时修改密码
update admin set admin_account = ?, email = ?, status = ?, admin_password = ? where admin_id = ? and role = ?;
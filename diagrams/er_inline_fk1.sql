-- 模块一：用户与宿舍管理模块 ER图 SQL代码

CREATE TABLE `dorm` (
    `id` VARCHAR(24) PRIMARY KEY,
    `dorm_number` VARCHAR(50),
    `notice` TEXT,
    `creator_id` VARCHAR(24)
);

CREATE TABLE `user` (
    `id` VARCHAR(24) PRIMARY KEY,
    `openid` VARCHAR(100),
    `nickname` VARCHAR(50),
    `avatar` VARCHAR(255),
    `dorm_id` VARCHAR(24),
    `role` VARCHAR(20),
    FOREIGN KEY (`dorm_id`) REFERENCES `dorm`(`id`)
);

CREATE TABLE `dorm_member` (
    `dorm_id` VARCHAR(24),
    `user_id` VARCHAR(24),
    PRIMARY KEY (`dorm_id`, `user_id`),
    FOREIGN KEY (`dorm_id`) REFERENCES `dorm`(`id`),
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`)
);

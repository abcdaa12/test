-- 模块五：消息与公告模块 ER图 SQL代码

CREATE TABLE `user` (
    `id` VARCHAR(24) PRIMARY KEY,
    `nickname` VARCHAR(50)
);

CREATE TABLE `message` (
    `id` VARCHAR(24) PRIMARY KEY,
    `user_id` VARCHAR(24),
    `type` VARCHAR(20),
    `content` TEXT,
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`)
);

CREATE TABLE `announce` (
    `id` VARCHAR(24) PRIMARY KEY,
    `dorm_id` VARCHAR(24),
    `title` VARCHAR(100),
    `content` TEXT,
    `creator_id` VARCHAR(24),
    FOREIGN KEY (`creator_id`) REFERENCES `user`(`id`)
);

CREATE TABLE `announce_read` (
    `announce_id` VARCHAR(24),
    `user_id` VARCHAR(24),
    PRIMARY KEY (`announce_id`, `user_id`),
    FOREIGN KEY (`announce_id`) REFERENCES `announce`(`id`),
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`)
);

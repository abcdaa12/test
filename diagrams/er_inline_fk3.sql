-- 模块三：投票决策模块 ER图 SQL代码

CREATE TABLE `user` (
    `id` VARCHAR(24) PRIMARY KEY,
    `nickname` VARCHAR(50)
);

CREATE TABLE `decision` (
    `id` VARCHAR(24) PRIMARY KEY,
    `dorm_id` VARCHAR(24),
    `title` VARCHAR(100),
    `deadline` DATETIME,
    `creator_id` VARCHAR(24),
    FOREIGN KEY (`creator_id`) REFERENCES `user`(`id`)
);

CREATE TABLE `decision_option` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `decision_id` VARCHAR(24),
    `label` VARCHAR(100),
    `count` INT,
    FOREIGN KEY (`decision_id`) REFERENCES `decision`(`id`)
);

CREATE TABLE `decision_voter` (
    `decision_id` VARCHAR(24),
    `user_id` VARCHAR(24),
    `option_id` INT,
    PRIMARY KEY (`decision_id`, `user_id`),
    FOREIGN KEY (`decision_id`) REFERENCES `decision`(`id`),
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`),
    FOREIGN KEY (`option_id`) REFERENCES `decision_option`(`id`)
);

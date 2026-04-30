-- 模块四：排班管理模块 ER图 SQL代码

CREATE TABLE `user` (
    `id` VARCHAR(24) PRIMARY KEY,
    `nickname` VARCHAR(50)
);

CREATE TABLE `schedule` (
    `id` VARCHAR(24) PRIMARY KEY,
    `dorm_id` VARCHAR(24),
    `week_label` VARCHAR(50)
);

CREATE TABLE `schedule_item` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `schedule_id` VARCHAR(24),
    `duty_date` DATE,
    `user_id` VARCHAR(24),
    FOREIGN KEY (`schedule_id`) REFERENCES `schedule`(`id`),
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`)
);

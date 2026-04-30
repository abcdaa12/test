-- 模块二：财务与费用分摊模块 ER图 SQL代码

CREATE TABLE `user` (
    `id` VARCHAR(24) PRIMARY KEY,
    `nickname` VARCHAR(50)
);

CREATE TABLE `finance` (
    `id` VARCHAR(24) PRIMARY KEY,
    `dorm_id` VARCHAR(24),
    `title` VARCHAR(100),
    `amount` DECIMAL(10,2),
    `creator_id` VARCHAR(24),
    FOREIGN KEY (`creator_id`) REFERENCES `user`(`id`)
);

CREATE TABLE `finance_payee` (
    `finance_id` VARCHAR(24),
    `user_id` VARCHAR(24),
    PRIMARY KEY (`finance_id`, `user_id`),
    FOREIGN KEY (`finance_id`) REFERENCES `finance`(`id`),
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`)
);

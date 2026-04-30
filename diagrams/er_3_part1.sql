-- ==========================================
-- 局部 ER 图一：个人与财务模块
-- 包含：用户(user)、财务(finance)、待办(todo)、消息(message)
-- ==========================================

CREATE TABLE `user` (
    `id` VARCHAR(24) PRIMARY KEY COMMENT '用户ID',
    `openid` VARCHAR(100) COMMENT '微信openid',
    `nickname` VARCHAR(50) COMMENT '昵称',
    `dorm_id` VARCHAR(24) COMMENT '宿舍ID'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户';

CREATE TABLE `finance` (
    `id` VARCHAR(24) PRIMARY KEY COMMENT '财务记录ID',
    `dorm_id` VARCHAR(24) COMMENT '宿舍ID',
    `title` VARCHAR(100) COMMENT '标题',
    `amount` DECIMAL(10,2) COMMENT '金额',
    `creator_id` VARCHAR(24) COMMENT '发起人ID',
    CONSTRAINT `fk_finance_creator_user`
        FOREIGN KEY (`creator_id`) REFERENCES `user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='财务';

CREATE TABLE `finance_payee` (
    `finance_id` VARCHAR(24) COMMENT '财务记录ID',
    `user_id` VARCHAR(24) COMMENT '付款人ID',
    PRIMARY KEY (`finance_id`, `user_id`),
    CONSTRAINT `fk_finpayee_finance`
        FOREIGN KEY (`finance_id`) REFERENCES `finance`(`id`),
    CONSTRAINT `fk_finpayee_user`
        FOREIGN KEY (`user_id`) REFERENCES `user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='财务-付款人';

CREATE TABLE `todo` (
    `id` VARCHAR(24) PRIMARY KEY COMMENT '待办ID',
    `user_id` VARCHAR(24) COMMENT '用户ID',
    `content` VARCHAR(255) COMMENT '待办内容',
    CONSTRAINT `fk_todo_user`
        FOREIGN KEY (`user_id`) REFERENCES `user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='待办';

CREATE TABLE `message` (
    `id` VARCHAR(24) PRIMARY KEY COMMENT '消息ID',
    `user_id` VARCHAR(24) COMMENT '用户ID',
    `type` VARCHAR(20) COMMENT '消息类型',
    `content` TEXT COMMENT '消息内容',
    CONSTRAINT `fk_message_user`
        FOREIGN KEY (`user_id`) REFERENCES `user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='消息';
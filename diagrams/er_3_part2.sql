-- ==========================================
-- 局部 ER 图二：宿舍与排班公告模块
-- 包含：宿舍(dorm)、用户(user)、排班(schedule)、公告(announce)
-- ==========================================

CREATE TABLE `dorm` (
    `id` VARCHAR(24) PRIMARY KEY COMMENT '宿舍ID',
    `dorm_number` VARCHAR(50) COMMENT '宿舍号/寝室号',
    `notice` TEXT COMMENT '宿舍通知/公告栏',
    `creator_id` VARCHAR(24) COMMENT '创建者ID'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='宿舍';

CREATE TABLE `user` (
    `id` VARCHAR(24) PRIMARY KEY COMMENT '用户ID',
    `nickname` VARCHAR(50) COMMENT '昵称',
    `role` VARCHAR(20) COMMENT '角色',
    `dorm_id` VARCHAR(24) COMMENT '宿舍ID',
    CONSTRAINT `fk_user_dorm`
        FOREIGN KEY (`dorm_id`) REFERENCES `dorm`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户';

CREATE TABLE `schedule` (
    `id` VARCHAR(24) PRIMARY KEY COMMENT '排班表ID',
    `dorm_id` VARCHAR(24) COMMENT '宿舍ID',
    `week_label` VARCHAR(50) COMMENT '周标签/周期标识',
    CONSTRAINT `fk_schedule_dorm`
        FOREIGN KEY (`dorm_id`) REFERENCES `dorm`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='排班';

CREATE TABLE `schedule_item` (
    `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '排班项ID',
    `schedule_id` VARCHAR(24) COMMENT '排班表ID',
    `duty_date` DATE COMMENT '值日日期',
    `user_id` VARCHAR(24) COMMENT '值日成员ID',
    CONSTRAINT `fk_schedule_item_schedule`
        FOREIGN KEY (`schedule_id`) REFERENCES `schedule`(`id`),
    CONSTRAINT `fk_schedule_item_user`
        FOREIGN KEY (`user_id`) REFERENCES `user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='排班明细';

CREATE TABLE `announce` (
    `id` VARCHAR(24) PRIMARY KEY COMMENT '公告ID',
    `dorm_id` VARCHAR(24) COMMENT '宿舍ID',
    `title` VARCHAR(100) COMMENT '公告标题',
    `content` TEXT COMMENT '公告内容',
    `creator_id` VARCHAR(24) COMMENT '发布者ID',
    CONSTRAINT `fk_announce_dorm`
        FOREIGN KEY (`dorm_id`) REFERENCES `dorm`(`id`),
    CONSTRAINT `fk_announce_creator_user`
        FOREIGN KEY (`creator_id`) REFERENCES `user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='公告';

CREATE TABLE `announce_read` (
    `announce_id` VARCHAR(24) COMMENT '公告ID',
    `user_id` VARCHAR(24) COMMENT '用户ID',
    PRIMARY KEY (`announce_id`, `user_id`),
    CONSTRAINT `fk_announce_read_announce`
        FOREIGN KEY (`announce_id`) REFERENCES `announce`(`id`),
    CONSTRAINT `fk_announce_read_user`
        FOREIGN KEY (`user_id`) REFERENCES `user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='公告已读';
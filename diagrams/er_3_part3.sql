-- ==========================================
-- 局部 ER 图三：投票决策模块
-- 包含：宿舍(dorm)、用户(user)、投票(decision)
-- ==========================================

CREATE TABLE `dorm` (
    `id` VARCHAR(24) PRIMARY KEY COMMENT '宿舍ID',
    `dorm_number` VARCHAR(50) COMMENT '宿舍号/寝室号'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='宿舍';

CREATE TABLE `user` (
    `id` VARCHAR(24) PRIMARY KEY COMMENT '用户ID',
    `nickname` VARCHAR(50) COMMENT '昵称',
    `dorm_id` VARCHAR(24) COMMENT '宿舍ID',
    CONSTRAINT `fk_user_dorm`
        FOREIGN KEY (`dorm_id`) REFERENCES `dorm`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户';

CREATE TABLE `decision` (
    `id` VARCHAR(24) PRIMARY KEY COMMENT '投票ID',
    `dorm_id` VARCHAR(24) COMMENT '宿舍ID',
    `title` VARCHAR(100) COMMENT '投票标题',
    `deadline` DATETIME COMMENT '截止时间',
    `creator_id` VARCHAR(24) COMMENT '发起人ID',
    CONSTRAINT `fk_decision_dorm`
        FOREIGN KEY (`dorm_id`) REFERENCES `dorm`(`id`),
    CONSTRAINT `fk_decision_creator_user`
        FOREIGN KEY (`creator_id`) REFERENCES `user`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='投票决策';

CREATE TABLE `decision_option` (
    `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '选项ID',
    `decision_id` VARCHAR(24) COMMENT '投票ID',
    `label` VARCHAR(100) COMMENT '选项内容',
    `count` INT COMMENT '票数',
    CONSTRAINT `fk_decision_option_decision`
        FOREIGN KEY (`decision_id`) REFERENCES `decision`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='投票选项';

CREATE TABLE `decision_voter` (
    `decision_id` VARCHAR(24) COMMENT '投票ID',
    `user_id` VARCHAR(24) COMMENT '投票人ID',
    `option_id` INT COMMENT '所选选项ID',
    PRIMARY KEY (`decision_id`, `user_id`),
    CONSTRAINT `fk_decision_voter_decision`
        FOREIGN KEY (`decision_id`) REFERENCES `decision`(`id`),
    CONSTRAINT `fk_decision_voter_user`
        FOREIGN KEY (`user_id`) REFERENCES `user`(`id`),
    CONSTRAINT `fk_decision_voter_option`
        FOREIGN KEY (`option_id`) REFERENCES `decision_option`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='投票记录';
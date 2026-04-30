-- ==========================================
-- 总 ER 图：综合模块 (全中文表名与字段名)
-- 包含：宿舍、用户、财务、待办、消息、排班、公告、投票
-- ==========================================

CREATE TABLE `宿舍` (
    `编号` VARCHAR(24) PRIMARY KEY,
    `宿舍号` VARCHAR(50),
    `须知` TEXT,
    `创建人编号` VARCHAR(24)
);

CREATE TABLE `用户` (
    `编号` VARCHAR(24) PRIMARY KEY,
    `开放标识` VARCHAR(100),
    `昵称` VARCHAR(50),
    `角色` VARCHAR(20),
    `宿舍编号` VARCHAR(24),
    FOREIGN KEY (`宿舍编号`) REFERENCES `宿舍` (`编号`)
);

CREATE TABLE `财务` (
    `编号` VARCHAR(24) PRIMARY KEY,
    `宿舍编号` VARCHAR(24),
    `标题` VARCHAR(100),
    `金额` DECIMAL(10, 2),
    `创建人编号` VARCHAR(24),
    FOREIGN KEY (`创建人编号`) REFERENCES `用户` (`编号`)
);

CREATE TABLE `财务收款人` (
    `财务编号` VARCHAR(24),
    `用户编号` VARCHAR(24),
    PRIMARY KEY (`财务编号`, `用户编号`),
    FOREIGN KEY (`财务编号`) REFERENCES `财务` (`编号`),
    FOREIGN KEY (`用户编号`) REFERENCES `用户` (`编号`)
);

CREATE TABLE `待办事项` (
    `编号` VARCHAR(24) PRIMARY KEY,
    `用户编号` VARCHAR(24),
    `内容` VARCHAR(255),
    FOREIGN KEY (`用户编号`) REFERENCES `用户` (`编号`)
);

CREATE TABLE `消息` (
    `编号` VARCHAR(24) PRIMARY KEY,
    `用户编号` VARCHAR(24),
    `类型` VARCHAR(20),
    `内容` TEXT,
    FOREIGN KEY (`用户编号`) REFERENCES `用户` (`编号`)
);

CREATE TABLE `排班` (
    `编号` VARCHAR(24) PRIMARY KEY,
    `宿舍编号` VARCHAR(24),
    `周次` VARCHAR(50),
    FOREIGN KEY (`宿舍编号`) REFERENCES `宿舍` (`编号`)
);

CREATE TABLE `排班明细` (
    `编号` INT PRIMARY KEY AUTO_INCREMENT,
    `排班编号` VARCHAR(24),
    `值班日期` DATE,
    `用户编号` VARCHAR(24),
    FOREIGN KEY (`排班编号`) REFERENCES `排班` (`编号`),
    FOREIGN KEY (`用户编号`) REFERENCES `用户` (`编号`)
);

CREATE TABLE `公告` (
    `编号` VARCHAR(24) PRIMARY KEY,
    `宿舍编号` VARCHAR(24),
    `标题` VARCHAR(100),
    `内容` TEXT,
    `创建人编号` VARCHAR(24),
    FOREIGN KEY (`宿舍编号`) REFERENCES `宿舍` (`编号`),
    FOREIGN KEY (`创建人编号`) REFERENCES `用户` (`编号`)
);

CREATE TABLE `公告已读记录` (
    `公告编号` VARCHAR(24),
    `用户编号` VARCHAR(24),
    PRIMARY KEY (`公告编号`, `用户编号`),
    FOREIGN KEY (`公告编号`) REFERENCES `公告` (`编号`),
    FOREIGN KEY (`用户编号`) REFERENCES `用户` (`编号`)
);

CREATE TABLE `投票决策` (
    `编号` VARCHAR(24) PRIMARY KEY,
    `宿舍编号` VARCHAR(24),
    `标题` VARCHAR(100),
    `截止时间` DATETIME,
    `创建人编号` VARCHAR(24),
    FOREIGN KEY (`宿舍编号`) REFERENCES `宿舍` (`编号`),
    FOREIGN KEY (`创建人编号`) REFERENCES `用户` (`编号`)
);

CREATE TABLE `投票选项` (
    `编号` INT PRIMARY KEY AUTO_INCREMENT,
    `投票编号` VARCHAR(24),
    `选项标签` VARCHAR(100),
    `票数` INT,
    FOREIGN KEY (`投票编号`) REFERENCES `投票决策` (`编号`)
);

CREATE TABLE `投票人记录` (
    `投票编号` VARCHAR(24),
    `用户编号` VARCHAR(24),
    `选项编号` INT,
    PRIMARY KEY (`投票编号`, `用户编号`),
    FOREIGN KEY (`投票编号`) REFERENCES `投票决策` (`编号`),
    FOREIGN KEY (`用户编号`) REFERENCES `用户` (`编号`),
    FOREIGN KEY (`选项编号`) REFERENCES `投票选项` (`编号`)
);
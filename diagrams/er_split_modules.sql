-- ==========================================
-- 模块一：用户与宿舍管理模块 ER图 SQL代码
-- ==========================================
CREATE TABLE `users` (
    `id` VARCHAR(24) PRIMARY KEY COMMENT '用户主键ID',
    `openid` VARCHAR(100) NOT NULL COMMENT '微信openid',
    `nickname` VARCHAR(50) COMMENT '用户昵称',
    `avatar` VARCHAR(255) COMMENT '头像地址',
    `dorm_id` VARCHAR(24) COMMENT '外键：关联宿舍',
    `role` VARCHAR(20) COMMENT '角色：member/leader'
) COMMENT='用户实体表';

CREATE TABLE `dorms` (
    `id` VARCHAR(24) PRIMARY KEY COMMENT '宿舍主键ID',
    `dorm_number` VARCHAR(50) NOT NULL COMMENT '宿舍号',
    `notice` TEXT COMMENT '宿舍公告',
    `creator_id` VARCHAR(24) COMMENT '创建者ID'
) COMMENT='宿舍实体表';

-- 用户与宿舍的多对多关联（表示成员列表）
CREATE TABLE `dorm_members` (
    `dorm_id` VARCHAR(24) COMMENT '关联宿舍ID',
    `user_id` VARCHAR(24) COMMENT '关联用户ID',
    PRIMARY KEY (`dorm_id`, `user_id`)
) COMMENT='宿舍成员关联表';

-- ==========================================
-- 模块二：财务与费用分摊模块 ER图 SQL代码
-- ==========================================
CREATE TABLE `finances` (
    `id` VARCHAR(24) PRIMARY KEY COMMENT '财务主键ID',
    `dorm_id` VARCHAR(24) NOT NULL COMMENT '外键：关联宿舍',
    `title` VARCHAR(100) NOT NULL COMMENT '收款标题',
    `amount` DECIMAL(10,2) NOT NULL COMMENT '总金额',
    `creator_id` VARCHAR(24) NOT NULL COMMENT '发起人ID'
) COMMENT='财务记录实体表';

-- 财务付款人多对多关联
CREATE TABLE `finance_payees` (
    `finance_id` VARCHAR(24) COMMENT '关联财务记录ID',
    `user_id` VARCHAR(24) COMMENT '关联付款人ID',
    PRIMARY KEY (`finance_id`, `user_id`)
) COMMENT='财务分摊参与人关联表';

-- ==========================================
-- 模块三：投票决策模块 ER图 SQL代码
-- ==========================================
CREATE TABLE `decisions` (
    `id` VARCHAR(24) PRIMARY KEY COMMENT '投票主键ID',
    `dorm_id` VARCHAR(24) NOT NULL COMMENT '外键：关联宿舍',
    `title` VARCHAR(100) NOT NULL COMMENT '投票主题',
    `deadline` DATETIME NOT NULL COMMENT '截止时间',
    `creator_id` VARCHAR(24) NOT NULL COMMENT '发起人ID'
) COMMENT='投票决策实体表';

-- 投票选项（1对N拆分）
CREATE TABLE `decision_options` (
    `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '选项自增ID',
    `decision_id` VARCHAR(24) NOT NULL COMMENT '外键：关联投票ID',
    `label` VARCHAR(100) NOT NULL COMMENT '选项文本',
    `count` INT DEFAULT 0 COMMENT '得票数'
) COMMENT='投票选项实体表';

-- 投票记录（用户与选项的多对多关联）
CREATE TABLE `decision_voters` (
    `decision_id` VARCHAR(24) COMMENT '关联投票ID',
    `user_id` VARCHAR(24) COMMENT '关联用户ID',
    `option_id` INT COMMENT '选择的选项ID',
    PRIMARY KEY (`decision_id`, `user_id`)
) COMMENT='用户投票记录关联表';

-- ==========================================
-- 模块四：排班管理模块 ER图 SQL代码
-- ==========================================
CREATE TABLE `schedules` (
    `id` VARCHAR(24) PRIMARY KEY COMMENT '排班主键ID',
    `dorm_id` VARCHAR(24) NOT NULL COMMENT '外键：关联宿舍',
    `week_label` VARCHAR(50) NOT NULL COMMENT '周期标签'
) COMMENT='排班计划实体表';

-- 排班每日明细（1对N拆分）
CREATE TABLE `schedule_items` (
    `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '明细自增ID',
    `schedule_id` VARCHAR(24) NOT NULL COMMENT '外键：关联排班计划ID',
    `duty_date` DATE NOT NULL COMMENT '值日日期',
    `user_id` VARCHAR(24) COMMENT '关联值日人员ID'
) COMMENT='排班每日明细实体表';

-- ==========================================
-- 模块五：消息与公告模块 ER图 SQL代码
-- ==========================================
CREATE TABLE `messages` (
    `id` VARCHAR(24) PRIMARY KEY COMMENT '消息主键ID',
    `user_id` VARCHAR(24) NOT NULL COMMENT '外键：接收人ID',
    `type` VARCHAR(20) NOT NULL COMMENT '消息类型',
    `content` TEXT NOT NULL COMMENT '消息内容'
) COMMENT='消息通知实体表';

CREATE TABLE `announces` (
    `id` VARCHAR(24) PRIMARY KEY COMMENT '公告主键ID',
    `dorm_id` VARCHAR(24) NOT NULL COMMENT '外键：关联宿舍',
    `title` VARCHAR(100) NOT NULL COMMENT '公告标题',
    `content` TEXT NOT NULL COMMENT '公告内容',
    `creator_id` VARCHAR(24) NOT NULL COMMENT '发布者ID'
) COMMENT='公告实体表';
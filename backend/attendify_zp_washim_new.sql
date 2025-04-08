-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Mar 26, 2025 at 05:55 AM
-- Server version: 8.0.30
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `attendify_zp_washim_new`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `calculate_total_hours` (IN `empId` INT)   BEGIN
    SELECT 
        DATE(in_time) AS date,
        SEC_TO_TIME(SUM(TIMESTAMPDIFF(SECOND, in_time, IFNULL(out_time, in_time)))) AS total_duration,
        CAST(JSON_ARRAYAGG(
            JSON_OBJECT(
                'in_time', in_time,
                'out_time', out_time,
                'duration', IF(out_time IS NOT NULL, 
                    SEC_TO_TIME(TIMESTAMPDIFF(SECOND, in_time, out_time)), 
                    '00:00'
                ),
                'session', session,
                'reason', IFNULL(out_reason, 'N/A')
            )
        ) AS CHAR) AS records 
    FROM `users_attendance`  
    WHERE user_id = empId
    GROUP BY DATE(in_time)
    ORDER BY DATE(in_time) DESC;  
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `MarkAttendance` (IN `p_user_id` INT, IN `p_shift_id` INT, IN `p_attendance_time` DATETIME)   BEGIN
    DECLARE v_shift_start TIME;
    DECLARE v_shift_end TIME;
    DECLARE v_late_checkin_minutes INT;
    DECLARE v_allowed_checkin_end DATETIME;
    DECLARE v_existing_morning DATETIME;
    DECLARE v_existing_afternoon DATETIME;

    -- Fetch shift details
    SELECT shift_start_time, shift_end_time, late_checkin_minutes
    INTO v_shift_start, v_shift_end, v_late_checkin_minutes
    FROM shifts WHERE id = p_shift_id;

    -- Calculate latest allowed check-in time for morning
    SET v_allowed_checkin_end = TIMESTAMP(DATE(p_attendance_time), ADDTIME(v_shift_start, SEC_TO_TIME(v_late_checkin_minutes * 60)));

    -- Check if the user already has morning or afternoon attendance
    SELECT morning_in_time, afternoon_in_time INTO v_existing_morning, v_existing_afternoon
    FROM users_attendance
    WHERE user_id = p_user_id AND shift_id = p_shift_id AND DATE(created_at) = DATE(p_attendance_time);

    -- If already checked in for the day, return
    IF v_existing_morning IS NOT NULL AND v_existing_afternoon IS NOT NULL THEN
        SELECT 'Attendance already marked for the day' AS message;
    ELSE
        -- Case 1: User is on time or within allowed late time
        IF p_attendance_time <= v_allowed_checkin_end THEN
            INSERT INTO users_attendance (user_id, shift_id, morning_in_time)
            VALUES (p_user_id, p_shift_id, p_attendance_time);
            SELECT 'Morning attendance marked' AS message;
        ELSE
            -- Case 2: User is too late, mark as afternoon
            INSERT INTO users_attendance (user_id, shift_id, afternoon_in_time)
            VALUES (p_user_id, p_shift_id, p_attendance_time);
            SELECT 'Late check-in, marked as afternoon attendance' AS message;
        END IF;
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `record_attendance` (IN `p_user_id` INT, IN `p_in_time` DATETIME, IN `p_out_time` DATETIME, IN `p_out_reason` TEXT)   BEGIN
    DECLARE existing_id INT;

    -- Check if there's an open attendance record for today (without an out_time)
    SELECT id INTO existing_id 
    FROM users_attendance 
    WHERE user_id = p_user_id 
    AND DATE(in_time) = DATE(p_in_time) 
    AND out_time IS NULL 
    LIMIT 1;

    IF existing_id IS NOT NULL THEN
        -- If record exists, update the out_time and reason
        IF p_out_time IS NOT NULL THEN
            UPDATE users_attendance 
            SET out_time = p_out_time, out_reason = p_out_reason, updated_at = NOW()
            WHERE id = existing_id;
        ELSE
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Out time is required for updating';
        END IF;
    ELSE
        -- If no open record, insert a new one
        INSERT INTO users_attendance (user_id, in_time, out_time, out_reason, session, created_at)
        VALUES (p_user_id, p_in_time, NULL, NULL, 
                CASE 
                    WHEN HOUR(p_in_time) BETWEEN 6 AND 11 THEN 'Morning'
                    WHEN HOUR(p_in_time) BETWEEN 12 AND 17 THEN 'Afternoon'
                    WHEN HOUR(p_in_time) BETWEEN 18 AND 21 THEN 'Evening'
                    ELSE 'Night'
                END,
                NOW());
    END IF;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `RegisterUser` (IN `p_first_name` VARCHAR(255), IN `p_middle_name` VARCHAR(100), IN `p_last_name` VARCHAR(100), IN `p_mob_no` VARCHAR(100), IN `p_email` VARCHAR(100), IN `p_department_id` INT, IN `p_office_location_id` INT, IN `p_taluka_id` INT, IN `p_village_id` INT, IN `p_cader_id` INT, IN `p_password` VARCHAR(255), IN `p_role_id` INT, IN `p_device_id` VARCHAR(255), IN `p_created_at` TIMESTAMP)   BEGIN
    INSERT INTO users (
        first_name, middle_name, last_name, mob_no, email, 
        department_id, office_location_id, taluka_id, village_id, 
        cader_id, password, role_id, device_id, created_at
    ) VALUES (
        p_first_name, p_middle_name, p_last_name, p_mob_no, p_email, 
        p_department_id, p_office_location_id, p_taluka_id, p_village_id, 
        p_cader_id, p_password, p_role_id, p_device_id, p_created_at
    );
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_calculate_total_hours` (IN `empId` INT)   BEGIN
    SELECT 
        DATE(in_time) AS date,
        SEC_TO_TIME(SUM(TIMESTAMPDIFF(SECOND, in_time, IFNULL(out_time, in_time)))) AS total_duration,
        CAST(JSON_ARRAYAGG(
            JSON_OBJECT(
                'in_time', in_time,
                'out_time', out_time,
                'duration', IF(out_time IS NOT NULL, 
                    SEC_TO_TIME(TIMESTAMPDIFF(SECOND, in_time, out_time)), 
                    '00:00'
                ),
                'session', session,
                'reason', IFNULL(out_reason, 'N/A')
            )
        ) AS CHAR) AS records 
    FROM `users_attendance`  
    WHERE user_id = empId
    GROUP BY DATE(in_time)
    ORDER BY DATE(in_time) DESC;  
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `birthdays`
--

CREATE TABLE `birthdays` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `dept_id` int NOT NULL,
  `birthday_message` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cadres`
--

CREATE TABLE `cadres` (
  `id` int NOT NULL,
  `cadre_name` varchar(255) NOT NULL,
  `cadre_status` enum('active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `cadres`
--

INSERT INTO `cadres` (`id`, `cadre_name`, `cadre_status`, `created_at`, `updated_at`) VALUES
(1, 'peon', 'active', '2025-03-21 07:06:44', NULL),
(2, 'peon', 'active', '2025-03-21 07:06:45', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` int NOT NULL,
  `department_name` varchar(255) NOT NULL,
  `dept_name_marathi` varchar(255) NOT NULL,
  `dept_head_loc` varchar(255) DEFAULT NULL,
  `dept_ps_loc` varchar(255) DEFAULT NULL,
  `department_status` enum('active','inactive') DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `department_name`, `dept_name_marathi`, `dept_head_loc`, `dept_ps_loc`, `department_status`, `created_at`, `updated_at`) VALUES
(2, 'health department', 'आरोग्य विभाग', 'washim', 'washim', 'active', '2025-03-21 06:11:40', NULL),
(3, 'pashusawardhan', 'पशुसवर्धन', 'washim', 'washim', 'active', '2025-03-21 06:11:42', NULL),
(4, 'samajkalyan department', 'समाजकल्याण विभाग', NULL, NULL, NULL, '2025-03-22 05:31:36', NULL),
(5, 'mahila balkalyan department', 'महिला बाल्कल्याण विभाग', NULL, NULL, NULL, '2025-03-22 05:31:38', NULL),
(6, 'bandhkam department', 'बांधकाम विभाग', NULL, NULL, NULL, '2025-03-22 05:33:19', NULL),
(7, 'gramin panipurawtha department', 'ग्रामीण पाणीपुरवठा विभाग', NULL, NULL, NULL, '2025-03-22 05:33:20', NULL),
(8, 'swachata department', 'स्वच्छता विभाग', NULL, NULL, NULL, '2025-03-22 05:34:40', NULL),
(9, 'irregation department', 'सिंचन विभाग', NULL, NULL, NULL, '2025-03-22 05:34:42', NULL),
(10, 'krushi department', 'कृषी विभाग', NULL, NULL, NULL, '2025-03-22 05:34:53', NULL),
(11, 'eduction department', 'शिक्षण विभाग', NULL, NULL, NULL, '2025-03-22 05:34:55', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `districts`
--

CREATE TABLE `districts` (
  `id` int NOT NULL,
  `district_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `districts`
--

INSERT INTO `districts` (`id`, `district_name`, `created_at`, `updated_at`) VALUES
(1, 'washim', '2025-03-21 06:13:04', NULL),
(2, 'washim', '2025-03-21 06:13:05', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `dist_headquarter`
--

CREATE TABLE `dist_headquarter` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `status` enum('Active','Inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `gr_uploads`
--

CREATE TABLE `gr_uploads` (
  `id` int NOT NULL,
  `subject_name` varchar(255) NOT NULL,
  `dept_id` int NOT NULL,
  `gr_file` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `office_cadres`
--

CREATE TABLE `office_cadres` (
  `id` int NOT NULL,
  `office_location_id` int NOT NULL,
  `cadre_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `office_cadres`
--

INSERT INTO `office_cadres` (`id`, `office_location_id`, `cadre_id`, `created_at`) VALUES
(1, 1, 1, '2025-03-24 09:25:49'),
(2, 2, 2, '2025-03-24 09:25:49');

-- --------------------------------------------------------

--
-- Table structure for table `office_location`
--

CREATE TABLE `office_location` (
  `id` int NOT NULL,
  `loc_name_marathi` varchar(255) NOT NULL,
  `loc_name_eng` varchar(255) NOT NULL,
  `dept_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `office_location`
--

INSERT INTO `office_location` (`id`, `loc_name_marathi`, `loc_name_eng`, `dept_id`) VALUES
(1, 'आरोग्य विभाग, मुख्यालय', '', 2),
(2, 'जिल्हा प्रशिक्षण केंद्र', '', 2),
(3, 'तालुका आरोग्य वाशिम', '', 2),
(4, 'पंचायत समिती वाशिम', '', 2),
(5, 'प्रा आ केंद्र', '', 2),
(6, 'उपकेंद्र', '', 2),
(7, 'प्रा आ केंद्र', '', 2),
(8, 'उपकेंद्र', '', 2);

-- --------------------------------------------------------

--
-- Table structure for table `panchayat_samiti`
--

CREATE TABLE `panchayat_samiti` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `status` enum('Active','Inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `taluka_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reset_passwords`
--

CREATE TABLE `reset_passwords` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int NOT NULL,
  `role_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `role_name`, `created_at`, `updated_at`) VALUES
(101, 'admin', '2025-03-21 07:09:05', NULL),
(102, 'hod', '2025-03-21 07:09:07', NULL),
(103, 'user', '2025-03-21 07:09:07', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `salaries`
--

CREATE TABLE `salaries` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `dept_id` int NOT NULL,
  `cadres_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sanstha`
--

CREATE TABLE `sanstha` (
  `id` int NOT NULL,
  `sanstha_name` varchar(255) NOT NULL,
  `taluka_id` int NOT NULL,
  `sansta_location` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `sanstha`
--

INSERT INTO `sanstha` (`id`, `sanstha_name`, `taluka_id`, `sansta_location`, `created_at`, `updated_at`) VALUES
(1, 'karanja', 1, 'karanja', '2025-03-21 06:56:34', NULL),
(2, 'karanja', 1, 'karanja', '2025-03-21 06:56:36', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `shifts`
--

CREATE TABLE `shifts` (
  `id` int NOT NULL,
  `shift_name` varchar(255) NOT NULL,
  `shift_start_time` time NOT NULL,
  `shift_end_time` time NOT NULL,
  `late_checkin_minutes` int DEFAULT '45',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `taluka`
--

CREATE TABLE `taluka` (
  `id` int NOT NULL,
  `taluka_name` varchar(255) NOT NULL,
  `ps_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `taluka`
--

INSERT INTO `taluka` (`id`, `taluka_name`, `ps_name`, `created_at`, `updated_at`) VALUES
(1, 'वाशीम', 'malegoan', '2025-03-21 06:14:41', NULL),
(2, 'कारंजा', 'malegoan', '2025-03-21 06:14:43', NULL),
(3, 'रिसोड', '', '2025-03-22 07:21:49', NULL),
(4, 'मालेगाव', '', '2025-03-22 07:21:49', NULL),
(5, 'मंगरूलपीर', '', '2025-03-22 07:21:49', NULL),
(6, 'माणोरा', '', '2025-03-22 07:21:49', NULL),
(7, 'रिसोड', '', '2025-03-22 07:21:51', NULL),
(8, 'मालेगाव', '', '2025-03-22 07:21:51', NULL),
(9, 'मंगरूलपीर', '', '2025-03-22 07:21:51', NULL),
(10, 'माणोरा', '', '2025-03-22 07:21:51', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `tbl_gr`
--

CREATE TABLE `tbl_gr` (
  `id` int NOT NULL,
  `dept_id` int NOT NULL,
  `subject` text NOT NULL,
  `description` text NOT NULL,
  `file_upload` varchar(244) DEFAULT NULL,
  `created_at` timestamp NOT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `first_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `middle_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `mob_no` varchar(100) NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `device_id` varchar(244) DEFAULT NULL,
  `department_id` int NOT NULL,
  `district_id` int DEFAULT NULL,
  `office_location_id` int NOT NULL,
  `taluka_id` int NOT NULL,
  `sanstha_id` int DEFAULT NULL,
  `village_id` int NOT NULL,
  `cader_id` int NOT NULL,
  `password` varchar(255) NOT NULL,
  `role_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `first_name`, `middle_name`, `last_name`, `mob_no`, `email`, `device_id`, `department_id`, `district_id`, `office_location_id`, `taluka_id`, `sanstha_id`, `village_id`, `cader_id`, `password`, `role_id`, `created_at`, `updated_at`) VALUES
(17, 'Kajal', 'Anil', 'Patil', '9876543210', NULL, 'device123', 2, NULL, 1, 1, NULL, 1, 1, '$2a$08$ko7pObCQUfXPrrxCsYQiquWW4155opTXr/bfoFKEd9djshLSOWUqi', 103, '2025-03-24 08:06:18', NULL),
(22, 'John', 'Doe', 'Smith', '9876543212', 'john1@example.com', 'device22', 2, NULL, 1, 1, NULL, 1, 1, '$2a$08$kj7LikCJh1j0Sw7OtDjobepQhb9fnEjfhQK/SU2sNEnzoZWCyjxr6', 103, '2025-03-24 09:35:01', NULL),
(40, 'John', 'Doe', 'Smith', '8874543294', NULL, 'device1247', 2, NULL, 1, 1, NULL, 1, 1, '$2a$08$YHiu7Itcb2z/ym34AFzGEe.LfONH/0DiDxbCdjbp8zCdlAFDhSeJS', 103, '2025-03-24 10:05:13', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users_attendance`
--

CREATE TABLE `users_attendance` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `shift_id` int NOT NULL,
  `morning_in_time` datetime DEFAULT NULL,
  `afternoon_in_time` datetime DEFAULT NULL,
  `evening_out_time` datetime DEFAULT NULL,
  `out_reason` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `villages`
--

CREATE TABLE `villages` (
  `id` int NOT NULL,
  `gav_name` varchar(255) NOT NULL,
  `taluka_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `villages`
--

INSERT INTO `villages` (`id`, `gav_name`, `taluka_id`, `created_at`, `updated_at`) VALUES
(1, 'karanja', 1, '2025-03-21 06:57:53', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `birthdays`
--
ALTER TABLE `birthdays`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_user_birthday` (`user_id`),
  ADD KEY `fk_dept_birthday` (`dept_id`);

--
-- Indexes for table `cadres`
--
ALTER TABLE `cadres`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `districts`
--
ALTER TABLE `districts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `dist_headquarter`
--
ALTER TABLE `dist_headquarter`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `gr_uploads`
--
ALTER TABLE `gr_uploads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_dept` (`dept_id`);

--
-- Indexes for table `office_cadres`
--
ALTER TABLE `office_cadres`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_office_cadre` (`office_location_id`,`cadre_id`),
  ADD KEY `idx_cadre_id` (`cadre_id`),
  ADD KEY `idx_office_location_id` (`office_location_id`) USING BTREE;

--
-- Indexes for table `office_location`
--
ALTER TABLE `office_location`
  ADD PRIMARY KEY (`id`),
  ADD KEY `dept_id` (`dept_id`);

--
-- Indexes for table `panchayat_samiti`
--
ALTER TABLE `panchayat_samiti`
  ADD PRIMARY KEY (`id`),
  ADD KEY `taluka_id` (`taluka_id`);

--
-- Indexes for table `reset_passwords`
--
ALTER TABLE `reset_passwords`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_user_reset` (`user_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `salaries`
--
ALTER TABLE `salaries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_users_salary` (`user_id`),
  ADD KEY `fk_dept_salary` (`dept_id`),
  ADD KEY `fk_cadres_salary` (`cadres_id`);

--
-- Indexes for table `sanstha`
--
ALTER TABLE `sanstha`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_taluka` (`taluka_id`);

--
-- Indexes for table `shifts`
--
ALTER TABLE `shifts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `taluka`
--
ALTER TABLE `taluka`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbl_gr`
--
ALTER TABLE `tbl_gr`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `mob_no_UNIQUE` (`mob_no`),
  ADD UNIQUE KEY `email_UNIQUE` (`email`),
  ADD UNIQUE KEY `device_id_UNIQUE` (`device_id`),
  ADD KEY `fk_users_department` (`department_id`),
  ADD KEY `fk_users_district` (`district_id`),
  ADD KEY `fk_users_taluka` (`taluka_id`),
  ADD KEY `fk_users_sanstha` (`sanstha_id`),
  ADD KEY `fk_users_village` (`village_id`),
  ADD KEY `fk_users_cader` (`cader_id`),
  ADD KEY `fk_users_role` (`role_id`),
  ADD KEY `fk_users_office_location` (`office_location_id`);

--
-- Indexes for table `users_attendance`
--
ALTER TABLE `users_attendance`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `villages`
--
ALTER TABLE `villages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_taluka_village` (`taluka_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `birthdays`
--
ALTER TABLE `birthdays`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cadres`
--
ALTER TABLE `cadres`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `districts`
--
ALTER TABLE `districts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `dist_headquarter`
--
ALTER TABLE `dist_headquarter`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `gr_uploads`
--
ALTER TABLE `gr_uploads`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `office_cadres`
--
ALTER TABLE `office_cadres`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `office_location`
--
ALTER TABLE `office_location`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `panchayat_samiti`
--
ALTER TABLE `panchayat_samiti`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reset_passwords`
--
ALTER TABLE `reset_passwords`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=104;

--
-- AUTO_INCREMENT for table `salaries`
--
ALTER TABLE `salaries`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sanstha`
--
ALTER TABLE `sanstha`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `shifts`
--
ALTER TABLE `shifts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `taluka`
--
ALTER TABLE `taluka`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `tbl_gr`
--
ALTER TABLE `tbl_gr`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT for table `users_attendance`
--
ALTER TABLE `users_attendance`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `villages`
--
ALTER TABLE `villages`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `birthdays`
--
ALTER TABLE `birthdays`
  ADD CONSTRAINT `fk_dept_birthday` FOREIGN KEY (`dept_id`) REFERENCES `departments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_user_birthday` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `gr_uploads`
--
ALTER TABLE `gr_uploads`
  ADD CONSTRAINT `fk_dept` FOREIGN KEY (`dept_id`) REFERENCES `departments` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `office_cadres`
--
ALTER TABLE `office_cadres`
  ADD CONSTRAINT `office_cadres_ibfk_1` FOREIGN KEY (`office_location_id`) REFERENCES `office_location` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `office_cadres_ibfk_2` FOREIGN KEY (`cadre_id`) REFERENCES `cadres` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `office_location`
--
ALTER TABLE `office_location`
  ADD CONSTRAINT `office_location_ibfk_1` FOREIGN KEY (`dept_id`) REFERENCES `departments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `panchayat_samiti`
--
ALTER TABLE `panchayat_samiti`
  ADD CONSTRAINT `panchayat_samiti_ibfk_1` FOREIGN KEY (`taluka_id`) REFERENCES `taluka` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reset_passwords`
--
ALTER TABLE `reset_passwords`
  ADD CONSTRAINT `fk_user_reset` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `salaries`
--
ALTER TABLE `salaries`
  ADD CONSTRAINT `fk_cadres_salary` FOREIGN KEY (`cadres_id`) REFERENCES `cadres` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_dept_salary` FOREIGN KEY (`dept_id`) REFERENCES `departments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_users_salary` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sanstha`
--
ALTER TABLE `sanstha`
  ADD CONSTRAINT `fk_taluka` FOREIGN KEY (`taluka_id`) REFERENCES `taluka` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_cader` FOREIGN KEY (`cader_id`) REFERENCES `cadres` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_users_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_users_district` FOREIGN KEY (`district_id`) REFERENCES `districts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_users_office_location` FOREIGN KEY (`office_location_id`) REFERENCES `office_location` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_users_sanstha` FOREIGN KEY (`sanstha_id`) REFERENCES `sanstha` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_users_taluka` FOREIGN KEY (`taluka_id`) REFERENCES `taluka` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_users_village` FOREIGN KEY (`village_id`) REFERENCES `villages` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `villages`
--
ALTER TABLE `villages`
  ADD CONSTRAINT `fk_taluka_village` FOREIGN KEY (`taluka_id`) REFERENCES `taluka` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

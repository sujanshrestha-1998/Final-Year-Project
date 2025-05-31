-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: May 29, 2025 at 05:07 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `studentportal_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `academics`
--

CREATE TABLE `academics` (
  `id` int(11) NOT NULL,
  `academics` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `academics`
--

INSERT INTO `academics` (`id`, `academics`) VALUES
(1, 'Academics A'),
(2, 'Academics B'),
(3, 'Academics C'),
(4, 'Academics D'),
(5, 'Academics E');

-- --------------------------------------------------------

--
-- Table structure for table `classrooms`
--

CREATE TABLE `classrooms` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `type` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `classrooms`
--

INSERT INTO `classrooms` (`id`, `name`, `type`) VALUES
(1, 'Lt-01 Wulferna', 'Lecture'),
(2, 'Lt-02 Wasfall', 'Lecture'),
(3, 'Lt-03 Buston', 'Lecture'),
(4, 'Tr-01 Everdale', 'Tutorial'),
(5, 'Tr-02 Frostford', 'Tutorial'),
(6, 'Sr-01 Emberton', 'Workshop');

-- --------------------------------------------------------

--
-- Table structure for table `classroom_reservations`
--

CREATE TABLE `classroom_reservations` (
  `id` int(11) NOT NULL,
  `classroom_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(11) NOT NULL,
  `purpose` varchar(255) NOT NULL,
  `reservation_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `attendees` int(11) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `classroom_reservations`
--

INSERT INTO `classroom_reservations` (`id`, `classroom_id`, `user_id`, `purpose`, `reservation_date`, `start_time`, `end_time`, `attendees`, `status`, `created_at`) VALUES
(53, 1, 6686, 'For Viva', '2025-05-23', '07:00:00', '09:00:00', 12, 'approved', '2025-05-22 04:13:10'),
(54, 1, 2088, 'For Viva', '2025-05-23', '09:00:00', '12:00:00', 12, 'rejected', '2025-05-22 04:14:49'),
(55, 1, 6686, 'For Viva', '2025-05-23', '09:00:00', '11:00:00', 11, 'rejected', '2025-05-22 04:15:25');

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`id`, `name`) VALUES
(2, 'BSc (Hons) in Business Management'),
(1, 'BSc (Hons) in Computer Science'),
(3, 'BSc (Hons) in Cybersecurity');

-- --------------------------------------------------------

--
-- Table structure for table `group`
--

CREATE TABLE `group` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `group`
--

INSERT INTO `group` (`id`, `name`) VALUES
(1, 'L4CG1'),
(2, 'L4CG2'),
(3, 'L4CG3'),
(4, 'L4CG4'),
(5, 'L4CG5'),
(6, 'L4CG6'),
(7, 'L4CG7'),
(10, 'L4CG8'),
(11, 'L4CG9');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `role_name` enum('admin','rte','teachers','students') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `role_name`) VALUES
(1, 'admin'),
(2, 'rte'),
(3, 'teachers'),
(4, 'students');

-- --------------------------------------------------------

--
-- Table structure for table `rte_officers`
--

CREATE TABLE `rte_officers` (
  `rte_officer_id` int(11) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `hire_date` date DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rte_officers`
--

INSERT INTO `rte_officers` (`rte_officer_id`, `first_name`, `last_name`, `email`, `date_of_birth`, `hire_date`, `status`, `created_at`, `updated_at`) VALUES
(1591, 'Sujan', 'Shrestha', 'sujan.shrestha@heraldcollege.edu.np', '1997-10-07', '2025-05-13', 'active', '2025-05-17 06:19:40', '2025-05-21 17:23:32');

-- --------------------------------------------------------

--
-- Table structure for table `schedules`
--

CREATE TABLE `schedules` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `group_id` int(11) DEFAULT NULL,
  `classroom_id` int(11) DEFAULT NULL,
  `course_id` int(11) DEFAULT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `day_of_week` enum('Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday') NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `schedules`
--

INSERT INTO `schedules` (`id`, `group_id`, `classroom_id`, `course_id`, `teacher_id`, `day_of_week`, `start_time`, `end_time`) VALUES
(2, 2, 2, 1, 6686, 'Sunday', '08:00:00', '10:00:00'),
(9, 5, 1, 1, 4387, 'Wednesday', '07:00:00', '09:00:00'),
(11, 1, 5, 1, 2667, 'Sunday', '11:00:00', '13:00:00'),
(12, 2, 1, 1, 2667, 'Monday', '09:00:00', '11:00:00'),
(22, 1, 1, 1, 6686, 'Tuesday', '10:00:00', '12:00:00'),
(24, 1, 6, 1, 6532, 'Monday', '08:00:00', '10:00:00'),
(25, 1, 6, 1, 8825, 'Thursday', '07:00:00', '09:00:00'),
(27, 2, 3, 1, 3451, 'Tuesday', '12:00:00', '14:00:00'),
(28, 2, 6, 1, 8825, 'Wednesday', '07:00:00', '09:00:00'),
(29, 2, 5, 1, 8825, 'Thursday', '13:00:00', '15:00:00'),
(32, 1, 3, 1, 8825, 'Friday', '14:00:00', '16:00:00'),
(33, 2, 4, 1, 6686, 'Friday', '15:00:00', '17:00:00'),
(34, 3, 3, 1, 6686, 'Friday', '10:00:00', '12:00:00'),
(35, 3, 2, 1, 4387, 'Tuesday', '07:00:00', '09:00:00'),
(39, 2, 1, 1, 3451, 'Sunday', '12:00:00', '14:00:00'),
(40, 4, 3, 1, 3451, 'Monday', '10:00:00', '12:00:00'),
(41, 5, 3, 1, 2667, 'Sunday', '10:00:00', '12:00:00'),
(43, 3, 3, 1, 8825, 'Sunday', '08:00:00', '10:00:00'),
(44, 3, 5, 1, 4387, 'Monday', '10:00:00', '12:00:00'),
(45, 4, 1, 1, 5954, 'Sunday', '10:00:00', '12:00:00'),
(48, 1, 1, 1, 6686, 'Monday', '12:00:00', '14:00:00'),
(50, 1, 4, 3, 8825, 'Sunday', '10:00:00', '12:00:00'),
(51, 3, 1, 1, 2667, 'Saturday', '13:00:00', '15:00:00'),
(53, 5, 2, 1, 6686, 'Saturday', '13:00:00', '15:00:00'),
(54, 5, 4, 3, 9992, 'Saturday', '07:00:00', '09:00:00'),
(57, 4, 5, 2, 6532, 'Saturday', '10:00:00', '12:00:00'),
(58, 6, 5, 1, 2667, 'Monday', '15:00:00', '17:00:00'),
(59, 2, 5, 1, 3451, 'Monday', '13:00:00', '15:00:00'),
(61, 6, 3, 1, 2667, 'Monday', '07:00:00', '09:00:00'),
(62, 6, 5, 1, 4387, 'Saturday', '12:00:00', '14:00:00'),
(63, 6, 1, 1, 7696, 'Wednesday', '10:00:00', '12:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` int(11) NOT NULL,
  `stud_id` int(11) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `date_of_birth` date NOT NULL,
  `enrollment_date` date NOT NULL,
  `grade_level` varchar(50) DEFAULT NULL,
  `stud_group` int(11) DEFAULT NULL,
  `status` varchar(10) DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`id`, `stud_id`, `first_name`, `last_name`, `date_of_birth`, `enrollment_date`, `grade_level`, `stud_group`, `status`) VALUES
(47, 17126, 'Darshan', 'Shrestha', '2004-12-28', '2025-01-14', 'First Semester', 1, 'active');

-- --------------------------------------------------------

--
-- Table structure for table `teachers`
--

CREATE TABLE `teachers` (
  `id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `enrolled_date` date DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `course` varchar(100) DEFAULT NULL,
  `assigned_academics` int(11) DEFAULT NULL,
  `status` varchar(10) DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `teachers`
--

INSERT INTO `teachers` (`id`, `teacher_id`, `first_name`, `last_name`, `email`, `enrolled_date`, `date_of_birth`, `course`, `assigned_academics`, `status`) VALUES
(8, 6686, 'Dhruv', 'Maharjan', 'dhruv.maharjan@heraldcollege.edu.np', '2025-01-11', '1995-10-07', 'Computer Science', 1, 'active'),
(9, 8825, 'Titu', 'Prasad', 'titu.prasad@heraldcollege.edu.np', '2025-01-11', '1989-12-29', 'Computer Science', 4, 'active'),
(10, 2667, 'Bhuvan', 'Wenhuan', 'bhuvan.wenhuan@heraldcollege.edu.np', '2025-01-11', '1899-06-07', 'Computer Science', 4, 'active'),
(11, 3451, 'Fameer', 'Foodie', 'fameer.foodie@heraldcollege.edu.np', '2025-01-11', '2000-11-30', 'Computer Science', 3, 'active'),
(13, 6532, 'Dependra', 'Shah', 'depen.shah@heraldcollege.edu.np', '2025-01-12', '2024-12-28', 'Computer Science', 2, 'active'),
(15, 9992, 'Slisha', 'Devkota', 'slisha.devkota@heraldcollege.edu.np', '2025-03-29', '2003-08-11', 'Management', 4, 'active');

-- --------------------------------------------------------

--
-- Table structure for table `teacher_meetings`
--

CREATE TABLE `teacher_meetings` (
  `id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `meeting_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `purpose` text NOT NULL,
  `status` enum('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
  `created_at` datetime NOT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `teacher_meetings`
--

INSERT INTO `teacher_meetings` (`id`, `teacher_id`, `student_id`, `meeting_date`, `start_time`, `end_time`, `purpose`, `status`, `created_at`, `updated_at`) VALUES
(35, 6686, 17126, '2025-05-22', '08:00:00', '08:30:00', 'Assignment Related.', 'rejected', '2025-05-22 10:05:39', '2025-05-22 10:05:39');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `role_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password_hash`, `email`, `role_id`, `created_at`, `updated_at`) VALUES
(1, 'Admin', '123', 'admin@heraldcollege.edu.np', 1, '2025-05-03 09:08:21', '2025-05-03 09:09:12'),
(1186, 'Dhule Lal', '11', 'dhule.lal@heraldcollege.edu.np', 3, '2025-01-11 08:33:54', '2025-01-11 08:33:54'),
(1591, 'Sujan Shrestha', '123', 'sujan.shrestha@heraldcollege.edu.np', 2, '2025-05-17 06:19:40', '2025-05-21 17:23:32'),
(2088, 'Deepson Shrestha', '123', 'deepson.shrestha@heraldcollege.edu.np', 3, '2025-05-22 03:55:26', '2025-05-22 03:55:26'),
(2667, 'Bhuvan Wenhuan', '11', 'bhuvan.wenhuan@heraldcollege.edu.np', 3, '2025-01-11 08:58:26', '2025-01-11 08:58:26'),
(3451, 'Fameer Foodie', '11', 'fameer.foodie@heraldcollege.edu.np', 3, '2025-01-11 08:58:58', '2025-01-11 08:58:58'),
(6532, 'Dependra Shah', '11', 'depen.shah@heraldcollege.edu.np', 3, '2025-01-12 04:31:45', '2025-05-17 04:47:59'),
(6686, 'Dhruv Maharjan', '111', 'dhruv.maharjan@heraldcollege.edu.np', 3, '2025-01-11 08:57:25', '2025-05-22 01:39:47'),
(8825, 'Titu Prasad', '11', 'titu.prasad@heraldcollege.edu.np', 3, '2025-01-11 08:57:49', '2025-05-03 17:47:49'),
(9992, 'Slisha Devkota', '123', 'slisha.devkota@heraldcollege.edu.np', 3, '2025-03-29 02:40:15', '2025-03-29 02:40:15'),
(17126, 'Darshan Shrestha', '123', 'np03csec2517126@heraldcollege.edu.np', 4, '2025-01-15 16:45:45', '2025-01-15 16:45:45'),
(28651, 'Dupendra Jogi', '123', 'np03csba2528651@heraldcollege.edu.np', 4, '2025-01-06 16:46:55', '2025-01-06 16:46:55');

-- --------------------------------------------------------

--
-- Table structure for table `user_notifications`
--

CREATE TABLE `user_notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `related_id` int(11) DEFAULT NULL,
  `notification_type` varchar(50) DEFAULT NULL,
  `read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_notifications`
--

INSERT INTO `user_notifications` (`id`, `user_id`, `title`, `message`, `related_id`, `notification_type`, `read`, `created_at`) VALUES
(20, 6686, 'Classroom Reservation Approved', 'Your reservation for Lt-01 Wulferna on Friday, May 23, 2025 has been approved.', 53, 'reservation_approved', 0, '2025-05-22 04:13:38'),
(21, 6686, 'Classroom Reservation Rejected', 'Your reservation for Lt-01 Wulferna on Friday, May 23, 2025 has been rejected.', 55, 'reservation_rejected', 0, '2025-05-22 04:15:53'),
(22, 2088, 'Classroom Reservation Rejected', 'Your reservation for Lt-01 Wulferna on Friday, May 23, 2025 has been rejected.', 54, 'reservation_rejected', 0, '2025-05-22 04:15:58'),
(23, 17126, 'Meeting Request Declined', 'Your meeting request with undefined undefined on Thursday, May 22, 2025 at 8:00 AM has been declined.', 35, 'meeting_rejected', 0, '2025-05-22 04:20:54');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `academics`
--
ALTER TABLE `academics`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `classrooms`
--
ALTER TABLE `classrooms`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `classroom_reservations`
--
ALTER TABLE `classroom_reservations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `classroom_id` (`classroom_id`,`reservation_date`,`start_time`,`end_time`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `group`
--
ALTER TABLE `group`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `role_name` (`role_name`);

--
-- Indexes for table `rte_officers`
--
ALTER TABLE `rte_officers`
  ADD PRIMARY KEY (`rte_officer_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `schedules`
--
ALTER TABLE `schedules`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD KEY `stud_id` (`stud_id`),
  ADD KEY `fk_stud_group` (`stud_group`);

--
-- Indexes for table `teachers`
--
ALTER TABLE `teachers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_academics` (`assigned_academics`),
  ADD KEY `fk_teachers_user` (`teacher_id`);

--
-- Indexes for table `teacher_meetings`
--
ALTER TABLE `teacher_meetings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_teacher_meetings_user` (`teacher_id`),
  ADD KEY `teacher_meetings_ibfk_2` (`student_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `role_id` (`role_id`);

--
-- Indexes for table `user_notifications`
--
ALTER TABLE `user_notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `academics`
--
ALTER TABLE `academics`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `classrooms`
--
ALTER TABLE `classrooms`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `classroom_reservations`
--
ALTER TABLE `classroom_reservations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `group`
--
ALTER TABLE `group`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `schedules`
--
ALTER TABLE `schedules`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=64;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=88;

--
-- AUTO_INCREMENT for table `teachers`
--
ALTER TABLE `teachers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `teacher_meetings`
--
ALTER TABLE `teacher_meetings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20286108;

--
-- AUTO_INCREMENT for table `user_notifications`
--
ALTER TABLE `user_notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `classroom_reservations`
--
ALTER TABLE `classroom_reservations`
  ADD CONSTRAINT `classroom_reservations_ibfk_1` FOREIGN KEY (`classroom_id`) REFERENCES `classrooms` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `classroom_reservations_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `rte_officers`
--
ALTER TABLE `rte_officers`
  ADD CONSTRAINT `fk_rte_officer_user` FOREIGN KEY (`rte_officer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `fk_stud_group` FOREIGN KEY (`stud_group`) REFERENCES `group` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`stud_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `teachers`
--
ALTER TABLE `teachers`
  ADD CONSTRAINT `fk_academics` FOREIGN KEY (`assigned_academics`) REFERENCES `academics` (`id`),
  ADD CONSTRAINT `fk_teachers_user` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `teachers_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `teacher_meetings`
--
ALTER TABLE `teacher_meetings`
  ADD CONSTRAINT `fk_teacher_meetings_user` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `teacher_meetings_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`);

--
-- Constraints for table `user_notifications`
--
ALTER TABLE `user_notifications`
  ADD CONSTRAINT `user_notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 26, 2026 at 07:05 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.1.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `lab_analyzer`
--

-- --------------------------------------------------------

--
-- Table structure for table `experiments`
--

CREATE TABLE `experiments` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `path_length` float DEFAULT 1,
  `data_points` text NOT NULL,
  `slope` float DEFAULT NULL,
  `intercept` float DEFAULT NULL,
  `epsilon` float DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `experiments`
--

INSERT INTO `experiments` (`id`, `user_id`, `title`, `path_length`, `data_points`, `slope`, `intercept`, `epsilon`, `created_at`) VALUES
(1, 7, 'First exp', 1, '[{\"conc\":\"1\",\"abs\":\"1\"},{\"conc\":\"2\",\"abs\":\"2\"},{\"conc\":\"3\",\"abs\":\"3\"},{\"conc\":\"4\",\"abs\":\"4\"}]', 1, 0, 1, '2026-03-26 17:21:57'),
(2, 7, '2nd', 1, '[{\"conc\":\"1\",\"abs\":\"2\"},{\"conc\":\"2\",\"abs\":\"3\"},{\"conc\":\"3\",\"abs\":\"4\"}]', 1, 1, 1, '2026-03-26 17:22:49'),
(6, 7, 'gsg', 1, '[{\"conc\":\"1\",\"abs\":\"2\"},{\"conc\":\"2\",\"abs\":\"3\"},{\"conc\":\"4\",\"abs\":\"6\"}]', 1.35714, 0.5, 1.35714, '2026-03-26 17:52:43'),
(7, 7, 'esserse', 1, '[{\"conc\":\"1\",\"abs\":\"4\"},{\"conc\":\"2\",\"abs\":\"2\"},{\"conc\":\"3\",\"abs\":\"6\"}]', 1, 2, 1, '2026-03-26 17:57:21'),
(8, 7, 'dssdssd', 1, '[{\"conc\":\"1\",\"abs\":\"3\"},{\"conc\":\"2\",\"abs\":\"4\"},{\"conc\":\"3\",\"abs\":\"4\"}]', 0.5, 2.66667, 0.5, '2026-03-26 18:00:52'),
(9, 7, 'gfdfdfdfd', 1, '[{\"conc\":\"2\",\"abs\":\"2\"},{\"conc\":\"3\",\"abs\":\"4\"},{\"conc\":\"1\",\"abs\":\"5\"}]', -0.5, 4.66667, -0.5, '2026-03-26 18:03:27');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `roll_no` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `full_name`, `roll_no`, `email`, `password`) VALUES
(7, 'Avirup Mukherjee', 'LSUG/124/25', 'avirupmukherjee019@gmail.com', '$2y$10$Ps.5EdyQ0Q2xIZ4dArijOuP3Y6STOM/TYyidfS4kRnYSj0rMs5RHS');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `experiments`
--
ALTER TABLE `experiments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `roll_no` (`roll_no`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `experiments`
--
ALTER TABLE `experiments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `experiments`
--
ALTER TABLE `experiments`
  ADD CONSTRAINT `experiments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

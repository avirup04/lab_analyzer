# LabAnalyzer: Precision Bio-CS Analytics Suite

LabAnalyzer is a high-performance, full-stack computational web application designed to automate and standardize wet-lab data quantification. By bridging the gap between biological data collection and computer science, this platform provides researchers with robust, in-silico analytical tools for spectrophotometric and kinetic assays.

Developed exclusively for the students and research scholars of the Department of Life Sciences, Ramakrishna Mission Residential College (Autonomous), Narendrapur.

---

## Overview

Traditional laboratory data analysis often relies on manual spreadsheet plotting, which is prone to human error and formatting inconsistencies. LabAnalyzer centralizes this workflow into a secure, responsive, and mathematically rigorous environment. It automates standard curve fitting, linear regression, and complex biochemical derivations, outputting publication-ready charts and standardized reports.

## Core Computational Modules

### 1. Molar Extinction Coefficient (ε) Calculator
Automates the derivation of the molar extinction coefficient based on the Beer-Lambert Law (A = ε·c·l).
* Dynamic input of concentration and absorbance matrices.
* Automated linear regression to determine the slope (m) of the standard curve.
* Algorithmic isolation of ε accounting for variable path lengths.
* Generates an interactive scatter plot with a calculated trendline.

### 2. Enzyme Kinetics Engine
A dedicated module for analyzing enzyme-substrate affinity and velocity parameters.
* **Michaelis-Menten Modeling:** Plots initial velocity (V₀) against substrate concentration [S], automatically mapping the Vmax asymptote and Km intercept.
* **Lineweaver-Burk Transformation:** Performs double-reciprocal data transformation (1/V₀ vs 1/[S]) with automated filtering of zero-concentration substrates to prevent infinite variable crashes.
* Derives precise Maximum Velocity (Vmax) and the Michaelis Constant (Km) via calculated linear regression intercepts.

### 3. Comprehensive Data Archiving & Export
* **Persistent Storage:** secure user authentication and database architecture allow researchers to save, retrieve, and modify historical experimental data.
* **PDF Report Generation:** Compiles raw data tables, calculated regression parameters, and Base64-encoded Chart.js canvas snapshots into formatted PDF documents.
* **Excel Integration:** Exports raw dataset matrices for external archiving.

---

## Technical Architecture

### Frontend
* **Framework:** React.js (Bootstrapped with Vite)
* **Styling:** Tailwind CSS (Fully responsive, implementing seamless Light/Dark mode transitions)
* **Data Visualization:** Chart.js with `react-chartjs-2` wrapper (Custom LineControllers, CategoryScales, and dynamic tooltips)
* **Routing:** React Router DOM
* **Icons:** Lucide React

### Backend & Database
* **Server-Side Logic:** PHP (RESTful API architecture handling JSON payloads)
* **Database:** MySQL (Relational tables for Users, Experiments, and Kinetic Assays)
* **Security:** Password hashing, CORS handling, and prepared SQL statements.

---

## Local Development Setup

### Prerequisites
* Node.js (v16+)
* XAMPP / WAMP (for local PHP and MySQL hosting)

### Installation
1. Clone the repository:
   ```bash
   git clone [https://github.com/yourusername/labanalyzer.git](https://github.com/yourusername/labanalyzer.git)
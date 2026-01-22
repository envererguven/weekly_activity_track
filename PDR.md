# Product Requirements Document (PDR)

## Overview
This document outlines the requirements, architecture, and feature set for the Activity Tracker application, designed for a 15-person telecom technical team. The application moves the team from Excel-based tracking to a centralized, web-based system with reporting and analytics capabilities.

## 1. Core Objectives
- **Centralize Data**: Replace Excel sheets with a PostgreSQL database.
- **Improve Accuracy**: Enforce field validation and provided dropdowns.
- **Enhance Visibility**: Provide dashboards for effort analysis and executive summaries.
- **Support Remote/Local Work**: Deployable via Docker for consistent environments.
- **Improved UX**: Intelligent filtering that defaults to the most relevant data (current or latest week).

## 2. User Roles
- **Team Member**: Enters weekly activities, views own history.
- **Manager/Admin**: Manages users, products, views team-wide dashboards and reports.

## 3. Functional Requirements

### 3.1 Activity Management (The "Task")
Each activity entry must capture:
- **Category (Mandatory)**: 
  - `Proje ID (Zorunlu)`
  - `Talep ID (Zorunlu)`
  - `Defect ID (Zorunlu)`
  - `Güvenlik Açığı`
  - `Diğer` (Trigger for "Diğer Detayı" dropdown)
- **Status**: `Tamamlandı`, `Devam Eden`, `Yeni Konu`
- **ID/Reference**: Required for Proje/Talep/Defect categories.
- **Criticality**: 5-level scale from "Çok Kritik" to "Hiç Kritik Değil".
- **Product/Service**: Autocomplete field (e.g., PIMS, DDP).
- **User**: Selected via dropdown (Defaults to filtered user if applicable).
- **Subject & Description**: Free text.
- **Weekly Progress**:
  - `Gelişme Durumu` (Progress text)
  - `Harcanan Efor` (Effort in hours)

### 3.2 User Experience
- **Auto-Date**: Default to current week (e.g., 2026-W04).
- **Smart Suggestions**: Suggest frequently used Products/Subjects based on history.
- **Sorting**: Most recent updates at the top.
- **Filtering (New)**:
  - Filter by **Team Member** (Name).
  - Filter by **Product**.
  - Filter by **Week** (Default: Current Week. Fallback: Last week with data).
  - **Search Logic**: "Week" filter must support partial matches (e.g., "2025" matches "2025-W01").
  - **Interaction**: Input should trigger "Live Filtering" (Type-ahead) without requiring form submission.
  - **Multi-select**: Filters should be additive (AND logic).
  - **Layout**: Simplified view removing legacy global context filters.
  - **Columns**: Include "Effort".
  - **Sorting**: Clickable headers for all columns (Asc/Desc).

### 3.3 Admin Capabilities
- **User Management**:
  - Add new users.
  - Edit user names.
  - Soft-delete (Deactivate) users (marked as "Left").
- **Product Management**:
  - Add new products.
  - Edit product names.
  - Soft-delete products.
- **Bulk Data Management**:
  - **Excel Upload**: Admin can upload an Excel file to bulk insert activities.
  - **Auto-Creation**: System auto-creates missing Users/Products found in the Excel file.

### 3.4 Dashboard & Reporting
- **Metrics**: 
  - Total Team Size
  - Total Activities
  - Total Effort (Hours)
- **Visualizations**:
  - Effort by Person (Bar Chart)
  - Status Distribution (Pie Chart)
- **Executive Summary (LLM Integration)**:
  - Integration with a Local LLM (Ollama) running in a Docker container.
  - **Functionality**: A button to generate a summary of recent activities.
  - **Configuration**: User enters API URL (default: `http://host.docker.internal:11434/api/generate` or `http://ollama:11434/api/generate`) and Model name.

## 4. Technical Architecture

### 4.1 Stack
- **Frontend**: React.js, Material-UI, Recharts.
- **Backend**: Node.js, Express.js.
- **Database**: PostgreSQL (Store JSONB for flexible weekly data).
- **AI/ML**: Ollama (Local LLM Container).

### 4.2 Deployment (Docker)
The solution is fully containerized with `docker-compose`.
- `frontend`: Port 3000
- `backend`: Port 5000
- `db`: Port 5432
- `ollama`: Port 11434 (New Requirement)

## 5. Implementation Roadmap
- **Phase 1 (MVP)**: Basic CRUD, Excel replacer. (Completed)
- **Phase 2 (Enhancements)**: Admin Panel (Users/Products), Dashboard Charts, LLM Integration. (Completed)
- **Phase 2.1 (Refinements)**: Advanced Filtering, Dashboard Visuals, Test Data Generation (2024/2025).
- **Phase 3**: Authentication, Role-based Access Control (Future).
- **Phase 4**: gelecek hafta için planan aksiyonlar kolonu eklencek. bu haftanın haftanın aksiyonları girilen geçen haftadan planlanan otomatik gelecek
- **Phase 5**:dashboard. proje, talep, defect dağılımı, grafik pasta olarak eklenecek. genel ve kişi bazlı.
- **phase 6**: time management takvim, eklenecek, bu takvime kişilerin izinler izinlerini de ekleyebilecekler.  
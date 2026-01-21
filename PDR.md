# Product Requirements Document (PDR)

## Overview
This document outlines the requirements, architecture, and feature set for the Activity Tracker application, designed for a 15-person telecom technical team. The application moves the team from Excel-based tracking to a centralized, web-based system with reporting and analytics capabilities.

## 1. Core Objectives
- **Centralize Data**: Replace Excel sheets with a PostgreSQL database.
- **Improve Accuracy**: Enforce field validation and provided dropdowns.
- **Enhance Visibility**: Provide dashboards for effort analysis and executive summaries.
- **Support Remote/Local Work**: Deployable via Docker for consistent environments.

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
- **Subject & Description**: Free text.
- **Weekly Progress**:
  - `Gelişme Durumu` (Progress text)
  - `Harcanan Efor` (Effort in hours)

### 3.2 User Experience
- **Auto-Date**: Default to current week (e.g., 2026-W04).
- **Smart Suggestions**: Suggest frequently used Products/Subjects based on history.
- **Sorting**: Most recent updates at the top.

### 3.3 Admin Capabilities
- **User Management**:
  - Add new users.
  - Edit user names.
  - Soft-delete (Deactivate) users (marked as "Left").
- **Product Management**:
  - Add new products.
  - Edit product names.
  - Soft-delete products.

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
- **Phase 3**: Authentication, Role-based Access Control (Future).

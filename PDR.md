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
  - Effort by product (Pie Chart)
  - Effort by work  type (project,  demand, defect, security, other) (Pie Chart)

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
- **Phase 3 (UX Intelligence)**:
  - **Smart Suggestions**: Auto-populate fields based on recent history when creating new activities.
  - **List View Upgrade**: Display dates next to actions; Allow "In-Line Editing" to update past/current items without creating new entries. (Completed)
- **Phase 4 (Planning Module)**:
  - **Next Week's Plan**: Add column for "Actions Planned for Next Week".
  - **Auto-Carryover**: Logic to surface last week's "Planned" items as suggestions for the current week.
- **Phase 5 (Advanced Analytics & Insights)**: (Completed)
  - **Visual Dashboard**: Pie/Bar charts for distribution (Project vs Request vs Defect).
  - **Effort Leaderboards**: Top Users by Effort, Top Systems/Products by Effort (Descending).
  - **Heatmaps**: "Busiest Times" analysis (Historical actuals vs Future plans).
  - **Scopes**: Toggle between "Personal" (My metrics) and "Global" (Team metrics) views.
- **Phase 6 (Inventory Module)**:
  - **Asset Management**: dedicated section (`/inventory`) for tracking team assets/envs.
  - **Navigation**: Accessible via top-level menu.
- **Phase 7 (Product Intelligence)**:
  - **Product Metrics**: Track Revenue, Usage, User Count, SMS Volume per product.
  - **Data Input**: Form-based entry + Bulk Excel Upload capability.
  - **Reporting**: specialized view for Product KPIs.
- **Phase 8 (Financials & Budget)**:
  - **Budget Tracking**: Planned vs Realized tracking.
  - **Fields**: Kades No, Man/Day, Vendor, Model, CR, Remaining Budget.
  - **Integration**: Excel Upload support (SAP integration future-proofed).
- **Phase 9 (External Integrations)**:
  - **Project Connect**: Fetch Docs, GTD, BRD via `Proje ID` (Proje3T integration).
  - **Defect Connect**: Fetch Status, Assignee, Description via `Defect ID` (HP ALM integration).
- **Phase 10 (Security)**: Authentication & RBAC.

### 5.1 Navigation Structure (New)
The Sidebar/Menu will be reorganized as follows:
1.  **Haftalık Rapor** (Weekly Report) - *Home*
2.  **Envanter** (Inventory)
3.  **Ürün Raporları** (Product Metrics)
4.  **Bütçe** (Budget) 
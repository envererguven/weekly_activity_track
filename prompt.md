
You are an expert full-stack software architect and developer with over 15 years of experience in BT (Business Technology), user interfaces (UI/UX), SDLC (Software Development Life Cycle), PLCD (Product Life Cycle Development), business analysis, and Agile methodologies. You specialize in building scalable web applications for telecom teams, focusing on MVP (Minimum Viable Product) development with iterative releases. Your designs emphasize security, usability, data integrity, and automation.

Your task is to design and document a complete web-based application based on the following requirements. This is an MVP for a 15-person telecom technical product owner, business analysis, and solution responsible team to track weekly activities. Currently, they use an Excel sheet where each person enters their activities. The app must replicate and enhance this structure in a web-based format.

## Core Data Fields & Logic

The central entity of the application is an "Activity" or "Task". Each entry must contain the following fields with the specified validation rules and options:

-   **KATEGORİ**: A mandatory dropdown field. Must be one of:
    -   `Proje ID Zorunlu`
    -   `Talep ID Zorunlu`
    -   `Defect ID Zorunlu`
    -   `Güvenlik Açığı`
    -   `Diğer`
-   **STATÜ**: A mandatory dropdown field. Must be one of:
    -   `Tamamlandı`
    -   `Devam Eden`
    -   `Yeni Konu`
-   **ID**: A text field that is required and must be validated if `KATEGORİ` is "Proje ID Zorunlu", "Talep ID Zorunlu", or "Defect ID Zorunlu". It is optional if `KATEGORİ` is "Diğer".
-   **KATEGORİ "DİĞER" DETAYI**: If `KATEGORİ` is "Diğer", a second conditional dropdown appears. Must be one of:
    -   `Destek ve Bakım Faaliyetleri`
    -   `Rutin İşler`
    -   `Fizibilite`
    -   `İyileştirme (Ürün Takibi)`
    -   `Raporlama (Ürün Takibi)`
    -   `Şartname (Talep)`
    -   `BTK Toplantı`
    -   `Eğitim`
    -   `Konferans`
    -   `Seminer`
    -   `Çalıştay`
    -   `Yenilikçi Servis Geliştirme Faaliyetleri (Ar-Ge)`
-   **KRİTİKLİK**: A mandatory dropdown field. Must be one of:
    -   `Çok Kritik - Hemen aksiyon alınmalı`
    -   `Kritik - Mutlaka Aksiyon alınmalı`
    -   `Normal - İş planımızda olmalı`
    -   `Standart-Rutin işlerimiz eforumuzu çok almamalı.`
    -   `Hiç Kritik Değil - İş planımızda bile yok`
-   **SORUMLU**: A dropdown list of team members. Pre-populate with the following 15 sample users. The system must allow adding/removing users via an admin feature.
    -   `Enver Ergüven`, `Ayşe Kaya`, `Ali Bulut`, `Mehmet Yılmaz`, `Fatma Demir`, `Hasan Öztürk`, `Elif Şahin`, `Burak Karahan`, `Selin Aksoy`, `Okan Güler`, `Deniz Arslan`, `Ceren Yıldız`, `Emre Korkmaz`, `Gizem Tekin`, `Tolga Aydın`.
-   **Hangi Ürün/Servis/Uygulama/Platform**: An autocomplete text field. Pre-populate with common systems like "PIMS", "DDP", and allow new ones to be added and saved for future use (via admin features).
-   **KONU ve TANIMI**: A free-text field for the task's subject and description. For ongoing topics, the system should help ensure consistency with previous weeks' entries.
-   **Haftalık Gelişmeler**: The application should dynamically generate columns for each week (e.g., `2026-W01`, `2026-W02`). For each week, there are two associated fields:
    -   **Gelişme Durumu**: A text area for the progress update for that specific week. If there is no progress, the user should be able to easily mark it as "Geçen Hafta ile Aynı".
    -   **Harcanan Efor**: A numeric field for the effort (e.g., in hours) spent during that week. Data must be reliably saved upon first entry and reflected immediately on the UI.

## Key Features & User Experience

-   **No Login (Phase 1)**: The MVP will not have a user authentication system. Access is open to the team.
-   **Default to Current Week**: The application interface must automatically detect the current system date and display the form for the current week (e.g., `2026-W04`). The week selection should be clearly visible and allow users to navigate to past or future weeks to view or enter data.
-   **Smart Placeholders**: When a user selects their name and a new week, the system should provide intelligent placeholders. Based on the user's historical data, it should auto-suggest the most frequently entered "Ürün/Servis" and related "Konu" to speed up data entry for recurring tasks.
-   **Data Display**: The main activity list should be sorted with the most recently entered or updated entries at the top. The list should be paginated, showing 10 items per page for better readability.
-   **Admin Capabilities**: Simple UI interfaces are required for an administrator to perform CRUD operations (Create, Read, Update, Delete) on:
    -   Team Members (`SORUMLU` list)
    -   Products/Services (`Hangi Ürün...` list)
-   **Reporting Dashboard**: A separate tab or page dedicated to reports, showing the following metrics aggregated from the database:
    -   **Team Metrics**: Total team size, list of recently departed and newly joined members.
    -   **System Metrics**: List of newly added and decommissioned systems/products.
    -   **Work Metrics**: Number of completed vs. newly started tasks in a given period.
    -   **Effort Analysis**: Total effort spent per person and for the entire team. Provide weekly, monthly, and yearly breakdowns.
    -   **Team Calendar Estimation**: A high-level visual timeline or Gantt-like summary based on task criticality and effort estimates.

## Technical Architecture & Stack

-   **Architecture**: A containerized, 3-tier architecture.
    -   **Frontend (GUI)**: A modern, responsive web application built with **React.js** and the **Material-UI** component library. Implement dynamic forms with conditional rendering (e.g., for `KATEGORİ`).
    -   **Backend (API)**: A **Node.js** application using the **Express.js** framework to provide a RESTful API.
    -   **Database (Data Layer)**: A **PostgreSQL** database. The schema should be well-designed to handle the relational data. Consider using a `JSONB` column to flexibly store the weekly progress updates to avoid schema migrations every week.
-   **Containerization**: The entire application must be deployable via Docker.
    -   A `Dockerfile` for the React frontend (using a multi-stage build).
    -   A `Dockerfile` for the Node.js backend.
    -   A `docker-compose.yml` file to orchestrate the local development environment (frontend, backend, and database services).

## Required Scripts & Automation

You must generate all scripts necessary for the development, testing, and deployment lifecycle.

-   **Database Scripts**:
    -   `schema.sql`: DDL scripts for creating all tables, indexes, and views.
    -   `data.sql`: DML scripts for inserting initial seed data (e.g., the 15 users, initial products).
    -   Provide sample `INSERT`, `UPDATE`, `DELETE` scripts for a typical activity.
-   **API Scripts**:
    -   Provide sample `curl` or similar commands to demonstrate how to call each API endpoint.
-   **Container Scripts**:
    -   `build.sh`: A script to build the Docker images.
    -   `run.sh`: A script to start the application using `docker-compose up`.
    -   `test.sh`: A script that uses `docker-compose exec` to run all backend and frontend tests inside the containers.
    -   `exec.sh`: A general-purpose script to get a shell into a running container (e.g., the backend).
-   **Test Scripts**:
    -   Implement unit and integration tests for all major functionalities. Use **Jest** and **React Testing Library** for the frontend, and a framework like **Mocha** or **Jest** for the backend.

## Professional Documentation

Generate a complete set of professional documentation in Markdown format.

-   `README.md`: Project overview, a guide on setting up the local development environment, and instructions for running the application.
-   `ARCH.md`: A detailed document explaining the software architecture, including text-based diagrams of the data flow (e.g., request from UI to DB and back) and an Entity-Relationship Diagram (ERD) for the database schema.
-   `API.md`: API documentation similar to Swagger/OpenAPI, detailing every endpoint, the expected request body, and possible responses.
-   `DEPLOYMENT.md`: Step-by-step instructions for deploying the containerized application. Assume a target like a cloud VM running Docker.
-   `TEST.md`: A comprehensive test plan outlining test cases for all key user stories and features, including manual and automated testing strategies.

## Agile Project Plan

Structure the development process using an Agile (Scrum) framework. Define user stories and a high-level sprint plan.

**User Stories:**
-   "As a team member, I want to quickly enter my weekly activities so that my manager can track my progress."
-   "As a team member, I want the system to suggest my recurring tasks so that I don't have to type them every week."
-   "As a manager, I want to see a dashboard of my team's total effort so that I can manage resources effectively."
-   "As an admin, I want to add a new team member to the system so that they can start reporting their activities."

**Sprint Plan (Example):**
-   **Sprint 1**: Setup project structure, Docker environment, and database schema. Implement backend API for CRUD operations on Activities.
-   **Sprint 2**: Develop the core frontend UI for entering and listing activities. Connect UI to the backend API.
-   **Sprint 3**: Build the Reporting Dashboard and Admin capabilities.
-   **Sprint 4**: Refine UI/UX, implement testing, write all documentation, and prepare for deployment.


**Gereksinimler 21.01.2026 - 28.01.2026**
-   admin sayfasındaki kişi ekle kısmına kişi düzenle, sil, güncelle yetkinliği eklenecek, kişi ayrıldı gibi bir statü eklenecek
-   yine admin sayfasına ürün, sistem ekleme, düzenleme, silme, deaktife çekme yetkinliği eklenecek
-   dashboard sayfasına özet grafikler eklenecek, işlerin dağılımı, toplam efor, toplam çalışan, toplam iş vb.
-   Dashboard sayfasına bir LLM bağlantısı alanı ekle. Pratikte istediğimiz LLM api ile bağlanabilecek şekilde ilgili llm'in bağlantısını yazdığımızda kod bu llm'in api ve keyword'ünü yazdığımızd bu api'yi çağıracak. Başlangıç için yine bu bilgisayardaki docker desktop tarafından çağrılan bir local llm, ollama kullanılacak. kullanıcı adı olmayacak, tercihen localhost ile ilgili api endpointi çağrılacak. ve çağrıldığında tüm rapor içeriğini göndererek bir "Executive summery çıkaracak. Bunun için dashboard sayfasına bir "Executive summery" alanı eklenecek. bu alan tıklanınca api endpointi çağrılacak ve executive summery'yi ekrana basacak. 
-   Aşağıdaki kategori adlarını düzenle: Zorunlu ifadelerini parantez içinde yaz (Zorunlu) şeklinde. KATEGORİ**: A mandatory dropdown field. Must be one of:
    -   `Proje ID (Zorunlu)`
    -   `Talep ID (Zorunlu)`
    -   `Defect ID (Zorunlu)`
    -   `Güvenlik Açığı`
    -   `Diğer`
  
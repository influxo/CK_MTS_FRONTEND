# Caritas Kosova & Mother Teresa Society Data Management System

A comprehensive data management solution designed for humanitarian organizations to manage programs, beneficiaries, and field activities with robust reporting and analytics capabilities.

## Overview

This platform provides two independent but architecturally identical data management systems for Caritas Kosova (CK) and Mother Teresa Society (MTS). The systems centralize program-related data, facilitate offline data collection, enable real-time monitoring, and provide powerful reporting and analysis tools.

## Key Features

- **User Management**: Role-based access control with secure authentication
- **Program Management**: Create and manage humanitarian programs and projects
- **Beneficiary Management**: Register and track program beneficiaries with privacy protection
- **Data Collection**: Configurable forms with offline capability for field data collection
- **Reporting & Dashboards**: Real-time data visualization and customizable reports
- **Statistics & Analytics**: Demographic analysis and program effectiveness metrics
- **Offline Functionality**: Progressive Web App with offline data collection and sync
- **Security**: GDPR compliance with data encryption and privacy protections

## Technical Architecture

- **Frontend**: React.js with TypeScript, Progressive Web App (PWA) capabilities
- **Backend**: Node.js API services
- **Database**: PostgreSQL
- **State Management**: Redux with Redux Toolkit
- **Authentication**: JWT-based with role-based access control (RBAC)
- **Offline Storage**: IndexedDB/SQLite with sync mechanism
- **Data Encryption**: AES-256 at rest, TLS 1.2+ in transit
- **UI Framework**: Custom component library with responsive design

## Modules

### User Management
- User authentication with secure login
- Role-based access control (Admin, Program Manager, Data Entry, Viewer)
- Two-Factor Authentication (2FA) for enhanced security

### Program Management
- Program creation and administration
- Support for multi-tier program hierarchies
- Program categorization and status tracking

### Beneficiary Management
- Beneficiary registration and profile management
- Privacy-focused data handling with unique identifiers
- Searchable beneficiary database with advanced filters

### Data Collection & Activities
- Configurable data collection forms
- GPS location tracking for field submissions
- Offline data entry with automatic synchronization

### Reporting & Analytics
- Real-time dashboards with key performance indicators
- Advanced filtering and data visualization
- Exportable reports in Excel and PDF formats

### System Administration
- Audit logging and activity tracking
- Backup and recovery tools
- System monitoring and performance metrics

## Security & Compliance

The system is built with security and data protection as foundational principles:

- GDPR compliant data handling
- Adherence to Kosovo's Data Protection Law
- Encrypted data storage and transmission
- Comprehensive audit logging
- Role-based data access restrictions
- Beneficiary data pseudonymization

## Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn
- PostgreSQL (v13+)

### Installation

1. Clone the repository
```bash
git clone [repository-url]
cd ck-mts-platform
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development server
```bash
npm run dev
# or
yarn dev
```

### Building for Production

```bash
npm run build
# or
yarn build
```

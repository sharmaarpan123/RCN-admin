# RCN Admin - React Application

This is a React + TypeScript + Vite conversion of the Referral Coordination Network Admin Panel.

## Features Implemented

✅ **Complete Application Structure**
- React 18 with TypeScript
- React Router for navigation
- Context API for state management
- LocalStorage for demo data persistence

✅ **Core Components**
- Login page with authentication
- Sidebar navigation with role-based access control
- Dashboard with KPIs and referral inbox management
- Organizations management
- User Panel for system administrators
- Payment Settings (simplified)
- Banner Management
- Financials overview
- Reports with export functionality
- Audit Log
- Settings with import/export

✅ **Key Functionality**
- User authentication with demo users
- Organization selector with filtering (Name, State, Zip)
- Side-by-side inbox views (Sender/Receiver)
- Role-based permissions (System Admin, Org Admin, Staff)
- Data export (JSON, CSV)
- Demo data seeding and reset
- Toast notifications
- Modal dialogs (via Context)

## Getting Started

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Start the development server:**
```bash
npm run dev
```

3. **Open your browser:**
The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Demo Users

The application comes with three demo users:

1. **System Admin**
   - Email: `sysadmin@rcn.local`
   - Password: `Admin123!`
   - Full access to all modules

2. **Organization Admin**
   - Email: `orgadmin@northlake.org`
   - Password: `Admin123!`
   - Limited to organization management

3. **Staff User**
   - Email: `staff@northlake.org`
   - Password: `Admin123!`
   - Basic referral dashboard access

## Project Structure

```
src/
├── components/           # Reusable React components
│   ├── Login.tsx        # Login page
│   ├── Sidebar.tsx      # Navigation sidebar
│   └── TopBar.tsx       # Page header
├── context/             # React Context providers
│   └── AppContext.tsx   # Main app state and methods
├── utils/               # Utility functions
│   └── database.ts      # LocalStorage management and helpers
├── views/               # Main view components
│   ├── Dashboard.tsx    # Referral dashboard
│   ├── Organizations.tsx # Organization management
│   ├── UserPanel.tsx    # System admin user management
│   ├── PaymentSettings.tsx # Payment configuration
│   ├── Banners.tsx      # Banner management
│   ├── Financials.tsx   # Financial overview
│   ├── Reports.tsx      # Export reports
│   ├── Audit.tsx        # Audit log viewer
│   └── Settings.tsx     # App settings
├── App.tsx              # Main app with routing
├── App.css              # Global styles
└── main.tsx             # Application entry point
```

## Technology Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing
- **Context API** - State management
- **LocalStorage** - Demo data persistence

## Key Differences from Original

The React version maintains all the core functionality of the original vanilla JavaScript application while providing:

1. **Better Code Organization** - Components are split into logical files
2. **Type Safety** - TypeScript provides compile-time type checking
3. **Modern React Patterns** - Uses hooks, context, and functional components
4. **Hot Module Replacement** - Fast development with Vite
5. **Component Reusability** - Shared components reduce code duplication

## Notes

- All data is stored in `localStorage` (demo only)
- No backend API is required
- The application is fully functional offline
- Refresh functionality updates data from localStorage
- Modal and toast systems are integrated via Context

## Simplified Features

To complete the conversion efficiently, some features have been simplified:

- Complex modals for creating/editing entities show placeholders
- Some advanced filtering features are simplified
- The referral detail modal is not fully implemented
- Financial calculations are simplified
- Invoice generation is simplified

These can be enhanced in future iterations based on specific requirements.

## Development

### Adding a New View

1. Create a new component in `src/views/`
2. Add the route in `src/App.tsx`
3. Add navigation link in `src/components/Sidebar.tsx`
4. Update permissions in `src/utils/database.ts` if needed

### Modifying Permissions

Update the `MODULE_PERMS` and `defaultPermissionsForUser` functions in `src/utils/database.ts`

## Support

For issues or questions about this React conversion, please refer to the original HTML file for complete feature specifications.

## License

This is a demo application for the Referral Coordination Network Admin Panel.

# AGOS

AGOS is a real-time dashboard and simulation platform for monitoring water flow rates, population data, and status of barangays in Metro Manila. It provides a comprehensive overview and alerting system for water supply management, helping stakeholders identify critical areas and make informed decisions.

## Features
- Real-time dashboard for all barangays
- Water flow rate, threshold, and drop rate monitoring
- Population statistics and status summary (Safe/Critical)
- Simulation tools for water supply scenarios
- Modern, responsive UI built with Next.js, React, and Tailwind CSS

## Tech Stack
- [Next.js](https://nextjs.org/) 15
- [React](https://react.dev/) 19
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase JS](https://supabase.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Lucide Icons](https://lucide.dev/)
- [pnpm](https://pnpm.io/) (recommended package manager)

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [pnpm](https://pnpm.io/) (install globally with `npm install -g pnpm`)

### Installation
1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd AGOS
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```

### Running the Development Server
Start the local development server:
```bash
pnpm dev
```
Visit [http://localhost:3000](http://localhost:3000) to view the app.

### Building for Production
To build the app for production:
```bash
pnpm build
```
To start the production server:
```bash
pnpm start
```

## Project Structure
- `app/` - Next.js app directory (pages, routes, dashboard, simulation)
- `components/` - Reusable UI components
- `lib/` - Utility libraries and mock data
- `styles/` - Global and component styles

## License
MIT 
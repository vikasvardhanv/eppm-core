# EPPM Core Application

A simplified Enterprise Project Portfolio Management system inspired by Primavera P6.

## Features
- Project & Activity Management
- CPM Scheduling Engine (Forward/Backward Pass, Float, Critical Path)
- Gantt Chart Visualization
- AI Insights & Graph Generation (Gemini)

## Setup
1. Install dependencies: `npm install`
2. Initialize Database: `npx prisma migrate dev --name init`
3. Run: `npm run dev`
4. Open http://localhost:3000

## Demo Instructions
1. Click "Settings" to enter your Gemini API Key.
2. Create a new project.
3. Add activities.
4. Add relationships (Predecessors).
5. Click "Run Schedule".
6. View Gantt Chart.
7. Go to "AI Insights" and ask: "Show me a duration graph".

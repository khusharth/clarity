<div align="center">
  
<!-- PROJECT LOGO -->
<h1 style="display: flex; align-items: center; justify-content: center; gap: 8px;">
  <img src="./public/logo.svg" alt="Clarity Logo" width="32" height="32" />
  <span>Clarity</span>
</h1>

A minimal task management app built with the Eisenhower Matrix principle - helping you prioritize what truly matters.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=Next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat&logo=React)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat&logo=TypeScript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat&logo=Tailwind-CSS)](https://tailwindcss.com/)

</div>

---

## 📽️ Demo

<!-- Add demo GIF here -->
<!-- <img src="./public/demo.gif" alt="Clarity Demo" width="100%"/> -->

**Live Demo:** _[Coming Soon]_

---

## ✨ Features

- 📊 **Eisenhower Matrix** - Organize tasks by urgency and importance (4 quadrants)
- 🎯 **Focus Mode** - Single or quadrant focus to eliminate distractions
- 🎨 **Beautiful UI** - Clean, modern interface with smooth animations
- 🌓 **Dark/Light Theme** - Seamless theme switching
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- 🖱️ **Drag & Drop** - Intuitive task reordering with smooth animations
- 💾 **Local Storage** - All data stored locally using IndexedDB
- 🔔 **Sound Effects** - Optional audio feedback for actions
- ⌨️ **Keyboard Shortcuts** - Quick actions for power users
- 🎉 **Celebration Effects** - Confetti animations when completing tasks
- ♿ **Accessibility** - Reduced motion support and keyboard navigation

---

## 👨‍💻 Technology Stack

### Frontend

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=Next.js)
![React](https://img.shields.io/badge/React-19-61dafb?style=flat&logo=React)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat&logo=TypeScript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?style=flat&logo=Tailwind-CSS)

- [Next.js 16](https://nextjs.org/) - React framework with App Router
- [React 19](https://reactjs.org/) - UI library
- [TypeScript 5](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS 4](https://tailwindcss.com/) - Utility-first styling

### State & Data

- [Zustand](https://zustand-demo.pmnd.rs/) - Lightweight state management
- [Dexie.js](https://dexie.org/) - IndexedDB wrapper for local data persistence
- [date-fns](https://date-fns.org/) - Date manipulation

### UI & Animations

- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [Radix UI](https://www.radix-ui.com/) - Headless UI primitives
- [Lucide React](https://lucide.dev/) - Beautiful icon set
- [react-rewards](https://github.com/thedevelobear/react-rewards) - Confetti effects
- [use-sound](https://github.com/joshwcomeau/use-sound) - Sound effects

---

## 🐣 Prerequisites

- [Node.js](https://nodejs.org/en/) >= 22.11.0
- [pnpm](https://pnpm.io/) >= 10.20.0

> **Note:** This project uses [Volta](https://volta.sh/) for Node version management. The correct versions are automatically selected if you have Volta installed.

---

## ⚡ Installation

1. **Clone the repository**

```bash
git clone https://github.com/khusharth/clarity.git
cd clarity
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Run the development server**

```bash
pnpm dev
```

4. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000) to see the app in action.

---

## 🏗️ Build for Production

```bash
# Create optimized production build
pnpm build

# Start production server
pnpm start
```

---

## 🎯 Usage

### Creating Tasks

1. Click the **"+"** button in any quadrant
2. Enter your task details
3. Task is automatically placed in the correct quadrant based on urgency/importance

### The Four Quadrants

- **Q1 (Do Now)** - Urgent & Important: Critical tasks requiring immediate attention
- **Q2 (Schedule)** - Not Urgent & Important: Long-term goals and planning
- **Q3 (Delegate)** - Urgent & Not Important: Tasks that can be delegated
- **Q4 (Eliminate)** - Not Urgent & Not Important: Time-wasters to minimize

### Focus Mode

Enable focus mode to concentrate on specific quadrants or individual tasks, hiding distractions.

### Settings

Access the Settings modal by clicking the gear icon in the top-right corner. Customize your experience with these options:

**General Settings:**

- **Theme** - Switch between Light and Dark mode
- **Reduce Motion** - Disable animations for accessibility (respects system preference)
- **Sound Effects** - Enable/disable audio feedback for task actions

**Task Display:**

- **Show Overall Total** - Display total task count across all quadrants
- **Show Per-Quadrant Totals** - Show individual task counts in each quadrant header

**Data Management:**

- **Export JSON** - Download all your tasks as a JSON file for backup
- **Import JSON** - Restore tasks from a previously exported JSON file

### Keyboard Shortcuts

- `A` - Add new task
- `Esc` - Close any open modal

---

## 📁 Project Structure

```
clarity/
├── app/
│   ├── components/       # React components
│   │   ├── ui/          # Reusable UI primitives
│   │   ├── Matrix.tsx   # Main Eisenhower Matrix
│   │   ├── TodoCard.tsx # Task card component
│   │   └── ...
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities and helpers
│   ├── store/           # Zustand state management
│   ├── styles/          # Global styles and themes
│   └── page.tsx         # Main page
├── public/              # Static assets
└── specs/               # Feature specifications
```

---

## 🤵‍♂️ Author

**Khusharth A Patani**

[![Twitter](https://img.shields.io/badge/Twitter-@khusharth19-1DA1F2?style=flat&logo=Twitter)](https://twitter.com/khusharth19)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-khusharth-0077B5?style=flat&logo=LinkedIn)](https://www.linkedin.com/in/khusharth/)

---

## 📃 License

[MIT License](./LICENSE) Copyright (c) 2025 Khusharth A Patani

---

## 🙏 Acknowledgments

- Inspired by the Eisenhower Matrix time management principle
- Built with modern web technologies and best practices
- Designed for productivity enthusiasts and busy professionals

---

<div align="center">

Made with ❤️ by [Khusharth](https://github.com/khusharth)

⭐ Star this repo if you find it helpful!

</div>

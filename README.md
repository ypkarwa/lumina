# Lumina 🕯️

**"Never attribute to malice what can be adequately explained by stupidity."** — *Hanlon's Razor*

Lumina is an open-source platform designed to transform social friction into personal growth. It operates on the **Socratic Principle**: No one does wrong willingly; they do so because they are unaware of the impact of their actions.

We believe that most "rude" or "annoying" behaviors are simply **blind spots**. Lumina helps us light them up for each other, with kindness and intent.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-Prototype-orange.svg)

## 🌟 Core Philosophy

1.  **The Cooling-Off Tank**: All messages are held for **1 hour** before delivery. This filters out rage and ensures only helpful intent remains.
2.  **The Stamp System**: Scarcity creates value. You only get **2 Praises**, **1 Feedback**, and **1 Advice** per month. Make them count.
3.  **The Duo-Score**:
    *   💛 **Love Score**: Earned by receiving Praise (Gratitude).
    *   🌟 **Value Score**: Earned by receiving useful Feedback/Advice (Growth).

## 🚀 Features

*   **Anonymous or Named**: Choose how you want to help.
*   **Public Wall of Growth**: Show the world what you are working on and the praise you've earned.
*   **Structured Feedback**: Templates that force constructive criticism ("I noticed X... It impacts Y...").
*   **Privacy First**: No data selling. No ads. Just growth.

## 🛠️ Tech Stack

*   **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **Components**: Shadcn UI (Radix Primitives)
*   **Database**: Prisma (SQLite for dev, easily switchable to Postgres)

## 🏃‍♂️ Getting Started

### Prerequisites

*   Node.js 18+ installed

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/lumina.git
    cd lumina
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Initialize the database:
    ```bash
    npx prisma generate
    npx prisma db push
    ```

4.  Run the development server:
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) to start lighting up blind spots.

## 🤝 Contributing

We welcome contributions! Whether it's fixing a bug, improving the UI, or adding new "Growth Templates".

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.


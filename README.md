# [JinAI](http://jinai.xyz/) – Real-Time Web3 Quiz Game

JinAI is a **real-time multiplayer quiz game** powered by **Next.js**, **WebSockets**, and **Solana on-chain logic**.  
Players connect their **Solana wallet**, join quiz lobbies, compete in live quizzes, and earn on-chain rewards based on performance.  

---

## ✨ Features
- **Wallet Authentication** – Secure login with Solana wallets (Phantom, Backpack, etc.)  
- **Real-Time Multiplayer** – Join/host lobbies with WebSocket-powered synchronization  
- **Synchronized Quiz Timer** – Every player sees the same countdown using a shared timer hook  
- **Dynamic Questions** – Questions seeded via Prisma & served per game  
- **Answer Validation** – Instant correctness + scoring logic  
- **Live Leaderboard** – Real-time score updates via WebSocket events  
- **On-Chain Pools & Rewards** – Backed by a Solana Anchor program  
- **Beautiful UI/UX** – Framer Motion animations, ParticleBackground, custom NeoCard components  

---

## 🛠️ Tech Stack

### **Frontend**
- [Next.js 14 (App Router)](https://nextjs.org/)  
- [React](https://react.dev/)  
- [Framer Motion](https://www.framer.com/motion/) – smooth animations  
- [TailwindCSS](https://tailwindcss.com/) – styling  
- [@solana/wallet-adapter](https://github.com/solana-labs/wallet-adapter) – wallet connections (Phantom, Backpack, etc.)  
- Custom Components: `NeoCard`, `ParticleBackground`, `StartLobby`, `GameScreen`, `Navbar`

### **Backend**
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/router-handlers)  
- [Prisma ORM](https://www.prisma.io/) + [PostgreSQL](https://www.postgresql.org/) – DB for users, games, answers  
- [Socket.IO](https://socket.io/) – real-time sync for lobbies & score updates  
- [JWT](https://jwt.io/) – secure session management (stored in `localStorage`)  
- [TweetNaCl](https://github.com/dchest/tweetnacl-js) – wallet signature verification  

### **Onchain (Solana Ofc)**
- [Solana](https://solana.com/)
- [Anchor Framework](https://project-serum.github.io/anchor/)
- [Helius RPC](https://www.helius.dev/)
- Program Instructions implemented:  
  - `appoint_pool` – initialize global pool  
  - `create_pool` – host a new game pool  
  - `join_pool` – player joins  
  - `secure_pool` – transition to InProgress  
  - `set_results` – commit rankings on-chain  
  - `t_rewards` – distribute rewards  
  - `u_prizes` – claim winnings  
  - `v_cancel` – cancel pool  

---

## 📂 File Structure

```bash
JinAI/
│── app/
│   ├── api/
│   │   ├── auth/route.ts          # Wallet signature + JWT auth
│   │   ├── games/
│   │   │   ├── create/route.ts    # Create a game
│   │   │   ├── join/route.ts      # Join a game
│   │   │   ├── seed-questions/    # Seed quiz questions into DB
│   │   ├── quiz/
│   │   │   ├── answer/route.ts    # Submit answers
│   │   │   ├── results/route.ts   # Rankings + on-chain sync
│   │   │   ├── questions/route.ts # Fetch quiz questions
│   │
│   ├── lobby/[gameId]/page.tsx    # Lobby with live players
│   ├── quiz/[gameId]/page.tsx     # Quiz screen
│   ├── host/page.tsx              # Host flow (auto-create/join pool)
│   ├── auth/page.tsx              # Wallet login
│   ├── game/page.tsx              # Quiz gameplay logic
│   └── layout.tsx                 # Root layout
│
│── components/
│   ├── NeoCard.tsx
│   ├── ParticleBackground.tsx
│   ├── StartLobby.tsx
│   ├── GameScreen.tsx
│   ├── Navbar.tsx
│
│── hooks/
│   ├── useTimer.ts                # Synchronized countdown
│
│── lib/
│   ├── program.ts                 # Anchor program interface
│   ├── IDL.json                   # On-chain program IDL
│   ├── prisma.ts                  # Prisma client setup
│
│── prisma/
│   ├── schema.prisma              # DB schema
│   ├── seed.ts                    # Seed sample questions
│
│── public/                        # Assets
│
│── package.json
│── tsconfig.json
│── README.md
``` 
## ❤️ Made By
- [Prakhar Sharma](https://x.com/Prakhar158)
- [Himaksh Pandey](https://x.com/ThatGrizzly_Dev)

# High-Performance User Directory (Stream Indexer) ✅

A full-stack web application for indexing, navigating, and displaying very large username lists (scalable to 10M+ records) with near O(1) access time and a constant memory footprint.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [How it Works](#how-it-works)
   - [Backend (Indexer)](#backend-indexer)
   - [Frontend (Virtualized View)](#frontend-virtualized-view)
4. [Installation](#installation)
5. [API Reference](#api-reference)
6. [Performance Verification](#performance-verification)
7. [Project Structure](#project-structure)
8. [Contributing](#contributing)

---

## Overview

This project answers the problem: how to display a massive sorted list of usernames in the browser without loading the entire dataset into memory or blocking the server/client.

By building a byte-offset index and using Node.js streams, the backend supports fast random access and small, constant-memory reads. The frontend renders only a small, virtualized window of items and loads more as the user scrolls.

## Features

- Zero-lag letter jumps (A–Z)
- Infinite scroll with on-demand chunked fetches (default 50 items)
- Constant backend memory usage (reads only required bytes)
- Simple REST API for alphabet map and paginated user retrieval

## How it Works

### Backend (Indexer) 🔧

- Single-pass indexing: on startup the indexer scans the file via streams and records byte offsets for sparse checkpoints (e.g., every 1,000 lines).
- It also records the first-line index for each alphabet letter (A → line 0, B → line X, etc.).
- To serve a page, the server seeks to the nearest checkpoint using `fs.createReadStream({ start: byteOffset })` and streams just enough bytes to return the requested lines.

Result: effectively constant-time access independent of total file size.

### Frontend (Virtualized View) 🖥️

- Tracks `skip` (starting line) and `limit` (page size) — does not store whole dataset.
- Uses IntersectionObserver to detect when to load next chunk.
- Appends chunks to a lightweight list with safeguards to prevent out-of-range requests.

## Installation

Prerequisites:

- Node.js v16+
- npm or yarn

Clone and install:

```powershell
git clone https://github.com/tahanaya/Taha_sanadtech.git
cd Taha_sanadtech
```

Backend:

```powershell
cd backend
npm install
```

Data setup (required):

```powershell
mkdir data
# Place your usernames.txt into backend/data/usernames.txt
```

Start backend:

```powershell
npx ts-node src/server.ts
```

The server will initialize the index on first startup and listen at http://localhost:3000 by default.

Frontend:

```powershell
cd ../frontend
npm install
npm run dev
```

Frontend dev server default: http://localhost:5173

---

## API Reference

| Method | Endpoint  | Description                                                                                          |
| ------ | --------- | ---------------------------------------------------------------------------------------------------- |
| GET    | /alphabet | Returns a mapping of letters to starting line numbers (e.g., `{ "A": 0, "B": 14502 }`).              |
| GET    | /users    | Returns a paginated list of users. Query params: `skip` (int, default 0), `limit` (int, default 50). |

Example /users response:

```json
{
  "users": ["Aaron Smith", "Aaron Jones", "Abigail Doe"],
  "meta": {
    "totalLines": 600000,
    "skip": 0,
    "limit": 50
  }
}
```

---

## Performance Verification 🧪

- On startup the server prints indexed line counts (e.g., "Indexed 600,000 lines").
- Try jumping to the 'Z' bucket — UI should update immediately.
- Monitor Node memory usage; it should remain stable (typically < 100MB) while loading and scrolling.

## Project Structure

```text
├── backend/
│   ├── src/
│   │   ├── indexer.ts      # File streaming & byte-offset indexing
│   │   ├── server.ts       # Express server
│   │   └── app.ts          # App config and routes
│   └── data/               # [REQUIRED] usernames.txt
└── frontend/
    ├── src/
    │   ├── components/     # UI components (AlphabetSidebar, LargeUserList)
    │   ├── hooks/          # Custom hooks (useAlphabet, useUsers)
    │   └── services/       # API client
    └── ...
```

---





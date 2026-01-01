# 🚀 High-Performance User Directory (10 Million Scale)

> **Technical Test Submission**  
> **Goal**: Efficiently load, display, and navigate a sorted list of **10,000,000** user names.

![Status](https://img.shields.io/badge/Status-Complete-green)

## Overview

This application solves the challenge of handling massive datasets in a web environment. It does **not** rely on loading data into a database; instead, it implements a highly memory-efficient **Sparse File Indexer** to read directly from a 500MB+ text file with **O(1)** random access time.

---

## 🏛️ Architecture & Algorithm

### 1. Backend: Sparse Byte Indexing (The "Phonebook" Algorithm)
Instead of loading the entire 500MB file into RAM, the backend "learns" the structure of the file once on startup.

*   **Initialization**: The server streams the file line-by-line.
*   **Indexing**: It records the **Byte Offset** (position in file) of every **1,000th line**.
    *   *Example*: Line 0 starts at byte 0. Line 1000 starts at byte 12,450.
*   **Memory Footprint**: For 10,000,000 lines, we only store ~10,000 integers. This uses < 50KB of RAM.
*   **Retrieval**: To get line 5,505:
    1.  Look up the offset for line 5,000 (nearest checkpoint).
    2.  Open a file stream starting at that byte.
    3.  Read forward 505 lines.
    4.  **Result**: **O(1)** access time regardless of file size.

### 2. Frontend: Virtual "Fake Scroll" Engine
Browsers cannot render a `div` that is 250,000,000 pixels tall (required for 10M items).

*   **The Problem**: Native browser limit is ~33M pixels.
*   **The Solution**: We map a "Ghost Scrollbar" (capped at 25M pixels) to the real data.
    *   Scroll 0% -> Data Index 0
    *   Scroll 50% -> Data Index 5,000,000
    *   Scroll 100% -> Data Index 10,000,000
*   **Rendering**: Only the ~20 items visible on screen are actually rendered in the DOM.

---

## 📂 Project Structure & File Utility

### Backend (`/backend`)
| File | Purpose |
| :--- | :--- |
| `src/server.ts` | **Entry Point**. Initializes the `FileIndexer` and starts the Express server. |
| `src/indexer.ts` | **Core Logic**. Handles file streaming, byte-offset calculation, and alphabet mapping. |
| `src/routes/users.ts` | **API Endpoint**. Handles `GET /users`. Converts query params (`skip`, `limit`) into file reads. |
| `src/routes/alphabet.ts` | **API Endpoint**. Returns the mapping of letters to line numbers (e.g., "A" starts at line 0, "B" at 450,000). |
| `data/usernames.txt` | **Data Source**. The read-only source of truth (not git-tracked if too large). |

### Frontend (`/frontend`)
| File | Purpose |
| :--- | :--- |
| `src/services/api.ts` | **Service Layer**. Centralizes `axios` configurations for clean HTTP requests. |
| `src/hooks/useUsers.ts` | **State Management**. Custom hook that handles data fetching, loading states, and sparse-array storage. |
| `src/components/LargeUserList.tsx` | **Virtualization Engine**. The complex component handling "Fake Scroll" math and DOM rendering. |
| `src/components/AlphabetSidebar.tsx` | **Navigation**. Renders the A-Z sidebar and triggers jump-to-index actions. |
| `src/App.tsx` | **Layout**. Orchestrates the Sidebar and List components. |

---

## 🔄 System Workflow

1.  **Startup**: Backend scans `usernames.txt` -> Builds `lineOffsets` array in RAM.
2.  **User Load**: Frontend requests `GET /users?skip=0&limit=50`.
3.  **Data Fetch**: Backend checks offset for Line 0 -> Reads 50 lines -> Returns JSON.
4.  **User Scroll**: User scrolls to 50%.
    *   Frontend Math: `50% of 10M` = Index `5,000,000`.
    *   Frontend Request: `GET /users?skip=5000000&limit=50`.
    *   Backend Lookup: Jump to byte offset for line 5,000,000 -> Read -> Return.
5.  **Render**: React updates the 50 items in the DOM instantly.

---

## 🛠️ Tech Stack

*   **Frontend**: React 18, TypeScript, Tailwind CSS
*   **Backend**: Node.js, Express, Native Streams
*   **DevOps**: Docker, Docker Compose, Nginx

---

## 🚀 Quick Start

### Docker (Recommended)

1.  Clone the repository.
2.  Run:
    ```bash
    docker-compose up --build
    ```
3.  Open **http://localhost**

## 👤 Author

**Taha**

# 🚀 High-Performance User Directory (10 Million Scale)

> **Technical Test Submission**  
> **Goal**: Efficiently load, display, and navigate a sorted list of **10,000,000** user names.

![Status](https://img.shields.io/badge/Status-Complete-green)


## Overview

This application solves the challenge of handling massive datasets in a web environment. It does **not** rely on loading data into a database; instead, it implements a highly memory-efficient **Sparse File Indexer** to read directly from a 500MB+ text file with **O(1)** random access time.

The Frontend overcomes the physical limitations of web browsers (pixel height limit) by implementing a custom **"Fake Scroll" Engine**, theoretically supporting infinite list sizes.

---

```text
+----------------+       +-------------------------+       +------------------------+       +---------------------+
|  User Browser  | <---> | Frontend (React + Vite) | <---> | Backend (Node.js API)  | <---> | Users.txt (500MB+)  |
+----------------+       +-------------------------+       | (Sparse Byte Indexer)  |       | (Indexed Stream)    |
                                                           +------------------------+       +---------------------+
```

### 1. Backend: The Sparse Stream Indexer
**Challenge**: How to seek to line 9,000,000 without iterating 8,999,999 lines?

*   **Solution**: On startup, the backend performs a single pass of the file.
*   **Optimization**: It stores the **Byte Offset** of every 1,000th line in a typed `Uint32Array`.
*   **Result**: Memory retrieval is instant (**O(1)** complexity). Even with 10M records, the index size is negligible (~40KB).

### 2. Frontend: The "Unlimited" Virtual Scroll
**Challenge**: Browsers cannot render a scrollbar for 10M items (Requires ~250M pixels height). Browsers crash or cap the height at ~16-33M pixels.

*   **Solution**: A **Scroll Mapping ("Fake Scroll") Engine**.
    *   **Ghost Height**: The scrollbar is capped at a safe 25,000,000 pixels.
    *   **Math Mapping**: Scroll position `0%` to `100%` is mathematically mapped to Data Index `0` to `10,000,000`.
    *   **Sticky Rendering**: The visible rows are rendered in a standard container that "sticks" to the viewport.

---

## ⚡ Key Features

*   **Infinite Scalability**: Tested logic supports 10M, 100M, or 1B records.
*   **Alphabet Navigation**: Instantly jump to any letter (A-Z).
*   **Smart Indexing**:
    *   Handles `\n` (Unix) and `\r\n` (Windows) EOLs automatically.
    *   Robustly handles names with titles ("Mr. Ronald" -> Indexed under "R").
*   **Dockerized**: Zero-config deployment.

---

## 🛠️ Tech Stack

*   **Frontend**: React 18, TypeScript, Tailwind CSS, `react-virtualized-auto-sizer`
*   **Backend**: Node.js, Express, Native Streams
*   **DevOps**: Docker, Docker Compose, Nginx

---

## 🚀 Quick Start

### Option A: Docker (Recommended)

1.  Clone the repository.
2.  Run:
    ```bash
    docker-compose up --build
    ```
3.  Open **http://localhost**

### Option B: Local Development

**Backend**:
```bash
cd backend
npm install
# Ensure backend/data/usernames.txt exists
npm run dev
```

**Frontend**:
```bash
cd frontend
npm install
npm run dev
```

---


## 👤 Author

**Taha**


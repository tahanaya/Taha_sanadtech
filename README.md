10 Million User Directory (High-Performance Stream Indexer)

A full-stack web application engineered to index, navigate, and display a dataset of 10 million records with $O(1)$ access time and constant memory usage.

📖 Overview

This project was built to solve a specific performance challenge: "How do you display a list of 10 million sorted usernames in a browser without crashing the server or freezing the client?"

Loading a 10M-line text file (~150MB+) into memory as an Array is inefficient and unscalable. This solution implements a Custom File Indexer that treats the flat text file as a random-access database using byte offsets and Node.js Streams.

Key Capabilities

Zero-Lag Navigation: Jump instantly to any letter (A-Z) regardless of file size.

Infinite Scrolling: Data is fetched in small chunks (50 items) as the user scrolls, keeping the DOM lightweight.

Constant Memory Footprint: The backend uses fs.createReadStream to read only the necessary bytes, ensuring RAM usage remains flat (~50MB) even with gigabytes of data.

🏗 Architecture & Engineering Decisions

1. Backend: Byte-Offset Indexing

Instead of scanning the file linearly for every request (which is $O(N)$), the backend performs a Single-Pass Indexing on startup:

Chunking: It records the byte position (offset) of every 1,000th line.

Alphabet Map: It records the exact starting line number of every letter (A-Z).

When the frontend requests "Page 500":

The server calculates the nearest "Chunk Offset".

It opens a file stream starting exactly at that byte (fs.createReadStream({ start: ... })).

It reads just the 50 requested lines and closes the stream.
Result: Access time is effectively $O(1)$.

2. Frontend: Virtualized "Window"

The frontend acts as a "view" into this massive dataset.

State Management: Tracks the current skip (offset) and limit (page size).

Intersection Observer: Detects when the user scrolls to the bottom pixel and triggers a loadMore action to append the next 50 records.

Sanity Checks: Prevents "wrap-around" bugs by validating that the requested index does not exceed the total line count.

🚀 Installation & Setup

Prerequisites

Node.js (v16 or higher)

npm or yarn

1. Clone the Repository

git clone <repository-url>
cd <project-folder>


2. Backend Setup

Navigate to the backend folder and install dependencies:

cd backend
npm install


⚠️ IMPORTANT: Data Generation

The application reads from a flat file. You must generate this file before running the server, as it is too large to be included in the Git repository.

Create the data directory inside the backend folder:

mkdir data


Generate the dataset:
Run the included script to generate a sorted file with 10 million realistic usernames.

node generate_users.js


This process will take roughly 30-60 seconds and create a file at backend/data/usernames.txt (~150MB+).

3. Start the Backend Server

# Run in development mode
npm run dev

# OR Build and start
npm run build
npm start


The server will initialize the index (taking ~1-2 seconds) and listen on http://localhost:3000.

4. Frontend Setup

Open a new terminal window and navigate to the frontend folder:

cd ../frontend
npm install


5. Start the Frontend

npm run dev


The application will launch at http://localhost:5173.

🔌 API Reference

The backend exposes a RESTful API to consume the indexed data.

Method

Endpoint

Description

GET

/alphabet

Returns a map of starting line numbers for each letter (e.g., {"A": 0, "B": 384000...}).

GET

/users

Returns a paginated list of users.

Query Parameters for /users:

skip (int): The starting line index (default: 0).

limit (int): Number of records to fetch (default: 50).

Example Response:

{
  "users": ["Aaron Smith", "Aaron Jones", ...],
  "meta": {
    "totalLines": 10000000,
    "skip": 0,
    "limit": 50
  }
}


🧪 Performance Testing

To verify the system's performance limits:

Ensure usernames.txt contains 10,000,000 lines (check the backend console logs on startup).

Open the web app.

Test 1 (Random Access): Click 'Z' in the sidebar. The jump should be instantaneous.

Test 2 (Scroll Performance): Scroll down rapidly. New names should load seamlessly without lag.

Test 3 (Memory): Check the Node.js process memory usage. It should remain stable (<100MB) regardless of how many requests you make.

📂 Project Structure

├── backend/
│   ├── src/
│   │   ├── indexer.ts      # Core Logic: File streaming and byte-offset mapping
│   │   ├── server.ts       # Express server entry point
│   │   └── app.ts          # App configuration
│   ├── generate_users.js   # Script to generate the 10M dataset
│   └── data/               # [User Created] Contains usernames.txt
│
└── frontend/
    ├── src/
    │   ├── components/     # UI Components (Sidebar, UserList)
    │   ├── hooks/          # Custom Hooks (useUsers, useAlphabet)
    │   └── services/       # API Fetching logic
    └── tailwind.config.js  # Styling configuration

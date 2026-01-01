# SanadTech User Directory

> A high-performance user directory capable of handling **10+ million records** with instant navigation and buttery-smooth scrolling.

## 🎯 Key Features

- **Sparse Indexing** - O(1) lookup to any line in a 500MB+ file
- **Virtual Scrolling** - Renders only visible rows (~20-30 DOM nodes)
- **Alphabet Navigation** - Jump instantly to any letter A-Z
- **Docker Ready** - One-command deployment

---

## 🏗️ Architecture

```
┌─────────────────┐         ┌──────────────────┐
│    Frontend     │  HTTP   │     Backend      │
│  React + Vite   │◀───────▶│  Node.js/Express │
│ (Port 80/5173)  │   API   │   (Port 3000)    │
└─────────────────┘         └──────────────────┘
                                    │
                                    ▼
                            ┌──────────────────┐
                            │  usernames.txt   │
                            │    (~10M lines)  │
                            │   Byte Indexed   │
                            └──────────────────┘
```

### Backend: Sparse Indexing

Instead of loading all 10M records into memory, we:

1. **Scan once** - Read the file sequentially, recording byte offsets every 1000 lines
2. **Store offsets** - Memory: only ~10,000 integers for 10M lines
3. **Random access** - Jump to any line in O(1) by seeking to the nearest indexed offset

```typescript
// Complexity Analysis
initialize(): O(n)      // One-time scan on startup (~200ms for 630K lines)
getLines(skip, limit): O(1) + O(limit)  // Seek + read
getAlphabetMap(): O(1)  // Pre-computed during init
```

### Frontend: Virtual Scrolling

Using `react-window`, we only render visible rows:

| Metric | Standard `.map()` | Virtual Scrolling |
|--------|------------------|-------------------|
| DOM Nodes | 10,000,000 | ~30 |
| Memory | 2GB+ | ~50MB |
| Scroll FPS | 0 (frozen) | 60 |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Docker (optional)

### Development

```bash
# 1. Backend
cd backend
npm install
# Place your usernames.txt in backend/data/
npx ts-node src/server.ts

# 2. Frontend (new terminal)
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

### Production (Docker)

```bash
# From project root
docker-compose up --build
```

Open http://localhost

---

## 📁 Project Structure

```
Taha_sanadtech/
├── backend/
│   ├── src/
│   │   ├── indexer.ts      # Sparse file indexer
│   │   ├── server.ts       # Express entry point
│   │   └── routes/         # API endpoints
│   ├── data/
│   │   └── usernames.txt   # Data file (gitignored)
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.tsx         # Main component
│   │   └── components/
│   │       ├── UserList.tsx        # Virtual list
│   │       └── AlphabetSidebar.tsx # A-Z navigation
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
└── README.md
```

---

## 📡 API Reference

### `GET /users`
Paginated user list.

| Param | Type | Default | Max |
|-------|------|---------|-----|
| skip | int | 0 | - |
| limit | int | 50 | 100 |

```json
{
  "users": ["Aaron Abbott", "Aaron Adams", ...],
  "meta": { "totalLines": 630566, "skip": 0, "limit": 50 }
}
```

### `GET /alphabet`
Index map for A-Z navigation.

```json
{
  "alphabetMap": { "A": 0, "B": 36492, "C": 62552, ... }
}
```

---

## 🧠 Technical Decisions

| Challenge | Solution |
|-----------|----------|
| 500MB file loading | Stream-based indexing with byte offsets |
| Browser freeze on render | react-window virtualization |
| Windows vs Unix line endings | Dynamic EOL detection (`\n` vs `\r\n`) |
| Type mismatches (react-window v2) | Namespace imports + declarations.d.ts |

---

## 👤 Author

**Taha** - R&D Backend & Infrastructure Internship Candidate

Built with ❤️ for SanadTech

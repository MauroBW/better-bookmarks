# Better Bookmarks Canvas

Better Bookmarks Canvas is a **desktop-first personal start page** for organizing and launching bookmarks fast.
It combines a productivity launcher with a visual board experience, so links are grouped by context (Work, Learning, Repositories, Personal) and managed directly on a canvas.

<img width="1916" height="940" alt="image" src="https://github.com/user-attachments/assets/2784dbc0-49b6-43c9-a2f1-1178ba037261" />


---

## Product Vision

The product is designed to help users:

- Find and open important links in under a few seconds.
- Keep bookmarks organized by context, not by browser folder trees.
- Reorganize sections and links with low friction.
- Personalize the visual environment (theme, wallpaper, density, effects).
- Keep everything local, private, and account-free.

---

## Core Product Capabilities

### 1) Section-Based Workspace

- Bookmarks are grouped into **sections**.
- Section types:
  - `links` (general links)
  - `repos` (repository-focused presentation)
- Users can create, rename, reorder, and remove sections.

### 2) Full Bookmark Management

For each section, users can:

- Add bookmarks
- Edit existing bookmarks
- Delete bookmarks
- Move bookmarks between sections via drag and drop

Bookmark data model includes:

- `label`
- `url`
- optional `icon`

### 3) Canvas Interaction Modes

The app supports two section layout modes:

- **Grid mode**: automatic responsive columns.
- **Free layout mode**: section cards can be moved freely across the page (canvas behavior), with positions persisted.

This allows both structured and creative workflows.

### 4) Repository-Aware Cards

For `repos` sections, bookmark rows include provider identity:

- GitHub
- GitLab
- Bitbucket
- Other

Provider badges are detected from URL and rendered automatically.

### 5) Search-First Workflow

- Global search input filters bookmarks by title and URL.
- Keyboard shortcut support (`Ctrl/Cmd + K`) for faster focus.

### 6) Visual Personalization

Users can personalize the interface with:

- Dark / Light mode
- Wallpaper upload / clear
- Background dim control
- Wallpaper blur control
- Compact mode
- Favicon visibility
- Card radius
- Accent glow intensity
- UI text scale
- Section scale

All settings are persisted locally.

### 7) Local-First Persistence

- No backend required.
- Data and preferences are stored in `localStorage`.
- Automatic migration from legacy section format to current `Workspace v2`.

---

## Product Experience Principles

The UX is built around:

- **Speed first**: primary action is opening links quickly.
- **Low cognitive load**: clear visual hierarchy and scannable rows.
- **Direct manipulation**: drag-and-drop for reorganization.
- **Personal workspace feel**: users shape the board to match their habits.
- **Premium but practical UI**: modern look without sacrificing usability.

---

## Current Scope / Non-Goals

Not included (yet):

- Cloud sync
- Authentication
- Multi-user collaboration
- Analytics / telemetry
- Deep nested taxonomy beyond sections and bookmarks

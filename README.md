# VỰC ĐÊM

VỰC ĐÊM is a horror storytelling and community platform where users can read, publish, discuss, and discover horror content.

The platform combines three main experiences:

```txt
Feed        → Reddit-like horror community
Stories     → long-form storytelling with chapters
Communities → topic-based spaces similar to subreddits
```

Users can publish short horror posts, real experiences, creepypasta, mysteries, paranormal content, and long-form serialized stories.

---

# Features

The planned product includes:

- user registration and authentication
- Google login
- email/password login
- horror content feed
- posts
- long-form stories
- chapters
- comments and replies
- upvotes and downvotes
- bookmarks
- user profiles
- author following
- communities
- notifications
- image uploads
- Cloudinary media management
- content reporting
- moderation
- admin tools
- search
- infinite scrolling

---

# Content types

VỰC ĐÊM has two primary content models.

## Post

A Post is a standalone piece of content.

Examples:

```txt
Chuyện có thật
Creepypasta
Trải nghiệm tâm linh
Bí ẩn
Kinh dị tâm lý
Thảo luận
Ảnh kỳ lạ
Truyền thuyết đô thị
```

Posts support:

```txt
title
content
thumbnail
images
tags
category
votes
comments
views
bookmarks
```

---

## Story

A Story is long-form serialized content.

```txt
Story
├── Chapter 1
├── Chapter 2
├── Chapter 3
└── ...
```

Stories support:

```txt
cover
description
tags
chapters
followers
views
status
```

---

# Product model

The platform is designed around three pillars:

```txt
                    VỰC ĐÊM
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼

       FEED           STORIES      COMMUNITIES

   Reddit-like      Wattpad-like   subreddit-like

   posts            stories        topic spaces
   voting           chapters       members
   comments         following      discussions
   images           bookmarks      content
```

The goal is to build a dedicated social platform for horror rather than only a traditional story-reading website.

---

# Technology stack

## Frontend

```txt
SvelteKit
TypeScript
Tailwind CSS
shadcn-svelte
@lucide/svelte
```

## Authentication and database

```txt
Firebase Authentication
Cloud Firestore
```

## Media

```txt
Cloudinary
```

Firebase Storage is not used.

---

# Architecture

High-level architecture:

```txt
┌──────────────────────────────────────────────┐
│                  Browser                     │
│                                              │
│ SvelteKit UI                                 │
│ Tailwind + shadcn-svelte + @lucide/svelte    │
└───────────┬──────────────────┬───────────────┘
            │                  │
            │                  │
            ▼                  ▼
     Firebase Auth        Cloud Firestore
            │
            │
            └──────────────┐
                           │
                           ▼
                  SvelteKit Server
                           │
                           ▼
                      Cloudinary
```

Firebase handles:

```txt
authentication
application data
authorization
Firestore queries
realtime updates where appropriate
```

Cloudinary handles:

```txt
avatars
post images
post thumbnails
story covers
community icons
community banners
```

SvelteKit server routes handle operations requiring secrets, including Cloudinary signed upload requests.

---

# Project structure

```txt
.
├── AGENTS.md
├── README.md
│
├── specs/
│   ├── README.md
│   ├── product/
│   ├── architecture/
│   ├── database/
│   ├── security/
│   ├── features/
│   ├── ui/
│   ├── api/
│   ├── implementation/
│   ├── testing/
│   └── roadmap/
│
├── docs/
│
├── src/
│   ├── lib/
│   └── routes/
│
├── static/
│
├── firestore.rules
├── firestore.indexes.json
├── firebase.json
├── .env.example
└── package.json
```

---

# Specifications

The complete implementation specification lives in:

```txt
specs/
```

Start with:

```txt
specs/README.md
```

The specification directory is the source of truth for:

```txt
product behavior
architecture
database schema
security
permissions
routes
UI behavior
features
APIs
implementation conventions
```

AI coding agents should also read:

```txt
AGENTS.md
```

before implementing changes.

---

# Design direction

The interface uses a dark horror editorial style.

Core visual characteristics:

```txt
near-black backgrounds
deep crimson accents
thin borders
minimal rounded corners
serif story titles
muted gray metadata
cinematic horror imagery
dense desktop layout
```

The interface should avoid looking like a generic SaaS dashboard.

The design should feel like:

```txt
underground horror community
+
premium editorial story platform
+
Reddit-like content hierarchy
```

---

# Main routes

Expected routes include:

```txt
/
```

Home feed.

```txt
/auth/login
/auth/register
```

Authentication.

```txt
/write
```

Create content.

```txt
/post/[id]
```

Post detail.

```txt
/story/[slug]
```

Story detail.

```txt
/story/[slug]/[chapter]
```

Story reader.

```txt
/u/[username]
```

User profile.

```txt
/c/[slug]
```

Community.

```txt
/search
```

Search.

```txt
/notifications
```

Notifications.

```txt
/settings
```

User settings.

```txt
/admin
```

Moderation and administration.

---

# Firebase

Firebase is used for:

```txt
Authentication
Cloud Firestore
Firestore Security Rules
Firestore indexes
```

Primary Firestore collections:

```txt
users/
posts/
stories/
comments/
communities/
notifications/
reports/
```

Additional relationship data uses subcollections where appropriate.

See:

```txt
specs/database/
```

---

# Cloudinary

Cloudinary is the only media storage provider in the planned architecture.

Cloudinary should store:

```txt
avatars
post images
post thumbnails
story covers
community media
```

Uploads requiring authentication must use signed uploads.

The Cloudinary API secret must never be exposed to the browser.

Expected flow:

```txt
Browser
   ↓
SvelteKit signing endpoint
   ↓
signature
   ↓
Browser
   ↓
Cloudinary
```

Firestore should store media metadata such as:

```json
{
	"url": "https://res.cloudinary.com/...",
	"publicId": "vucdem/posts/abc123/cover"
}
```

---

# Environment variables

Expected environment variables:

```env
PUBLIC_FIREBASE_API_KEY=
PUBLIC_FIREBASE_AUTH_DOMAIN=
PUBLIC_FIREBASE_PROJECT_ID=
PUBLIC_FIREBASE_APP_ID=

PUBLIC_CLOUDINARY_CLOUD_NAME=

CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Never commit real secrets.

Use:

```txt
.env.example
```

as the template.

---

# Development

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Type checking:

```bash
npm run check
```

Formatting and linting commands should follow the scripts defined in `package.json`.

---

# Development principles

The project should follow these rules:

```txt
TypeScript strict
reusable Svelte components
business logic outside large UI components
shared domain types
Firestore cursor pagination
secure Cloudinary uploads
Firestore Security Rules for authorization
minimal dependency duplication
```

Do not place Cloudinary secrets in client-side code.

Do not use Firebase Storage.

Do not invent database fields without updating the relevant specification.

---

# Roadmap

Development is planned in phases.

## Phase 1

```txt
project setup
design system
base layout
home feed mock UI
```

## Phase 2

```txt
Firebase
authentication
user profiles
```

## Phase 3

```txt
posts
Cloudinary uploads
create post
post detail
```

## Phase 4

```txt
voting
comments
bookmarks
following
```

## Phase 5

```txt
stories
chapters
story reader
story management
```

## Phase 6

```txt
communities
```

## Phase 7

```txt
notifications
reports
moderation
admin
```

## Phase 8

```txt
search
SEO
performance
deployment
```

Detailed roadmap specifications live in:

```txt
specs/roadmap/
```

---

# Documentation

Developer and setup documentation lives in:

```txt
docs/
```

Specifications and implementation contracts live in:

```txt
specs/
```

These directories serve different purposes:

```txt
specs/ → what the system must do
docs/  → how developers work with the system
```

---

# Status

The project is currently being designed and implemented according to the specifications under `specs/`.

Implementation should always remain consistent with those specifications.

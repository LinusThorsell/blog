# Modern Blog with SvelteKit & PocketBase

A beautiful, modern blog built with **Svelte 5** (with runes), **SvelteKit**, **PocketBase**, and **Markdown**.

![Blog Screenshot](https://via.placeholder.com/1200x630/faf9f7/1a1a1a?text=The+Blog)

## Features

- ✍️ **Markdown Support** - Write posts in Markdown with live preview
- 🚀 **Server-Side Rendering** - Fast initial loads with SvelteKit SSR
- 🎨 **Beautiful Design** - Clean, typography-focused aesthetic
- 📱 **Responsive** - Mobile-first design that works everywhere
- 🐳 **Docker Ready** - Zero local dependencies required
- 🔒 **Authentication** - Login required for admin features
- 🔑 **Protected API Routes** - RESTful API with auth protection

## Tech Stack

- **Frontend**: Svelte 5, SvelteKit, Tailwind CSS v4
- **Backend**: PocketBase (SQLite-based)
- **Styling**: Tailwind CSS with custom typography
- **Markdown**: marked.js for parsing

## Quick Start

### Prerequisites

- Docker and Docker Compose installed on your machine

### 1. Clone and Setup

```bash
cd /home/linus/projects/blog

# Create environment file
cp .env.example .env
```

### 2. Start the Containers

```bash
docker compose up --build
```

This will start:
- **SvelteKit App** at http://localhost:5173
- **PocketBase Admin** at http://localhost:8090/_/

### 3. Configure PocketBase

1. Open http://localhost:8090/_/ in your browser
2. Create an admin account (first time only)

#### Create the `posts` collection:

3. Click "New collection" and name it `posts`
4. Add these fields:

| Field Name   | Type   | Options                    |
|-------------|--------|----------------------------|
| title       | Text   | Required                   |
| slug        | Text   | Required, Unique           |
| excerpt     | Text   | Max 500 chars              |
| content     | Text   | Required                   |
| cover_image | URL    | Optional                   |
| published   | Bool   | Default: false             |

5. In the **API rules** tab, set:
   - **List/Search rule**: Leave empty (public access)
   - **View rule**: Leave empty (public access)
   - **Create/Update/Delete rules**: Leave empty or set `@request.auth.id != ""`

#### Create a blog user:

6. Go to the built-in `users` collection
7. Click "New record" and create a user with:
   - Email: `admin@example.com` (or your email)
   - Password: Choose a secure password
   - (Optional) Name: Your name

### 4. Start Writing!

1. Visit http://localhost:5173/login
2. Sign in with your user credentials
3. Click "Write" in the navigation to access the admin
4. Create your first blog post
5. Check "Publish immediately" and click "Create Post"
6. Your post is now live at http://localhost:5173/blog/[your-slug]

## Project Structure

```
blog/
├── src/
│   ├── routes/
│   │   ├── +layout.svelte       # Main layout with nav
│   │   ├── +page.svelte         # Home page (post list)
│   │   ├── +page.server.ts      # Server-side data loading
│   │   ├── about/
│   │   │   └── +page.svelte     # About page
│   │   ├── admin/
│   │   │   ├── +page.svelte     # Post editor
│   │   │   └── +page.server.ts  # Load existing posts
│   │   ├── blog/
│   │   │   └── [slug]/
│   │   │       ├── +page.svelte      # Single post view
│   │   │       └── +page.server.ts   # Load post by slug
│   │   └── api/
│   │       └── posts/
│   │           ├── +server.ts        # GET/POST posts
│   │           └── [id]/
│   │               └── +server.ts    # GET/PATCH/DELETE post
│   ├── lib/
│   │   ├── pocketbase.ts        # PocketBase client & types
│   │   └── components/
│   │       └── PostCard.svelte  # Blog post card component
│   ├── app.css                  # Global styles + Tailwind
│   ├── app.html                 # HTML template
│   └── app.d.ts                 # Type declarations
├── docker-compose.yml           # Docker services config
├── Dockerfile.dev               # Development container
├── package.json
├── svelte.config.js
├── vite.config.ts
└── README.md
```

## API Endpoints

| Method | Endpoint            | Description           |
|--------|--------------------|-----------------------|
| GET    | /api/posts         | List all published posts |
| GET    | /api/posts?all=true| List all posts (incl. drafts) |
| POST   | /api/posts         | Create a new post     |
| GET    | /api/posts/[id]    | Get single post       |
| PATCH  | /api/posts/[id]    | Update a post         |
| DELETE | /api/posts/[id]    | Delete a post         |

## Customization

### Fonts

The blog uses these Google Fonts:
- **Playfair Display** - For headings
- **Source Sans 3** - For body text
- **JetBrains Mono** - For code blocks

Edit `src/app.css` to customize the fonts and colors.

### Colors

CSS custom properties are defined in `src/app.css`:

```css
--color-ink: #1a1a1a;      /* Text color */
--color-paper: #faf9f7;    /* Background */
--color-accent: #c45d3a;   /* Links & buttons */
--color-muted: #6b6b6b;    /* Secondary text */
--color-border: #e5e3df;   /* Borders */
```

## Development

### Without Docker (requires Node.js 20+)

```bash
npm install
npm run dev
```

### Type Checking

```bash
npm run check
```

### Build for Production

```bash
npm run build
npm run preview
```

## Production Deployment

### Prerequisites

- A server with Docker and Docker Compose installed
- Domain pointed to your server (e.g., `linusthorsell.se`)
- Subdomain for PocketBase (e.g., `pb.linusthorsell.se`)

### 1. Create the Docker network

```bash
docker network create web
```

### 2. Clone and deploy

```bash
git clone <your-repo> blog
cd blog

# Start production stack
docker compose -f docker-compose.prod.yml up -d --build
```

### 3. Configure PocketBase

1. Visit https://pb.linusthorsell.se/_/
2. Create admin account
3. Create `posts` collection (see Quick Start section)
4. Create a user in `users` collection for blog login

### What's included

- **Traefik** reverse proxy with automatic SSL via Let's Encrypt
- **SvelteKit** app at `https://linusthorsell.se`
- **PocketBase** at `https://pb.linusthorsell.se`
- Automatic HTTP → HTTPS redirect
- WWW → non-WWW redirect

### DNS Configuration

Add these A records pointing to your server IP:

| Type | Name | Value |
|------|------|-------|
| A | @ | YOUR_SERVER_IP |
| A | www | YOUR_SERVER_IP |
| A | pb | YOUR_SERVER_IP |

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| ORIGIN | Your domain URL | https://linusthorsell.se |
| PUBLIC_POCKETBASE_URL | PocketBase URL (browser) | https://pb.linusthorsell.se |
| POCKETBASE_URL | PocketBase URL (server-side) | http://pocketbase:8090 |
| ACME_EMAIL | Email for Let's Encrypt | admin@linusthorsell.se |

### Useful commands

```bash
# View logs
docker compose -f docker-compose.prod.yml logs -f

# Restart services
docker compose -f docker-compose.prod.yml restart

# Update and rebuild
git pull
docker compose -f docker-compose.prod.yml up -d --build

# Backup PocketBase data
docker cp blog-pocketbase:/pb_data ./backup
```

## License

MIT

---

Built with ❤️ using Svelte 5, SvelteKit, and PocketBase


# Modern Blog with SvelteKit & PocketBase

A beautiful, modern blog built with **Svelte 5** (with runes), **SvelteKit**, **PocketBase**, and **Markdown**.

![Blog Screenshot](https://via.placeholder.com/1200x630/faf9f7/1a1a1a?text=The+Blog)

## Features

- ✍️ **Markdown Support** - Write posts in Markdown with live preview
- 🖼️ **Image Uploads** - Cover images and inline editor images upload to PocketBase
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

#### Create the `images` collection:

The editor and cover image upload flows both use the same `images` collection. Uploaded files are stored in PocketBase and the generated public file URL is saved in the post markdown or `cover_image` field.

1. Click "New collection" and name it `images`
2. Add this field:

| Field Name  | Type | Options       |
|-------------|------|---------------|
| file        | File | Required      |
| is_panorama | Bool | Default false |

3. In the **API rules** tab, set:
   - **List/Search rule**: Leave empty, or restrict it if you do not need image collection listing
   - **View rule**: Leave empty so public blog posts can render uploaded images
   - **Create rule**: Leave empty or set `@request.auth.id != ""`
   - **Update/Delete rules**: Set `@request.auth.id != ""`

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

Production is automatically deployed to a Talos Kubernetes cluster on Hetzner Cloud via ArgoCD.

### How it works

1. Push to `main` on this repo
2. GitHub Actions builds and pushes the container image to `ghcr.io/linusthorsell/blog`
3. The workflow updates the image tag in the [kubes](https://github.com/LinusThorsell/kubes) repo
4. ArgoCD detects the change and rolls out the new version

No manual steps required.

### Infrastructure

| Component | Role |
|-----------|------|
| Talos Linux | Kubernetes OS |
| ArgoCD | GitOps continuous delivery |
| Hetzner CSI | Persistent storage for PocketBase |
| ingress-nginx | Ingress controller (hostNetwork) |
| cert-manager | Automatic TLS via Let's Encrypt |

### URLs

| Service | URL |
|---------|-----|
| Blog | https://linusthorsell.se |
| PocketBase | https://pb.linusthorsell.se |

### Environment Variables

Set at the Kubernetes Deployment level in `kubes/manifests/blog/`:

| Variable | Value |
|----------|-------|
| ORIGIN | https://linusthorsell.se |
| PUBLIC_POCKETBASE_URL | https://pb.linusthorsell.se |
| POCKETBASE_URL | http://pocketbase.blog.svc.cluster.local:8090 |

### Useful commands

```bash
# Check deployment status
kubectl get pods -n blog

# View logs
kubectl logs -n blog deployment/blog
kubectl logs -n blog deployment/pocketbase

# Restart a deployment
kubectl rollout restart deployment/blog -n blog

# Check ArgoCD sync status
argocd app get blog
```

## License

MIT

---

Built with ❤️ using Svelte 5, SvelteKit, and PocketBase

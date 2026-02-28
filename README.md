# justinbarak.com

Personal website for Justin Barak. Pure HTML + CSS + vanilla JS — no frameworks, no build step.

## Structure

```
index.html   — the entire site (single page)
style.css    — all styles
reading.js   — Goodreads RSS fetch and rendering
```

## Deploy to GitHub Pages

1. Push this repo to GitHub (already done).
2. Go to **Settings → Pages**.
3. Under *Source*, select **Deploy from a branch**.
4. Choose branch: `master` (or `main`), folder: `/ (root)`.
5. Save. The site will be live at `https://justinbarak.github.io/justinbarak.com/` within a minute or two.

For a custom domain (`justinbarak.com`), add a `CNAME` file containing your domain and configure your DNS:
- A records pointing to GitHub's IPs: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
- Or a CNAME record pointing `www` to `justinbarak.github.io`

## Local development

No build step needed. Just open `index.html` in a browser.
For the Goodreads feed to work locally, you'll need a local server (e.g., `python3 -m http.server 8000`) since `fetch()` requires HTTP.

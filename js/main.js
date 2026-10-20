(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  const safe = (fn) => { try { return fn(); } catch { return null; } };
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const getJSON = (u) => fetch(u, { cache: "no-cache" }).then((r) => (r.ok ? r.json() : Promise.reject(r.status)));
  const FLAVOR = { blueberry: ["var(--blueberry)", false], strawberry: ["var(--strawberry)", false], tangerine: ["var(--tangerine)", true], lime: ["var(--lime)", true] };

  /* ---------- Shared chrome: nav, scrubber, footer, toast ---------- */
  const NAV = [["index.html", "Home", "home"], ["about.html", "About", "about"], ["content.html", "Videos", "content"], ["projects.html", "Projects", "projects"]];
  // 8x8 grass block, the site's one Minecraft mark
  const block = `<svg viewBox="0 0 8 8" shape-rendering="crispEdges" aria-hidden="true"><rect width="8" height="8" fill="#7a5133"/><rect x="1" y="5" width="1" height="1" fill="#5c3b22"/><rect x="5" y="6" width="1" height="1" fill="#5c3b22"/><rect width="8" height="3" fill="#6DBE2E"/><rect y="3" width="2" height="1" fill="#6DBE2E"/><rect x="5" y="3" width="1" height="1" fill="#6DBE2E"/><rect x="2" y="1" width="1" height="1" fill="#A9E36F"/><rect x="6" y="0" width="1" height="1" fill="#A9E36F"/></svg>`;

  document.body.insertAdjacentHTML("afterbegin", `
    <a href="#main" class="btn ghost" style="position:absolute;left:-9999px" onfocus="this.style.left='12px';this.style.top='12px';this.style.zIndex=99" onblur="this.style.left='-9999px'">Skip to content</a>
    <div class="nav">
      <div class="wrap">
        <div class="nav-in">
          <a class="logo" href="index.html" aria-label="Ricsi, home">${block}<span>ricsi</span></a>
          <nav class="nav-links" id="links" aria-label="Main">${NAV.map(([h, l, k]) => `<a href="${h}"${k === page ? ' aria-current="page"' : ""}>${l}</a>`).join("")}</nav>
          <button class="btn ghost menu-btn" id="menu" aria-expanded="false" aria-controls="links">Menu</button>
        </div>
        <div class="scrub" aria-label="Page timeline">
          <div class="scrub-track" id="track"><span class="playhead" id="ph"></span></div>
          <span class="tc" id="tc" aria-hidden="true">00:00:00:00</span>
        </div>
      </div>
    </div>`);
  $("main")?.setAttribute("id", "main");
  document.body.insertAdjacentHTML("beforeend", `
    <footer class="foot"><div class="wrap foot-in">
      <div><p class="foot-big">Thanks for watching.</p><p class="muted small" style="margin:0">© ${new Date().getFullYear()} Ricsi. Made in Hungary.</p></div>
      <nav aria-label="Footer">
        ${NAV.map(([h, l]) => `<a href="${h}">${l}</a>`).join("")}
        <a href="#" data-social="youtube">YouTube</a><a href="#" data-social="github">GitHub</a><a href="#" data-social="discord">Discord</a>
      </nav>
    </div></footer>
    <div class="toast" id="toast" role="status" aria-live="polite"></div>`);

  const menu = $("#menu");
  menu.addEventListener("click", () => { const o = $("#links").classList.toggle("open"); menu.setAttribute("aria-expanded", o); });

  let toastT;
  const toast = (t) => { const el = $("#toast"); el.textContent = t; el.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove("show"), 2600); };
  const copy = (text, msg) => { safe(() => navigator.clipboard.writeText(text)); toast(msg); };

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (!reduced && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  const scrollTo = (y) => (lenis ? lenis.scrollTo(y, { duration: 1.1 }) : scrollTo_(y));
  const scrollTo_ = (y) => window.scrollTo({ top: y, behavior: reduced ? "auto" : "smooth" });

  /* ---------- Timeline scrubber: page sections as clips ---------- */
  const track = $("#track"), ph = $("#ph"), tc = $("#tc");
  const clips = $$("[data-clip]");
  const buildClips = () => {
    $$(".clip", track).forEach((c) => c.remove());
    clips.forEach((sec) => {
      const [color, inkText] = FLAVOR[sec.dataset.flavor] || FLAVOR.blueberry;
      const b = document.createElement("button");
      b.className = "clip"; b.dataset.label = sec.dataset.clip; b.setAttribute("aria-label", `Jump to ${sec.dataset.clip}`);
      if (inkText) b.dataset.ink = "";
      b.style.cssText = `--fc:${color};flex:${Math.max(sec.offsetHeight, 1)} 1 0`;
      b.addEventListener("click", () => scrollTo(sec.getBoundingClientRect().top + scrollY - 90));
      track.insertBefore(b, ph);
    });
  };
  const pad = (n) => String(n).padStart(2, "0");
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
    ph.style.left = `calc(${(p * 100).toFixed(3)}% - 1px)`;
    const f = Math.round(scrollY / 4); // one frame per 4px scrolled, 30 fps
    tc.textContent = `${pad(Math.floor(f / 108000))}:${pad(Math.floor(f / 1800) % 60)}:${pad(Math.floor(f / 30) % 60)}:${pad(f % 30)}`;
    const mid = scrollY + innerHeight * 0.4;
    const btns = $$(".clip", track);
    clips.forEach((sec, i) => { const top = sec.getBoundingClientRect().top + scrollY; btns[i]?.classList.toggle("on", mid >= top && mid < top + sec.offsetHeight); });
  };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", () => { buildClips(); onScroll(); });

  /* ---------- Entrance + reveals ---------- */
  const start = () => requestAnimationFrame(() => document.body.classList.add("ready"));
  (document.fonts?.ready || Promise.resolve()).then(start);
  setTimeout(start, 900);
  const io = "IntersectionObserver" in window && new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("seen"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -10% 0px" });
  const observe = () => $$(".rv:not(.seen)").forEach((el) => (io ? io.observe(el) : el.classList.add("seen")));

  /* ---------- Content ---------- */
  const thumb = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  const watch = (id) => `https://www.youtube.com/watch?v=${id}`;
  const fmt = (s) => (s ? new Date(s).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" }) : "");
  const card = (v) => `<a class="thumb" href="${watch(v.id)}" target="_blank" rel="noopener"><div class="img" style="background-image:url(${thumb(v.id)})"></div><h3>${esc(v.title)}</h3><span class="date">${fmt(v.published)}</span></a>`;

  const run = async () => {
    const cfg = await getJSON("data/config.json").catch(() => ({}));
    const ok = (v) => v && !String(v).includes("YOUR_");
    const links = { youtube: cfg.youtube?.url, instagram: cfg.instagram?.url, discord: cfg.discord?.invite, github: cfg.github?.url };
    const dcUser = cfg.discord?.username;

    $$("[data-social]").forEach((a) => {
      const k = a.dataset.social, u = links[k];
      if (ok(u)) { a.href = u; a.target = "_blank"; a.rel = "noopener"; return; }
      a.addEventListener("click", (e) => {
        e.preventDefault();
        if (k === "discord" && dcUser) copy(dcUser, `Copied Discord username: ${dcUser}`);
        else toast("Coming soon");
      });
    });

    // rotating role in the hero
    const role = $("#role");
    const roles = (cfg.tagline || []).map((t) => t.replace(/\.$/, ""));
    if (role && roles.length > 1 && !reduced) {
      let i = 0;
      role.style.transition = "opacity .35s";
      setInterval(() => { role.style.opacity = 0; setTimeout(() => { i = (i + 1) % roles.length; role.textContent = roles[i]; role.style.opacity = 1; }, 350); }, 2600);
    }

    const latest = await getJSON("data/latest.json").catch(() => ({ videos: [] }));
    const all = latest.videos || [];
    const vids = all.filter((v) => !v.live);
    const stream = all.find((v) => v.live);

    // home: player
    const screen = $("#screen");
    if (screen) {
      const v = vids[0];
      if (v) {
        screen.style.backgroundImage = `url(${thumb(v.id)})`;
        $("#np-title").textContent = v.title;
        const play = () => { screen.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen title="${esc(v.title)}"></iframe>`; };
        $("#play").addEventListener("click", play, { once: true });
        screen.addEventListener("click", play, { once: true });
        screen.style.cursor = "pointer";
      } else {
        screen.classList.add("empty"); screen.textContent = "New upload coming soon";
        $("#np-title").textContent = "Nothing here yet"; $("#play").disabled = true;
      }
    }

    // home: channels
    const rows = $("#rows");
    if (rows) {
      const R = [
        { name: "YouTube", flavor: "", desc: `Hungarian Minecraft videos as @${esc(cfg.youtube?.handle || "")}.`, act: "Subscribe", href: links.youtube },
        { name: "rix.off.", flavor: "straw", desc: "Hyperpop and electronic music I produce.", act: "Links soon" },
        { name: "GitHub", flavor: "tang", desc: "Code, mods and the source of this site.", act: "Open GitHub", href: links.github },
        { name: "Discord", flavor: "lime", desc: ok(links.discord) ? "The community server." : `Server opens soon. Until then, add me: ${esc(dcUser)}`, act: ok(links.discord) ? "Join server" : "Copy username", copy: !ok(links.discord) && dcUser },
        { name: "Instagram", flavor: "", desc: "Behind the scenes, coming soon.", act: "Coming soon", soon: true },
      ];
      rows.innerHTML = R.map((r, i) => {
        const live = ok(r.href) || r.copy;
        const tag = live ? "a" : "div";
        const attrs = ok(r.href) ? `href="${esc(r.href)}" target="_blank" rel="noopener"` : r.copy ? `href="#" data-copy="${esc(r.copy)}"` : "";
        return `<${tag} class="row ${r.flavor}${live ? "" : " off"}" ${attrs}><h3 class="h-row"><span class="swatch"></span>${r.name}</h3><p class="muted">${r.desc}</p>${live ? `<span class="act">${r.act}</span>` : `<span class="chip soon">${r.act}</span>`}</${tag}>`;
      }).join("");
      $$("[data-copy]", rows).forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); copy(a.dataset.copy, `Copied Discord username: ${a.dataset.copy}`); }));
    }

    const recent = $("#recent");
    if (recent) recent.innerHTML = vids.slice(0, 3).map(card).join("") || `<p class="muted">New uploads land here automatically.</p>`;

    // videos page
    const grid = $("#video-grid");
    if (grid) grid.innerHTML = vids.map(card).join("") || `<p class="muted">Uploads appear here once the channel has public videos.</p>`;
    const sg = $("#stream-grid");
    if (sg) sg.innerHTML = stream ? card(stream) : `<p class="muted">No streams yet.</p>`;

    // projects page
    const pl = $("#project-list");
    if (pl) {
      const ps = await getJSON("data/projects.json").catch(() => []);
      pl.innerHTML = ps.map((p) => `<article class="proj"><h3 class="h-row">${esc(p.title)}</h3><div><p>${esc(p.desc)}</p><div class="chips">${(p.tags || []).map((t) => `<span class="chip">${esc(t)}</span>`).join("")}</div></div>${p.url && p.url !== "#" ? `<a class="btn ghost" href="${esc(p.url)}" target="_blank" rel="noopener">Open</a>` : `<span class="chip soon">Link soon</span>`}</article>`).join("");
    }

    buildClips(); onScroll(); observe();
  };

  buildClips(); onScroll(); observe();
  run();
})();

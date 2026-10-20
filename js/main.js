(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) document.documentElement.classList.add("reduced");
  const page = document.body.dataset.page || "home";
  const safe = (fn) => { try { return fn(); } catch { return null; } };
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const getJSON = (u) => fetch(u, { cache: "no-cache" }).then((r) => (r.ok ? r.json() : Promise.reject(r.status)));

  /* ---------- Shell: taskbar, xp bar, start menu, toast, footer ---------- */
  const NAV = [
    ["index.html", "Home", "🏠", "home"],
    ["about.html", "About", "🧑", "about"],
    ["content.html", "Videos", "▶️", "content"],
    ["projects.html", "Projects", "💾", "projects"],
  ];
  document.body.insertAdjacentHTML("beforeend", `
    <footer class="wrap">© <span id="yr"></span> <span class="cfg-name">Ricsi</span> · built block by block · <a href="#" id="konami-hint" style="text-decoration:none">↑↑↓↓←→←→BA</a></footer>
    <div class="xp"><i id="xp"></i></div>
    <nav class="taskbar" aria-label="Main">
      <button class="start-btn" id="start" aria-expanded="false" aria-controls="smenu"><b>◆</b><span>Start</span></button>
      <div class="hotbar">${NAV.map(([h, l, i, k], n) => `<a href="${h}" data-tip="${l}" aria-label="${l}" class="${k === page ? "on" : ""}"><span class="k">${n + 1}</span>${i}</a>`).join("")}</div>
      <div class="tray"><span id="clock">--:--</span></div>
    </nav>
    <div class="start-menu" id="smenu" role="menu"><div class="side">RicsiOS 2000</div>
      ${NAV.map(([h, l, i]) => `<a href="${h}" role="menuitem">${i} ${l}</a>`).join("")}
      <a href="#" data-social="youtube" role="menuitem">📺 YouTube</a>
      <a href="#" data-social="discord" role="menuitem">💬 Discord</a>
    </div>
    <div class="toast" id="toast" role="status" aria-live="polite"><div class="ic">🏆</div><div><b>Achievement Get!</b><span id="toast-t"></span></div></div>`);
  $("#yr").textContent = new Date().getFullYear();

  const tick = () => { const d = new Date(); $("#clock").textContent = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); };
  tick(); setInterval(tick, 20000);

  const sm = $("#smenu"), sb = $("#start");
  sb.addEventListener("click", (e) => { e.stopPropagation(); const o = sm.classList.toggle("open"); sb.setAttribute("aria-expanded", o); });
  document.addEventListener("click", () => { sm.classList.remove("open"); sb.setAttribute("aria-expanded", false); });
  addEventListener("keydown", (e) => {
    if (e.target.matches("input,textarea")) return;
    if (e.key === "Escape") sm.classList.remove("open");
    const n = +e.key;
    if (n >= 1 && n <= NAV.length && !e.ctrlKey && !e.metaKey && !e.altKey) location.href = NAV[n - 1][0];
  });

  /* XP bar */
  const xp = $("#xp");
  const updXP = () => { const h = document.documentElement.scrollHeight - innerHeight; xp.style.width = (h > 0 ? Math.min(100, (scrollY / h) * 100) : 0) + "%"; };
  addEventListener("scroll", updXP, { passive: true }); updXP();

  /* Achievements */
  let toastTimer;
  const toast = (t) => { $("#toast-t").textContent = t; $("#toast").classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => $("#toast").classList.remove("show"), 3800); };
  const got = safe(() => JSON.parse(localStorage.getItem("ach") || "[]")) || [];
  const award = (id, t) => { if (got.includes(id)) return; got.push(id); safe(() => localStorage.setItem("ach", JSON.stringify(got))); setTimeout(() => toast(t), 700); };
  const A = { home: "Welcome to the server", about: "Getting to know me", content: "Binge watcher", projects: "Taking inventory" };
  award(page, A[page] || "Explorer");
  if (got.length >= NAV.length) award("all", "Completionist: visited every page");
  let seq = [], code = "ArrowUp,ArrowUp,ArrowDown,ArrowDown,ArrowLeft,ArrowRight,ArrowLeft,ArrowRight,b,a";
  addEventListener("keydown", (e) => { seq.push(e.key); seq = seq.slice(-10); if (seq.join() === code) { got.splice(got.indexOf("konami"), 1); award("konami", "Cheater! Creative mode on."); document.body.style.filter = "hue-rotate(120deg)"; } });

  /* ---------- Smooth scroll + reveals ---------- */
  if (!reduced && window.Lenis) {
    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1 });
    if (window.gsap && window.ScrollTrigger) { lenis.on("scroll", ScrollTrigger.update); gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
    else { const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf); }
  }
  const reveal = () => {
    const els = $$(".rv");
    if (reduced || !window.gsap || !window.ScrollTrigger) { els.forEach((e) => (e.style.cssText = "opacity:1;transform:none")); return; }
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.batch(els, { start: "top 90%", once: true, onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "back.out(1.4)", stagger: 0.1, overwrite: true }) });
    $$(".bar > i").forEach((i) => gsap.from(i, { scaleX: 0, duration: 1.1, ease: "power3.out", scrollTrigger: { trigger: i, start: "top 92%", once: true } }));
    $$("[data-count]").forEach((n) => { const to = +n.dataset.count; const o = { v: 0 }; gsap.to(o, { v: to, duration: 1.6, ease: "power2.out", scrollTrigger: { trigger: n, start: "top 92%", once: true }, onUpdate: () => (n.textContent = Math.round(o.v).toLocaleString() + (n.dataset.suffix || "")) }); });
  };

  /* ---------- Windows: drag + minimize ---------- */
  const initWindows = () => {
    let z = 10;
    $$(".win").forEach((w) => {
      const bar = $(".win-bar", w); if (!bar) return;
      const [min, close] = $$(".win-btn", w);
      min?.addEventListener("click", (e) => { e.stopPropagation(); w.classList.toggle("min"); });
      close?.addEventListener("click", (e) => { e.stopPropagation(); w.style.display = "none"; toast("Window closed. Refresh to bring it back."); });
      if (matchMedia("(max-width: 860px)").matches || !w.hasAttribute("data-drag")) return;
      let sx, sy, ox = 0, oy = 0, on = false;
      bar.style.cursor = "grab";
      bar.addEventListener("pointerdown", (e) => { if (e.target.closest(".win-btn")) return; on = true; sx = e.clientX - ox; sy = e.clientY - oy; bar.setPointerCapture(e.pointerId); w.classList.add("dragging"); w.style.zIndex = ++z; });
      bar.addEventListener("pointermove", (e) => { if (!on) return; ox = e.clientX - sx; oy = e.clientY - sy; w.style.transform = `translate(${ox}px,${oy}px)`; });
      const end = () => { on = false; w.classList.remove("dragging"); };
      bar.addEventListener("pointerup", end); bar.addEventListener("pointercancel", end);
    });
  };

  /* ---------- Content ---------- */
  const ytThumb = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  const liteYT = (el, id) => {
    el.style.backgroundImage = `url(${ytThumb(id)})`;
    el.innerHTML = '<button class="play" aria-label="Play video" style="border:4px solid #fff;padding:0"></button>';
    el.addEventListener("click", () => { el.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen title="YouTube video"></iframe>`; }, { once: true });
  };
  const fmtDate = (s) => (s ? new Date(s).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "");

  const run = async () => {
    const cfg = await getJSON("data/config.json").catch(() => ({}));
    const isSet = (v) => v && !String(v).includes("YOUR_");
    $$(".cfg-name").forEach((n) => (n.textContent = cfg.name || "Ricsi"));
    const links = { youtube: cfg.youtube?.url, instagram: cfg.instagram?.url, discord: cfg.discord?.invite, github: cfg.github?.url, tiktok: cfg.tiktok?.url, twitter: cfg.twitter?.url };
    $$("[data-social]").forEach((a) => {
      const k = a.dataset.social, u = links[k];
      if (isSet(u)) { a.href = u; a.target = "_blank"; a.rel = "noopener"; return; }
      if (k === "tiktok" || k === "twitter") return a.remove();
      a.addEventListener("click", (e) => {
        e.preventDefault();
        if (k === "discord" && cfg.discord?.username) { safe(() => navigator.clipboard.writeText(cfg.discord.username)); toast("Discord: " + cfg.discord.username + " (copied)"); }
        else toast("Coming soon!");
      });
      if (!(k === "discord" && cfg.discord?.username)) a.classList.add("is-soon");
    });

    // taglines
    const tag = $("#tagline");
    if (tag && cfg.tagline?.length) {
      let i = 0, c = 0, del = false;
      const step = () => {
        const t = cfg.tagline[i];
        tag.textContent = t.slice(0, c);
        if (reduced) { tag.textContent = t; return setTimeout(() => { i = (i + 1) % cfg.tagline.length; step(); }, 2500); }
        if (!del && c < t.length) c++; else if (!del) { del = true; return setTimeout(step, 1400); } else if (c > 0) c--; else { del = false; i = (i + 1) % cfg.tagline.length; }
        setTimeout(step, del ? 35 : 70);
      }; step();
    }

    const latest = await getJSON("data/latest.json").catch(() => ({ videos: [] }));
    const all = latest.videos || [];
    const vids = all.filter((v) => !v.live);
    const lastStream = all.find((v) => v.live);

    // home: latest video
    const yt = $("#yt-slot");
    if (yt) {
      if (vids[0]) {
        const v = vids[0];
        yt.innerHTML = `<div class="lite-yt" id="lyt"></div><div class="vid-title">${esc(v.title)}</div><div class="vid-meta">${fmtDate(v.published)}</div>`;
        liteYT($("#lyt"), v.id);
      } else yt.innerHTML = `<div class="fallback-card"><div class="px" style="font-size:1.4rem">No video loaded yet</div><p>The latest upload appears here automatically once the YouTube channel ID is set.</p><a class="btn pink" href="${esc(isSet(links.youtube) ? links.youtube : "#")}" target="_blank" rel="noopener">Visit channel</a></div>`;
    }

    // home: instagram
    const ig = $("#ig-slot");
    if (ig) {
      const d = await getJSON("data/instagram.json").catch(() => ({}));
      const m = /instagram\.com\/(?:p|reel)\/([\w-]+)/.exec(d.postUrl || "");
      if (m) { ig.innerHTML = `<iframe class="ig-embed" loading="lazy" title="Latest Instagram post" src="https://www.instagram.com/p/${m[1]}/embed"></iframe>`; }
      else if (cfg.instagram?.comingSoon || !isSet(links.instagram)) ig.innerHTML = `<div class="fallback-card"><div class="px" style="font-size:1.6rem">📸 Instagram</div><div class="soon">COMING SOON</div><p>Behind-the-scenes posts are on the way.</p></div>`;
      else ig.innerHTML = `<div class="fallback-card"><div class="px" style="font-size:1.4rem">📸 @${esc(cfg.instagram.username)}</div><p>Follow along for behind-the-scenes and daily posts.</p><a class="btn pink" href="${esc(links.instagram)}" target="_blank" rel="noopener">Open Instagram</a></div>`;
    }

    // home: discord
    const dc = $("#dc-slot");
    if (dc) {
      const user = cfg.discord?.username || "";
      if (isSet(links.discord)) dc.innerHTML = `<div class="dc-box"><div class="dc-logo">D</div><div><div class="px" style="font-size:1.4rem">Join the Discord</div><span class="online" id="dc-on">community hub</span></div></div><p style="margin-top:14px">Hang out, get updates, and talk with the community.</p><a class="btn go" href="${esc(links.discord)}" target="_blank" rel="noopener">Join server</a>`;
      else dc.innerHTML = `<div class="dc-box"><div class="dc-logo">D</div><div><div class="px" style="font-size:1.4rem">Discord</div><div class="soon">SERVER COMING SOON</div></div></div><p style="margin-top:14px">My server isn't open yet. Until then, add me directly:</p><button class="btn go" id="dc-copy" type="button">@${esc(user)} · copy</button>`;
      $("#dc-copy")?.addEventListener("click", () => { safe(() => navigator.clipboard.writeText(user)); toast("Copied Discord username: " + user); });
      if (cfg.discord?.guildId) getJSON(`https://discord.com/api/guilds/${cfg.discord.guildId}/widget.json`).then((w) => { $("#dc-on").textContent = `${w.presence_count} online · ${w.name}`; }).catch(() => {});
    }

    // videos page
    const grid = $("#video-grid");
    if (grid) {
      grid.innerHTML = vids.length
        ? vids.map((v) => `<article class="win dark rv"><div class="win-bar"><span class="win-title">${esc(v.title)}</span></div><div class="win-body"><a class="card-thumb" href="https://www.youtube.com/watch?v=${v.id}" target="_blank" rel="noopener" style="background-image:url(${ytThumb(v.id)})" aria-label="${esc(v.title)}"></a><div class="vid-meta" style="color:#9aa4b8">${fmtDate(v.published)}</div></div></article>`).join("")
        : `<div class="win rv"><div class="win-bar"><span class="win-title">Empty chest</span></div><div class="win-body"><p>Videos appear once <code>data/config.json</code> has your YouTube channel ID and the update workflow has run.</p></div></div>`;
    }

    // streams: only the latest one
    const sg = $("#stream-grid");
    if (sg) {
      sg.innerHTML = lastStream
        ? `<article class="win dark rv"><div class="win-bar alt"><span class="win-title">🔴 Latest stream</span></div><div class="win-body"><a class="card-thumb" href="https://www.youtube.com/watch?v=${lastStream.id}" target="_blank" rel="noopener" style="background-image:url(${ytThumb(lastStream.id)})" aria-label="${esc(lastStream.title)}"></a><div class="vid-title" style="color:#fff">${esc(lastStream.title)}</div><div class="vid-meta" style="color:#9aa4b8">${fmtDate(lastStream.published)}</div></div></article>`
        : `<div class="win rv"><div class="win-bar alt"><span class="win-title">No streams yet</span></div><div class="win-body"><p>No streams yet. Check back soon.</p></div></div>`;
    }

    // projects page
    const pg = $("#project-grid");
    if (pg) {
      const ps = await getJSON("data/projects.json").catch(() => []);
      pg.innerHTML = ps.map((p) => `<article class="win rv"><div class="win-bar grass"><span class="win-title">${esc(p.title)}</span></div><div class="win-body"><p>${esc(p.desc)}</p><div class="tags">${(p.tags || []).map((t) => `<span class="tag-chip">${esc(t)}</span>`).join("")}</div><p style="margin-top:16px"><a class="btn go" href="${esc(p.url)}" target="_blank" rel="noopener">Open</a></p></div></article>`).join("");
    }
    requestAnimationFrame(() => { initWindows(); reveal(); });
  };

  /* ---------- Boot screen (home, once per session) ---------- */
  const boot = () => {
    if (page !== "home" || reduced || safe(() => sessionStorage.getItem("booted"))) return run();
    safe(() => sessionStorage.setItem("booted", "1"));
    const b = document.createElement("div"); b.className = "boot";
    b.innerHTML = `<div class="logo">RICSI.EXE</div><div id="bl"></div><div class="load"><i></i></div><div class="skip">click to skip</div>`;
    document.body.appendChild(b);
    const lines = ["BIOS v2.000 ... OK", "Loading chunks ... OK", "Mounting /youtube ... OK", "Compiling personality ... OK", "Welcome."];
    let n = 0, done = false;
    const finish = () => { if (done) return; done = true; b.classList.add("out"); setTimeout(() => b.remove(), 550); run(); };
    b.addEventListener("click", finish);
    const t = setInterval(() => { if (n < lines.length) { $("#bl").insertAdjacentHTML("beforeend", `<div>> ${lines[n]}</div>`); $(".load i", b).style.width = ((++n / lines.length) * 100) + "%"; } else { clearInterval(t); setTimeout(finish, 350); } }, 300);
  };
  boot();
})();

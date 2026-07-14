// ============================================
// RETSEPTLAR DUNYOSI — APP LOGIC (Supabase bilan)
// ============================================

(function () {
  "use strict";

  // ---------- SUPABASE ----------
  var SUPABASE_URL = "https://djpdfvngatsbfrenfzah.supabase.co";
  var SUPABASE_KEY = "sb_publishable_8fhNqJTTa7mCre0IBCuY8Q_2_K4rCE1";
  var sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  // ---------- STATE ----------
  var currentLang = "uz";
  var currentRecipeId = null;
  var currentUser = null;
  var currentProfile = null;
  var EXTRA_RECIPES = []; // TheMealDB'dan kelgan retseptlar
  var DB_RECIPES = [];    // Supabase'dan kelgan foydalanuvchi retseptlari

  var COUNTRY_FLAGS = {uz:"🇺🇿",it:"🇮🇹",jp:"🇯🇵",mx:"🇲🇽",fr:"🇫🇷",th:"🇹🇭",vn:"🇻🇳",ua:"🇺🇦",in:"🇮🇳",cn:"🇨🇳",kr:"🇰🇷",tr:"🇹🇷",es:"🇪🇸",de:"🇩🇪",us:"🇺🇸"};
  var COUNTRY_LABELS_UZ = {uz:"O'zbekiston",it:"Italiya",jp:"Yaponiya",mx:"Meksika",fr:"Frantsiya",th:"Tailand",vn:"Vetnam",ua:"Ukraina",in:"Hindiston",cn:"Xitoy",kr:"Koreya",tr:"Turkiya",es:"Ispaniya",de:"Germaniya",us:"Amerika"};

  // ---------- INIT ----------
  document.addEventListener("DOMContentLoaded", init);

  function init() {
    setTimeout(hideLoader, 700);

    bindNav();
    bindSearch();
    bindLangSwitch();
    bindBack();
    bindReviewForm();

    initAuth().then(function () {
      loadDbRecipes().then(function () {
        renderPicks();
        renderAllRecipes();
        applyLanguage(currentLang);

        // Agar URL'da ?recipe=ID bo'lsa, o'sha retseptni avtomatik ochamiz
        var params = new URLSearchParams(window.location.search);
        var recipeParam = params.get("recipe");
        if (recipeParam) {
          openDetail("db-" + recipeParam);
        }
      });
    });
  }

  function hideLoader() {
    var loader = document.getElementById("loaderOverlay");
    if (loader) loader.classList.add("hidden");
  }

  // ---------- AUTH ----------
  function initAuth() {
    return sb.auth.getUser().then(function (res) {
      currentUser = res.data.user;
      if (currentUser) {
        return sb.from("profiles").select("*").eq("id", currentUser.id).single().then(function (res2) {
          currentProfile = res2.data;
          renderAuthLoggedIn();
        });
      } else {
        renderAuthLoggedOut();
      }
    });
  }

  function renderAuthLoggedIn() {
    document.getElementById("addRecipeBtn").style.display = "inline-block";

    // Notification belgisini ko'rsatish
    var notifLink = document.getElementById("notifLink");
    if (notifLink) notifLink.style.display = "block";

    // O'qilmagan notificationlar sonini olish
    sb.from("notifications").select("id", { count: "exact" }).eq("user_id", currentUser.id).eq("is_read", false).then(function(res) {
      var count = res.count || 0;
      var badge = document.getElementById("notifBadge");
      if (badge && count > 0) {
        badge.style.display = "flex";
        badge.textContent = count > 9 ? "9+" : count;
      }
    });

    var avatarUrl = (currentProfile && currentProfile.avatar_url) || ("https://api.dicebear.com/7.x/initials/svg?seed=" + ((currentProfile && currentProfile.username) || "U"));
    document.getElementById("authArea").innerHTML =
      '<div style="position:relative;">' +
        '<div id="avatarToggle" style="width:36px;height:36px;border-radius:50%;overflow:hidden;border:2px solid var(--saffron);cursor:pointer;">' +
          '<img src="' + avatarUrl + '" style="width:100%;height:100%;object-fit:cover;">' +
        '</div>' +
        '<div id="authDropdown" style="position:absolute;top:calc(100% + 8px);right:0;background:var(--cream);border-radius:8px;box-shadow:0 8px 32px rgba(28,18,11,0.18);border:1px solid rgba(42,24,16,0.08);min-width:170px;overflow:hidden;display:none;z-index:200;">' +
          '<button onclick="location.href=\'profile.html\'" style="display:flex;align-items:center;gap:8px;padding:12px 16px;font-size:0.86rem;width:100%;text-align:left;border:none;background:none;cursor:pointer;color:var(--ink);font-family:var(--font-body);">👤 Profil</button>' +
          '<button onclick="location.href=\'notifications.html\'" style="display:flex;align-items:center;gap:8px;padding:12px 16px;font-size:0.86rem;width:100%;text-align:left;border:none;background:none;cursor:pointer;color:var(--ink);font-family:var(--font-body);">🔔 Bildirishnomalar</button>' +
          '<button onclick="window.__signOut()" style="display:flex;align-items:center;gap:8px;padding:12px 16px;font-size:0.86rem;width:100%;text-align:left;border:none;background:none;cursor:pointer;color:var(--tomato);font-family:var(--font-body);">🚪 Chiqish</button>' +
        '</div>' +
      '</div>';

    document.getElementById("avatarToggle").addEventListener("click", function(e) {
      e.stopPropagation();
      var dd = document.getElementById("authDropdown");
      dd.style.display = dd.style.display === "none" ? "block" : "none";
    });

    document.addEventListener("click", function() {
      var dd = document.getElementById("authDropdown");
      if (dd) dd.style.display = "none";
    });
  }

  function renderAuthLoggedOut() {
    document.getElementById("authArea").innerHTML =
      '<a href="login.html"><button class="lang-btn">Kirish</button></a>';
  }

  window.__signOut = function () {
    sb.auth.signOut().then(function () { window.location.reload(); });
  };

  // ---------- SUPABASE RETSEPTLARNI YUKLASH ----------
  function loadDbRecipes() {
    return sb.from("recipes").select("*, profiles(username, avatar_url, full_name)").order("created_at", { ascending: false }).then(function (res) {
      var rows = res.data || [];
      DB_RECIPES = rows.map(function (r) {
        var ingredients = (r.ingredients || "").split("\n").filter(function (s) { return s.trim(); });
        var steps = (r.steps || "").split("\n").filter(function (s) { return s.trim(); });
        var name = { uz: r.title, ru: r.title, en: r.title };
        var authorName = (r.profiles && r.profiles.username) || "Oshpaz";
        var tagline = { uz: authorName + " retsepti", ru: "Рецепт от " + authorName, en: "Recipe by " + authorName };
        return {
          id: "db-" + r.id,
          dbId: r.id,
          userId: r.user_id,
          flag: COUNTRY_FLAGS[r.country] || "🌍",
          image: r.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80",
          video_url: r.video_url || null,
          name: name,
          tagline: tagline,
          ingredients: { uz: ingredients, ru: ingredients, en: ingredients },
          steps: { uz: steps, ru: steps, en: steps },
          time: null,
          servings: null,
          difficulty: { uz: "—", ru: "—", en: "—" },
          country: r.country,
          rating_sum: r.rating_sum || 0,
          rating_count: r.rating_count || 0,
          views: r.views || 0,
          likes_count: r.likes_count || 0,
          authorName: authorName,
          fromDB: true
        };
      });
    });
  }

  // ---------- RATING HELPERS ----------
  // Mahalliy (data.js) retseptlar uchun — eski statik baho
  // DB retseptlar uchun — Supabase'dagi rating_sum/rating_count
  function getAverage(recipe) {
    if (recipe.fromDB) {
      return recipe.rating_count ? (recipe.rating_sum / recipe.rating_count) : 0;
    }
    if (recipe.fromAPI) {
      return recipe.rating || 0;
    }
    return recipe.rating || 0;
  }

  // ---------- RENDER: PICKS (Hero "Kun taomlari") ----------
  function renderPicks() {
    var picks = [RECIPES[0], RECIPES[1], RECIPES[2]];
    var grid = document.getElementById("picksGrid");
    grid.innerHTML = picks.map(function (r) {
      var avg = getAverage(r).toFixed(1);
      return (
        '<div class="pick-card" data-id="' + r.id + '">' +
          '<img src="' + r.image + '" alt="' + r.name[currentLang] + '" loading="lazy">' +
          '<div class="pick-overlay"></div>' +
          '<div class="pick-rating">★ ' + avg + '</div>' +
          '<div class="pick-flag">' + r.flag + '</div>' +
          '<div class="pick-info">' +
            '<div class="pick-name">' + r.name[currentLang] + '</div>' +
            '<div class="pick-meta">' + r.time + ' ' + UI_TEXT[currentLang].minutes + ' · ' + COUNTRY_NAMES[r.country][currentLang] + '</div>' +
          '</div>' +
        '</div>'
      );
    }).join("");

    grid.querySelectorAll(".pick-card").forEach(function (card) {
      card.addEventListener("click", function () {
        openDetail(card.getAttribute("data-id"));
      });
    });
  }

  // ---------- RENDER: ALL RECIPES GRID ----------
  // DB retseptlar (foydalanuvchilar qo'shgan) + mahalliy retseptlar birga ko'rsatiladi
  function renderAllRecipes(filterList) {
    var list = filterList || DB_RECIPES.concat(RECIPES);
    var grid = document.getElementById("recipesGrid");

    if (list.length === 0) {
      grid.innerHTML = '<div class="no-reviews" style="grid-column:1/-1; text-align:center; padding:40px 0;">' + UI_TEXT[currentLang].noResults + '</div>';
      return;
    }

    grid.innerHTML = list.map(function (r) {
      var avg = getAverage(r).toFixed(1);
      var timeLabel = r.time != null ? (r.time + " " + UI_TEXT[currentLang].minutes) : "";
      var dbBadge = r.fromDB ? '<span style="background:var(--basil);color:white;font-size:0.65rem;padding:2px 8px;border-radius:4px;font-weight:700;margin-left:6px;">USER</span>' : "";
      return (
        '<div class="recipe-card" data-id="' + r.id + '">' +
          '<div class="recipe-card-img">' +
            '<img src="' + r.image + '" alt="' + r.name[currentLang] + '" loading="lazy">' +
            '<div class="recipe-card-flag">' + r.flag + '</div>' +
          '</div>' +
          '<div class="recipe-card-body">' +
            '<div class="recipe-card-name">' + r.name[currentLang] + dbBadge + '</div>' +
            '<div class="recipe-card-tagline">' + r.tagline[currentLang] + '</div>' +
            '<div class="recipe-card-footer">' +
              '<span>' + (r.fromDB ? '👁 ' + (r.views || 0) : timeLabel) + '</span>' +
              '<span class="recipe-card-stars">★ ' + avg + '</span>' +
            '</div>' +
          '</div>' +
        '</div>'
      );
    }).join("");

    grid.querySelectorAll(".recipe-card").forEach(function (card) {
      card.addEventListener("click", function () {
        openDetail(card.getAttribute("data-id"));
      });
    });
  }

  // ---------- SEARCH ----------
  var apiResultsCache = {};
  var currentSearchToken = 0;

  function bindSearch() {
    var input = document.getElementById("searchInput");
    var dropdown = document.getElementById("searchDropdown");
    var clearBtn = document.getElementById("searchClear");
    var goBtn = document.getElementById("searchGo");
    var spinner = document.getElementById("miniSpinner");
    var debounceTimer = null;

    input.addEventListener("input", function () {
      var val = input.value.trim();
      clearBtn.classList.toggle("visible", val.length > 0);

      if (debounceTimer) clearTimeout(debounceTimer);

      if (val.length === 0) {
        dropdown.classList.remove("open");
        renderAllRecipes();
        return;
      }

      spinner.classList.add("active");
      debounceTimer = setTimeout(function () {
        runSearch(val);
      }, 350);
    });

    input.addEventListener("focus", function () {
      if (input.value.trim().length > 0) dropdown.classList.add("open");
    });

    document.addEventListener("click", function (e) {
      if (!dropdown.contains(e.target) && e.target !== input) {
        dropdown.classList.remove("open");
      }
    });

    clearBtn.addEventListener("click", function () {
      input.value = "";
      clearBtn.classList.remove("visible");
      dropdown.classList.remove("open");
      renderAllRecipes();
      input.focus();
    });

    goBtn.addEventListener("click", function () {
      if (debounceTimer) clearTimeout(debounceTimer);
      var val = input.value.trim();
      dropdown.classList.remove("open");
      if (val.length > 0) runSearch(val);
      document.getElementById("allRecipesSection").scrollIntoView({ behavior: "smooth" });
    });

    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        if (debounceTimer) clearTimeout(debounceTimer);
        var val = input.value.trim();
        dropdown.classList.remove("open");
        if (val.length > 0) runSearch(val);
        document.getElementById("allRecipesSection").scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  function runSearch(query) {
    var spinner = document.getElementById("miniSpinner");
    var token = ++currentSearchToken;

    var localResults = searchLocalRecipes(query);
    var dbResults = searchDbRecipes(query);
    var combinedLocal = dbResults.concat(localResults);

    renderDropdown(combinedLocal, true);
    renderAllRecipes(combinedLocal);

    var cacheKey = query.toLowerCase() + "::" + currentLang;
    if (apiResultsCache[cacheKey]) {
      spinner.classList.remove("active");
      var combined = combinedLocal.concat(apiResultsCache[cacheKey]);
      renderDropdown(combined);
      renderAllRecipes(combined);
      return;
    }

    RecipeAPI.searchMealDB(query).then(function (meals) {
      if (token !== currentSearchToken) return;
      if (!meals || meals.length === 0) {
        spinner.classList.remove("active");
        if (combinedLocal.length === 0) {
          renderDropdown([]);
          renderAllRecipes([]);
        }
        return;
      }

      var toBuild = meals.slice(0, 9);
      Promise.all(toBuild.map(function (meal) {
        return RecipeAPI.buildLocalizedRecipe(meal, currentLang);
      })).then(function (builtRecipes) {
        if (token !== currentSearchToken) return;
        spinner.classList.remove("active");
        apiResultsCache[cacheKey] = builtRecipes;
        builtRecipes.forEach(function (r) {
          if (!findRecipe(r.id)) EXTRA_RECIPES.push(r);
        });
        var combined = combinedLocal.concat(builtRecipes);
        renderDropdown(combined);
        renderAllRecipes(combined);
      });
    }).catch(function () {
      if (token !== currentSearchToken) return;
      spinner.classList.remove("active");
    });
  }

  function searchLocalRecipes(query) {
    var q = query.toLowerCase();
    return RECIPES.filter(function (r) {
      var nameMatch = Object.values(r.name).some(function (n) { return n.toLowerCase().indexOf(q) !== -1; });
      var countryMatch = Object.values(COUNTRY_NAMES[r.country]).some(function (n) { return n.toLowerCase().indexOf(q) !== -1; });
      return nameMatch || countryMatch;
    });
  }

  function searchDbRecipes(query) {
    var q = query.toLowerCase();
    return DB_RECIPES.filter(function (r) {
      return r.name.uz.toLowerCase().indexOf(q) !== -1;
    });
  }

  function renderDropdown(results, stillLoading) {
    var dropdown = document.getElementById("searchDropdown");
    if (results.length === 0 && !stillLoading) {
      dropdown.innerHTML = '<div class="dropdown-empty">' + UI_TEXT[currentLang].noResults + '</div>';
    } else if (results.length === 0 && stillLoading) {
      dropdown.innerHTML = '<div class="dropdown-empty">' + UI_TEXT[currentLang].loading + '</div>';
    } else {
      dropdown.innerHTML = results.slice(0, 8).map(function (r) {
        return (
          '<div class="dropdown-item" data-id="' + r.id + '">' +
            '<img src="' + r.image + '" alt="">' +
            '<span class="dropdown-item-name">' + r.name[currentLang] + '</span>' +
            '<span class="dropdown-item-flag">' + r.flag + '</span>' +
          '</div>'
        );
      }).join("");

      dropdown.querySelectorAll(".dropdown-item").forEach(function (item) {
        item.addEventListener("click", function () {
          openDetail(item.getAttribute("data-id"));
          dropdown.classList.remove("open");
        });
      });
    }
    dropdown.classList.add("open");
  }

  // ---------- LANGUAGE SWITCH ----------
  function bindLangSwitch() {
    document.querySelectorAll(".lang-btn[data-lang]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var lang = btn.getAttribute("data-lang");
        if (lang === currentLang) return;
        currentLang = lang;
        document.querySelectorAll(".lang-btn[data-lang]").forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        document.documentElement.lang = lang;
        applyLanguage(lang);
        renderPicks();
        renderAllRecipes();
        if (currentRecipeId) renderDetail(currentRecipeId);
      });
    });
  }

  function applyLanguage(lang) {
    var t = UI_TEXT[lang];
    document.title = t.siteTitle + " — " + t.heroTitle;
    setText("heroEyebrow", "★ 9 " + (lang === "uz" ? "mamlakat • Yuzlab retseptlar" : lang === "ru" ? "стран • Сотни рецептов" : "countries • Hundreds of recipes"));
    document.getElementById("heroTitle").innerHTML = formatHeroTitle(lang);
    setText("heroSubtitle", t.heroSubtitle);
    document.getElementById("searchInput").placeholder = t.searchPlaceholder;
    setText("picksLabel", t.todaysPicks);
    setText("allEyebrow", lang === "uz" ? "Katalog" : lang === "ru" ? "Каталог" : "Catalog");
    setText("allRecipesTitle", t.allRecipes);
    setText("footerText", t.footerText);
    setText("backBtnText", t.backToResults);
    setText("ingredientsTitle", t.ingredients);
    setText("stepsTitle", t.steps);
    setText("reviewsTitle", t.reviews);
    setText("addReviewTitle", t.addReview);
    setText("rateThisLabel", t.rateThis);
    setText("voteFeedback", t.voted);
    document.getElementById("reviewText").placeholder = t.yourReview;
    setText("reviewSubmitBtn", t.submit);
    setText("loaderText", t.loading);
    setText("detailEyebrow", lang === "uz" ? "Retsept" : lang === "ru" ? "Рецепт" : "Recipe");
    setText("detailTimeLabel", lang === "uz" ? "Daqiqa" : lang === "ru" ? "Минут" : "Minutes");
    setText("detailServingsLabel", t.servings.charAt(0).toUpperCase() + t.servings.slice(1));
    setText("detailDifficultyLabel", t.difficulty);

    // + Retsept tugmasi
    var addBtn = document.querySelector("#addRecipeBtn button");
    if (addBtn) addBtn.textContent = lang === "uz" ? "+ Retsept qo'shish" : lang === "ru" ? "+ Добавить рецепт" : "+ Add Recipe";

    // Navbar auth matnlari
    var profileBtn = document.querySelector("#authDropdown button:first-child");
    var signOutBtn = document.querySelector("#authDropdown button:last-child");
    if (profileBtn) profileBtn.innerHTML = lang === "uz" ? "👤 Profil" : lang === "ru" ? "👤 Профиль" : "👤 Profile";
    if (signOutBtn) signOutBtn.innerHTML = lang === "uz" ? "🚪 Chiqish" : lang === "ru" ? "🚪 Выйти" : "🚪 Sign out";

    // Kirish/Ro'yxatdan o'tish tugmalari (login qilmagan holda)
    var loginBtns = document.querySelectorAll("#authArea a button");
    if (loginBtns.length === 2) {
      loginBtns[0].textContent = lang === "uz" ? "Kirish" : lang === "ru" ? "Войти" : "Sign in";
      loginBtns[1].textContent = lang === "uz" ? "Ro'yxatdan o'tish" : lang === "ru" ? "Регистрация" : "Sign up";
    }

    // localStorage'ga til saqlash
    localStorage.setItem("lang", lang);
  }

  function formatHeroTitle(lang) {
    if (lang === "uz") return 'Dunyo oshxonasi <em>bir qadamda</em>';
    if (lang === "ru") return 'Кухня мира <em>в одном клике</em>';
    return 'World cuisine, <em>one click away</em>';
  }

  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  // ---------- DETAIL VIEW ----------
  function openDetail(id) {
    currentRecipeId = id;
    renderDetail(id);
    document.getElementById("mainView").style.display = "none";
    document.getElementById("detailView").classList.add("open");
    document.getElementById("navbar").classList.add("scrolled");
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });

    // Ko'rishlar sonini oshirish (faqat DB retseptlar uchun)
    var r = findRecipe(id);
    if (r && r.fromDB) {
      sb.from("recipes").update({ views: (r.views || 0) + 1 }).eq("id", r.dbId).then(function() {
        r.views = (r.views || 0) + 1;
      });
    }
  }

  function closeDetail() {
    document.getElementById("detailView").classList.remove("open");
    document.getElementById("mainView").style.display = "";
    currentRecipeId = null;
    if (window.scrollY <= 40) {
      document.getElementById("navbar").classList.remove("scrolled");
    }
  }

  function bindBack() {
    document.getElementById("backBtn").addEventListener("click", closeDetail);
  }

  function findRecipe(id) {
    var db = DB_RECIPES.filter(function (r) { return r.id === id; })[0];
    if (db) return db;
    var local = RECIPES.filter(function (r) { return r.id === id; })[0];
    if (local) return local;
    return EXTRA_RECIPES.filter(function (r) { return r.id === id; })[0];
  }

  function renderDetail(id) {
    var r = findRecipe(id);
    if (!r) return;
    var lang = currentLang;
    var t = UI_TEXT[lang];

    document.getElementById("detailImg").src = r.image;
    document.getElementById("detailImg").alt = r.name[lang];

    // Video tugmasi (faqat DB retseptlar uchun)
    var existingVideo = document.getElementById("detailVideo");
    var existingVideoBtn = document.getElementById("detailVideoBtn");
    if (existingVideo) existingVideo.remove();
    if (existingVideoBtn) existingVideoBtn.remove();

    if (r.fromDB && r.video_url) {
      var videoBtn = document.createElement("button");
      videoBtn.id = "detailVideoBtn";
      videoBtn.innerHTML = "🎬 Videoni ko'rish";
      videoBtn.style.cssText = "margin-top:14px; padding:12px 24px; background:var(--tomato); color:white; border:none; border-radius:8px; font-weight:700; font-size:0.95rem; cursor:pointer; display:block; width:100%;";
      var videoUrl = r.video_url;
      videoBtn.onclick = function() {
        var existVid = document.getElementById("detailVideo");
        if (existVid) {
          existVid.remove();
          videoBtn.innerHTML = "🎬 Videoni ko'rish";
          return;
        }
        var vid = document.createElement("video");
        vid.id = "detailVideo";
        vid.src = videoUrl;
        vid.controls = true;
        vid.autoplay = true;
        vid.style.cssText = "width:100%; max-height:500px; border-radius:8px; margin-top:12px; background:#000; display:block;";
        videoBtn.parentElement.insertBefore(vid, videoBtn.nextSibling);
        videoBtn.innerHTML = "✕ Videoni yopish";
      };
      document.getElementById("detailImg").parentElement.appendChild(videoBtn);
    }
    document.getElementById("detailFlagEmoji").textContent = r.flag;

    var countryLabel = r.fromAPI ? (r.country || "—") : (COUNTRY_NAMES[r.country] ? COUNTRY_NAMES[r.country][lang] : (COUNTRY_LABELS_UZ[r.country] || "—"));
    document.getElementById("detailCountryName").textContent = countryLabel;

    document.getElementById("detailTitle").textContent = r.name[lang];
    document.getElementById("detailTagline").textContent = r.tagline[lang];
    document.getElementById("detailTime").textContent = r.time != null ? r.time : "—";
    document.getElementById("detailServings").textContent = r.servings != null ? r.servings : "—";
    document.getElementById("detailDifficulty").textContent = r.difficulty[lang];

    // Obuna tugmasi (faqat DB retseptlar uchun, o'z retsepti emas)
    var existFollowBtn = document.getElementById("followBtn");
    if (existFollowBtn) existFollowBtn.remove();

    if (r.fromDB && currentUser && r.userId !== currentUser.id) {
      var followBtn = document.createElement("button");
      followBtn.id = "followBtn";
      followBtn.style.cssText = "margin-top:14px; padding:10px 22px; border-radius:8px; font-weight:700; font-size:0.88rem; cursor:pointer; border:2px solid var(--saffron); background:transparent; color:var(--ink);";

      var followText = { uz: "Kuzatish", ru: "Подписаться", en: "Follow" };
      var followingText = { uz: "✓ Kuzatilmoqda", ru: "✓ Подписан", en: "✓ Following" };

      sb.from("follows").select("id").eq("follower_id", currentUser.id).eq("following_id", r.userId).single().then(function(res) {
        if (res.data) {
          followBtn.innerHTML = followingText[lang];
          followBtn.style.background = "var(--saffron)";
          followBtn.style.color = "white";
        } else {
          followBtn.innerHTML = followText[lang];
        }
      });

      followBtn.onclick = function() {
        if (!currentUser) { window.location.href = "login.html"; return; }
        sb.from("follows").select("id").eq("follower_id", currentUser.id).eq("following_id", r.userId).single().then(function(res) {
          if (res.data) {
            sb.from("follows").delete().eq("follower_id", currentUser.id).eq("following_id", r.userId).then(function() {
              followBtn.innerHTML = followText[lang];
              followBtn.style.background = "transparent";
              followBtn.style.color = "var(--ink)";
              showToast(lang === "uz" ? "Obuna bekor qilindi" : lang === "ru" ? "Подписка отменена" : "Unfollowed");
            });
          } else {
            sb.from("follows").insert({ follower_id: currentUser.id, following_id: r.userId }).then(function() {
              followBtn.innerHTML = followingText[lang];
              followBtn.style.background = "var(--saffron)";
              followBtn.style.color = "white";
              showToast(lang === "uz" ? "Obuna bo'ldingiz! 🎉" : lang === "ru" ? "Вы подписались! 🎉" : "Following! 🎉");
            });
          }
        });
      };

      document.getElementById("detailTagline").parentElement.insertBefore(followBtn, document.getElementById("detailTagline").nextSibling);
    }

    document.getElementById("ingredientsList").innerHTML = r.ingredients[lang].map(function (ing) {
      return "<li>" + ing + "</li>";
    }).join("");

    document.getElementById("stepsList").innerHTML = r.steps[lang].map(function (step) {
      return "<li><span>" + step + "</span></li>";
    }).join("");

    // Like tugmasi (faqat DB retseptlar uchun)
    var existLikeBtn = document.getElementById("likeBtn");
    if (existLikeBtn) existLikeBtn.remove();

    if (r.fromDB) {
      var likeBtn = document.createElement("button");
      likeBtn.id = "likeBtn";
      likeBtn.style.cssText = "margin-top:10px; margin-right:10px; padding:10px 20px; border-radius:8px; font-weight:700; font-size:0.88rem; cursor:pointer; border:2px solid rgba(42,24,16,0.16); background:transparent; color:var(--ink); display:inline-flex; align-items:center; gap:8px;";
      likeBtn.innerHTML = "🤍 " + (r.likes_count || 0);

      if (currentUser) {
        sb.from("likes").select("id").eq("recipe_id", r.dbId).eq("user_id", currentUser.id).single().then(function(res) {
          if (res.data) {
            likeBtn.innerHTML = "❤️ " + (r.likes_count || 0);
            likeBtn.style.borderColor = "var(--tomato)";
            likeBtn.style.color = "var(--tomato)";
          }
        });
      }

      var likeCount = r.likes_count || 0;
      likeBtn.onclick = function() {
        if (!currentUser) { window.location.href = "login.html"; return; }
        sb.from("likes").select("id").eq("recipe_id", r.dbId).eq("user_id", currentUser.id).single().then(function(res) {
          if (res.data) {
            sb.from("likes").delete().eq("recipe_id", r.dbId).eq("user_id", currentUser.id).then(function() {
              likeCount = Math.max(0, likeCount - 1);
              r.likes_count = likeCount;
              sb.from("recipes").update({ likes_count: likeCount }).eq("id", r.dbId).then(function(){});
              likeBtn.innerHTML = "🤍 " + likeCount;
              likeBtn.style.borderColor = "rgba(42,24,16,0.16)";
              likeBtn.style.color = "var(--ink)";
            });
          } else {
            sb.from("likes").insert({ recipe_id: r.dbId, user_id: currentUser.id }).then(function() {
              likeCount = likeCount + 1;
              r.likes_count = likeCount;
              sb.from("recipes").update({ likes_count: likeCount }).eq("id", r.dbId).then(function(){});
              likeBtn.innerHTML = "❤️ " + likeCount;
              likeBtn.style.borderColor = "var(--tomato)";
              likeBtn.style.color = "var(--tomato)";
              if (r.userId !== currentUser.id) {
                sb.from("notifications").insert({
                  user_id: r.userId,
                  from_user_id: currentUser.id,
                  type: "like",
                  recipe_id: r.dbId
                }).then(function(){});
              }
            });
          }
        });
      };

      document.getElementById("detailTagline").parentElement.insertBefore(likeBtn, document.getElementById("detailTagline").nextSibling);
    }

    var ratingBlock = document.getElementById("ratingBlock");
    var reviewForm = document.getElementById("reviewFormWrap");

    if (r.fromDB) {
      ratingBlock.style.display = "";
      reviewForm.style.display = "";
      renderDbStars(r);
      renderDbReviews(r);
    } else {
      ratingBlock.style.display = "none";
      reviewForm.style.display = "none";
      document.getElementById("reviewsList").innerHTML = '<div class="no-reviews">' + (lang === "uz" ? "Bu retsept uchun fikrlar mavjud emas" : lang === "ru" ? "Отзывы недоступны для этого рецепта" : "Reviews unavailable for this recipe") + '</div>';
    }

    document.title = r.name[lang] + " — " + t.siteTitle;
  }

  // ---------- DB STAR RATING (faqat fromDB retseptlar uchun) ----------
  function renderDbStars(recipe) {
    var row = document.getElementById("starsRow");
    row.innerHTML = "";

    for (var i = 1; i <= 5; i++) {
      var btn = document.createElement("button");
      btn.className = "star-btn";
      btn.textContent = "★";
      btn.setAttribute("data-value", i);
      (function (starValue) {
        btn.addEventListener("mouseenter", function () { highlightStars(row, starValue); });
        btn.addEventListener("click", function () { castDbVote(recipe, starValue); });
      })(i);
      row.appendChild(btn);
    }

    row.addEventListener("mouseleave", function () { highlightStars(row, 0); });
    document.getElementById("voteFeedback").classList.remove("show");

    if (!currentUser) {
      row.innerHTML = '<span style="font-size:0.85rem; color:rgba(42,24,16,0.5);">Baholash uchun <a href="login.html" style="color:var(--tomato); font-weight:600;">kiring</a></span>';
    }
  }

  function castDbVote(recipe, stars) {
    if (!currentUser) { window.location.href = "login.html"; return; }

    sb.from("ratings").select("*").eq("recipe_id", recipe.dbId).eq("user_id", currentUser.id).single().then(function (res) {
      if (res.data) {
        showToast(currentLang === "uz" ? "Siz allaqachon baho bergansiz" : currentLang === "ru" ? "Вы уже оценили" : "You already rated this");
        return;
      }

      sb.from("ratings").insert({ recipe_id: recipe.dbId, user_id: currentUser.id, stars: stars }).then(function (insertRes) {
        if (insertRes.error) {
          showToast("Xato: " + insertRes.error.message);
          return;
        }
        var newSum = (recipe.rating_sum || 0) + stars;
        var newCount = (recipe.rating_count || 0) + 1;
        sb.from("recipes").update({ rating_sum: newSum, rating_count: newCount }).eq("id", recipe.dbId).then(function () {
          recipe.rating_sum = newSum;
          recipe.rating_count = newCount;
          highlightStars(document.getElementById("starsRow"), stars);
          document.getElementById("voteFeedback").classList.add("show");
          showToast(UI_TEXT[currentLang].voted);
          renderAllRecipes();
        });
      });
    });
  }

  function highlightStars(row, count) {
    var stars = row.querySelectorAll(".star-btn");
    stars.forEach(function (s, idx) {
      s.classList.toggle("filled", idx < count);
    });
  }

  // ---------- DB REVIEWS (faqat fromDB retseptlar uchun) ----------
  function renderDbReviews(recipe) {
    var list = document.getElementById("reviewsList");
    list.innerHTML = '<div class="spinner" style="width:24px;height:24px;"></div>';

    sb.from("reviews_with_profiles").select("*").eq("recipe_id", recipe.dbId).order("created_at", { ascending: false }).then(function (res) {
      var reviews = res.data || [];
      if (reviews.length === 0) {
        list.innerHTML = '<div class="no-reviews">' + UI_TEXT[currentLang].noReviewsYet + '</div>';
        return;
      }
      list.innerHTML = reviews.map(function (rv) {
        var name = (rv.profiles && rv.profiles.username) || "Foydalanuvchi";
        return (
          '<div class="review-card">' +
            '<div class="review-card-head">' +
              '<span class="review-card-name">' + escapeHtml(name) + '</span>' +
            '</div>' +
            '<div class="review-card-text">' + escapeHtml(rv.text) + '</div>' +
          '</div>'
        );
      }).join("");
    });
  }

  function bindReviewForm() {
    document.getElementById("reviewSubmitBtn").addEventListener("click", function () {
      if (!currentUser) { window.location.href = "login.html"; return; }

      var textInput = document.getElementById("reviewText");
      var text = textInput.value.trim();

      if (!currentRecipeId) return;
      var recipe = findRecipe(currentRecipeId);
      if (!recipe || !recipe.fromDB) return;

      if (!text) {
        showToast(currentLang === "uz" ? "Iltimos, fikringizni yozing" : currentLang === "ru" ? "Пожалуйста, напишите отзыв" : "Please write your review");
        return;
      }

      sb.from("reviews").insert({ recipe_id: recipe.dbId, user_id: currentUser.id, text: text }).then(function (res) {
        if (res.error) {
          showToast("Xato: " + res.error.message);
          return;
        }
        textInput.value = "";
        renderDbReviews(recipe);
        showToast(currentLang === "uz" ? "Fikringiz uchun rahmat! 🎉" : currentLang === "ru" ? "Спасибо за отзыв! 🎉" : "Thanks for your review! 🎉");
      });
    });
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // ---------- NAVBAR SCROLL ----------
  function bindNav() {
    var nav = document.getElementById("navbar");
    window.addEventListener("scroll", function () {
      if (window.scrollY > 40) nav.classList.add("scrolled");
      else nav.classList.remove("scrolled");
    });
  }

  // ---------- TOAST ----------
  var toastTimer = null;
  function showToast(message) {
    var toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("show");
    }, 3200);
  }

})();

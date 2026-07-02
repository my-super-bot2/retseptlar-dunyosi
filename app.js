// ============================================
// RETSEPTLAR DUNYOSI — APP LOGIC
// ============================================

(function () {
  "use strict";

  // ---------- STATE ----------
  let currentLang = "uz";
  let currentRecipeId = null;
  let userVotes = JSON.parse(localStorageGet("rd_votes")) || {}; // recipeId -> stars given by user
  let userReviews = JSON.parse(localStorageGet("rd_reviews")) || {}; // recipeId -> [reviews]
  let liveRatings = JSON.parse(localStorageGet("rd_ratings")) || {}; // recipeId -> {sum, count}
  let pendingFormStars = 0;
  let EXTRA_RECIPES = []; // TheMealDB'dan topilib, tarjima qilingan retseptlar shu yerga qo'shiladi

  // Safe localStorage wrapper (artifacts/sandboxed contexts may block it)
  function localStorageGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function localStorageSet(key, val) {
    try { localStorage.setItem(key, val); } catch (e) { /* ignore */ }
  }

  // ---------- INIT ----------
  document.addEventListener("DOMContentLoaded", init);

  function init() {
    // simulate brief loading for the spinner to be seen, then reveal
    setTimeout(hideLoader, 700);

    renderPicks();
    renderAllRecipes();
    applyLanguage(currentLang);
    bindNav();
    bindSearch();
    bindLangSwitch();
    bindBack();
    bindReviewForm();
    bindAISection();

    setTimeout(function () {
      showToast(UI_TEXT[currentLang].welcomeToast);
    }, 1200);
  }

  function hideLoader() {
    var loader = document.getElementById("loaderOverlay");
    if (loader) loader.classList.add("hidden");
  }

  // ---------- NAVBAR SCROLL ----------
  function bindNav() {
    var nav = document.getElementById("navbar");
    window.addEventListener("scroll", function () {
      if (window.scrollY > 40) nav.classList.add("scrolled");
      else nav.classList.remove("scrolled");
    });
  }

  // ---------- RATING HELPERS ----------
  function getRatingData(recipe) {
    var stored = liveRatings[recipe.id];
    if (stored) return stored;
    // seed from base data
    return { sum: recipe.rating * recipe.votes, count: recipe.votes };
  }

  function getAverage(recipe) {
    var d = getRatingData(recipe);
    return d.count ? (d.sum / d.count) : 0;
  }

  function castVote(recipe, stars) {
    var d = getRatingData(recipe);
    if (userVotes[recipe.id]) {
      // update existing vote
      d.sum = d.sum - userVotes[recipe.id] + stars;
    } else {
      d.sum += stars;
      d.count += 1;
    }
    userVotes[recipe.id] = stars;
    liveRatings[recipe.id] = d;
    localStorageSet("rd_votes", JSON.stringify(userVotes));
    localStorageSet("rd_ratings", JSON.stringify(liveRatings));
  }

  // ---------- RENDER: PICKS (Hero "Kun taomlari") ----------
  function renderPicks() {
    var picks = [RECIPES[0], RECIPES[1], RECIPES[2]]; // osh, pizza, sushi as featured
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
  function renderAllRecipes(filterList) {
    var list = filterList || RECIPES;
    var grid = document.getElementById("recipesGrid");

    if (list.length === 0) {
      grid.innerHTML = '<div class="no-reviews" style="grid-column:1/-1; text-align:center; padding:40px 0;">' + UI_TEXT[currentLang].noResults + '</div>';
      return;
    }

    grid.innerHTML = list.map(function (r) {
      var avg = getAverage(r).toFixed(1);
      var timeLabel = r.time != null ? (r.time + " " + UI_TEXT[currentLang].minutes) : "";
      return (
        '<div class="recipe-card" data-id="' + r.id + '">' +
          '<div class="recipe-card-img">' +
            '<img src="' + r.image + '" alt="' + r.name[currentLang] + '" loading="lazy">' +
            '<div class="recipe-card-flag">' + r.flag + '</div>' +
          '</div>' +
          '<div class="recipe-card-body">' +
            '<div class="recipe-card-name">' + r.name[currentLang] + '</div>' +
            '<div class="recipe-card-tagline">' + r.tagline[currentLang] + '</div>' +
            '<div class="recipe-card-footer">' +
              '<span>' + timeLabel + '</span>' +
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
  var apiResultsCache = {}; // query -> array of built recipe objects (per session)
  var currentSearchToken = 0; // eskirgan so'rovlarni bekor qilish uchun

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

  // Asosiy qidiruv: avval mahalliy 10 taom, keyin TheMealDB (internet bazasi)
  function runSearch(query) {
    var spinner = document.getElementById("miniSpinner");
    var token = ++currentSearchToken;

    var localResults = searchLocalRecipes(query);

    // Avval mahalliy natijalarni darhol ko'rsatamiz (tez javob)
    renderDropdown(localResults, true);
    renderAllRecipes(localResults, true);

    var cacheKey = query.toLowerCase() + "::" + currentLang;
    if (apiResultsCache[cacheKey]) {
      spinner.classList.remove("active");
      var combined = localResults.concat(apiResultsCache[cacheKey]);
      renderDropdown(combined);
      renderAllRecipes(combined);
      return;
    }

    // Keyin TheMealDB'dan qidiramiz va tarjima qilamiz (sal sekinroq)
    RecipeAPI.searchMealDB(query).then(function (meals) {
      if (token !== currentSearchToken) return; // eski so'rov, e'tiborsiz qoldiramiz
      if (!meals || meals.length === 0) {
        spinner.classList.remove("active");
        if (localResults.length === 0) {
          showNoResultsWithAIHint(query);
        }
        return;
      }

      var toBuild = meals.slice(0, 9); // bir martada juda ko'p tarjima qilib yubormaslik uchun
      Promise.all(toBuild.map(function (meal) {
        return RecipeAPI.buildLocalizedRecipe(meal, currentLang);
      })).then(function (builtRecipes) {
        if (token !== currentSearchToken) return;
        spinner.classList.remove("active");
        apiResultsCache[cacheKey] = builtRecipes;
        // API natijalarini global ro'yxatga ham qo'shamiz, detail sahifa ochilganda topilsin
        builtRecipes.forEach(function (r) {
          if (!findRecipe(r.id)) EXTRA_RECIPES.push(r);
        });
        var combined = localResults.concat(builtRecipes);
        renderDropdown(combined);
        renderAllRecipes(combined);
      });
    }).catch(function () {
      if (token !== currentSearchToken) return;
      spinner.classList.remove("active");
      if (localResults.length === 0) {
        showNoResultsWithAIHint(query);
      }
    });
  }

  // Hech narsa topilmaganda — odamni pastdagi "AI Oshpaz" bo'limiga yo'naltiramiz
  function showNoResultsWithAIHint(query) {
    var dropdown = document.getElementById("searchDropdown");
    var msg = currentLang === "uz"
      ? "Topilmadi. Pastdagi \"AI Oshpazdan so'rang\" bo'limida so'rab ko'ring →"
      : currentLang === "ru"
      ? "Не найдено. Попробуйте спросить в разделе \"AI-повар\" ниже →"
      : "Not found. Try asking the AI Chef section below →";
    dropdown.innerHTML = '<div class="dropdown-empty" id="aiHintLink" style="cursor:pointer; text-decoration:underline;">' + msg + '</div>';
    dropdown.classList.add("open");

    var hintLink = document.getElementById("aiHintLink");
    if (hintLink) {
      hintLink.addEventListener("click", function () {
        dropdown.classList.remove("open");
        var aiSection = document.getElementById("aiSection");
        var aiInput = document.getElementById("aiInput");
        aiSection.scrollIntoView({ behavior: "smooth" });
        aiInput.value = query;
        aiInput.focus();
      });
    }

    renderAllRecipes([]);
  }

  function searchLocalRecipes(query) {
    var q = query.toLowerCase();
    return RECIPES.filter(function (r) {
      var nameMatch = Object.values(r.name).some(function (n) { return n.toLowerCase().indexOf(q) !== -1; });
      var countryMatch = Object.values(COUNTRY_NAMES[r.country]).some(function (n) { return n.toLowerCase().indexOf(q) !== -1; });
      return nameMatch || countryMatch;
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
    document.querySelectorAll(".lang-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var lang = btn.getAttribute("data-lang");
        if (lang === currentLang) return;
        currentLang = lang;
        document.querySelectorAll(".lang-btn").forEach(function (b) { b.classList.remove("active"); });
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
    setText("aiEyebrow", lang === "uz" ? "AI Yordamchi" : lang === "ru" ? "AI Помощник" : "AI Assistant");
    setText("aiTitle", lang === "uz" ? "AI Oshpazdan so'rang" : lang === "ru" ? "Спросите AI-повара" : "Ask the AI Chef");
    setText("aiSubtitle", lang === "uz" ? "Istalgan taom haqida so'rang — dunyodagi har qanday retseptni bilaman" : lang === "ru" ? "Спросите о любом блюде — я знаю любой рецепт в мире" : "Ask about any dish — I know recipes from around the world");
    document.getElementById("aiInput").placeholder = lang === "uz"
      ? "Masalan: Manti qanday tayyorlanadi? yoki Bolgariya milliy taomlari qanaqa?"
      : lang === "ru"
      ? "Например: Как приготовить манты? или Какая национальная кухня в Болгарии?"
      : "E.g. How do I make manti? or What are Bulgaria's national dishes?";
    setText("aiSubmitText", lang === "uz" ? "So'rash" : lang === "ru" ? "Спросить" : "Ask");
    setText("allRecipesTitle", t.allRecipes);
    setText("footerText", t.footerText);
    setText("backBtnText", t.backToResults);
    setText("ingredientsTitle", t.ingredients);
    setText("stepsTitle", t.steps);
    setText("reviewsTitle", t.reviews);
    setText("addReviewTitle", t.addReview);
    setText("rateThisLabel", t.rateThis);
    setText("voteFeedback", t.voted);
    document.getElementById("reviewName").placeholder = t.yourName;
    document.getElementById("reviewText").placeholder = t.yourReview;
    setText("reviewSubmitBtn", t.submit);
    setText("loaderText", t.loading);
    setText("detailEyebrow", lang === "uz" ? "Retsept" : lang === "ru" ? "Рецепт" : "Recipe");
    setText("detailTimeLabel", lang === "uz" ? "Daqiqa" : lang === "ru" ? "Минут" : "Minutes");
    setText("detailServingsLabel", t.servings.charAt(0).toUpperCase() + t.servings.slice(1));
    setText("detailDifficultyLabel", t.difficulty);
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
    document.getElementById("detailFlagEmoji").textContent = r.flag;

    var countryLabel = r.fromAPI
      ? (r.country || "—")
      : COUNTRY_NAMES[r.country][lang];
    document.getElementById("detailCountryName").textContent = countryLabel;

    document.getElementById("detailTitle").textContent = r.name[lang];
    document.getElementById("detailTagline").textContent = r.tagline[lang];
    document.getElementById("detailTime").textContent = r.time != null ? r.time : "—";
    document.getElementById("detailServings").textContent = r.servings != null ? r.servings : "—";
    document.getElementById("detailDifficulty").textContent = r.difficulty[lang];

    document.getElementById("ingredientsList").innerHTML = r.ingredients[lang].map(function (ing) {
      return "<li>" + ing + "</li>";
    }).join("");

    document.getElementById("stepsList").innerHTML = r.steps[lang].map(function (step) {
      return "<li><span>" + step + "</span></li>";
    }).join("");

    renderStars(r);
    renderReviews(r);
    renderReviewFormStars();

    document.title = r.name[lang] + " — " + t.siteTitle;
  }

  // ---------- STAR RATING (detail page) ----------
  function renderStars(recipe) {
    var row = document.getElementById("starsRow");
    var userStars = userVotes[recipe.id] || 0;
    row.innerHTML = "";

    for (var i = 1; i <= 5; i++) {
      var btn = document.createElement("button");
      btn.className = "star-btn" + (i <= userStars ? " filled" : "");
      btn.textContent = "★";
      btn.setAttribute("data-value", i);
      btn.setAttribute("aria-label", i + " star");
      (function (starValue, recipeRef) {
        btn.addEventListener("mouseenter", function () {
          highlightStars(row, starValue);
        });
        btn.addEventListener("click", function () {
          castVote(recipeRef, starValue);
          renderStars(recipeRef);
          renderPicks();
          var feedback = document.getElementById("voteFeedback");
          feedback.classList.add("show");
          showToast(UI_TEXT[currentLang].voted);
        });
      })(i, recipe);
      row.appendChild(btn);
    }

    row.addEventListener("mouseleave", function () {
      highlightStars(row, userVotes[recipe.id] || 0);
    });

    if (userStars > 0) {
      document.getElementById("voteFeedback").classList.add("show");
    } else {
      document.getElementById("voteFeedback").classList.remove("show");
    }
  }

  function highlightStars(row, count) {
    var stars = row.querySelectorAll(".star-btn");
    stars.forEach(function (s, idx) {
      s.classList.toggle("filled", idx < count);
    });
  }

  // ---------- REVIEWS ----------
  function renderReviews(recipe) {
    var list = document.getElementById("reviewsList");
    var seeded = SEED_REVIEWS[recipe.id] || [];
    var added = userReviews[recipe.id] || [];
    var all = seeded.concat(added);

    if (all.length === 0) {
      list.innerHTML = '<div class="no-reviews">' + UI_TEXT[currentLang].noReviewsYet + '</div>';
      return;
    }

    list.innerHTML = all.map(function (rev) {
      var text = typeof rev.text === "object" ? (rev.text[currentLang] || rev.text.uz) : rev.text;
      var stars = "★".repeat(rev.stars) + "☆".repeat(5 - rev.stars);
      return (
        '<div class="review-card">' +
          '<div class="review-card-head">' +
            '<span class="review-card-name">' + escapeHtml(rev.name) + '</span>' +
            '<span class="review-card-stars">' + stars + '</span>' +
          '</div>' +
          '<div class="review-card-text">' + escapeHtml(text) + '</div>' +
        '</div>'
      );
    }).join("");
  }

  function renderReviewFormStars() {
    var wrap = document.getElementById("reviewFormStars");
    wrap.innerHTML = "";
    pendingFormStars = 0;
    for (var i = 1; i <= 5; i++) {
      var btn = document.createElement("button");
      btn.className = "star-btn";
      btn.textContent = "★";
      btn.type = "button";
      (function (val) {
        btn.addEventListener("mouseenter", function () { highlightStars(wrap, val); });
        btn.addEventListener("click", function () {
          pendingFormStars = val;
          highlightStars(wrap, val);
        });
      })(i);
      wrap.appendChild(btn);
    }
    wrap.addEventListener("mouseleave", function () { highlightStars(wrap, pendingFormStars); });
  }

  // ---------- AI OSHPAZ ----------
  function bindAISection() {
    var input = document.getElementById("aiInput");
    var btn = document.getElementById("aiSubmitBtn");
    var btnText = document.getElementById("aiSubmitText");
    var spinner = document.getElementById("aiSpinner");
    var responseBox = document.getElementById("aiResponse");

    btn.addEventListener("click", function () {
      var prompt = input.value.trim();
      if (!prompt) {
        input.focus();
        return;
      }

      btn.disabled = true;
      spinner.classList.add("active");
      responseBox.classList.remove("show", "error");
      responseBox.textContent = "";

      RecipeAPI.askGemini(prompt, currentLang)
        .then(function (text) {
          responseBox.textContent = text;
          responseBox.classList.add("show");
        })
        .catch(function (err) {
          var msg = currentLang === "uz"
            ? "Kechirasiz, AI bilan bog'lanib bo'lmadi. Birozdan keyin qayta urinib ko'ring."
            : currentLang === "ru"
            ? "Извините, не удалось связаться с AI. Попробуйте позже."
            : "Sorry, could not reach the AI. Please try again later.";
          responseBox.textContent = msg;
          responseBox.classList.add("show", "error");
        })
        .finally(function () {
          btn.disabled = false;
          spinner.classList.remove("active");
        });
    });
  }

  function bindReviewForm() {
    document.getElementById("reviewSubmitBtn").addEventListener("click", function () {
      var nameInput = document.getElementById("reviewName");
      var textInput = document.getElementById("reviewText");
      var name = nameInput.value.trim();
      var text = textInput.value.trim();

      if (!currentRecipeId) return;
      if (!name || !text) {
        showToast(currentLang === "uz" ? "Iltimos, ism va fikringizni yozing" : currentLang === "ru" ? "Пожалуйста, укажите имя и отзыв" : "Please enter your name and review");
        return;
      }

      var stars = pendingFormStars || 5;
      var review = { name: name, text: text, stars: stars };

      if (!userReviews[currentRecipeId]) userReviews[currentRecipeId] = [];
      userReviews[currentRecipeId].push(review);
      localStorageSet("rd_reviews", JSON.stringify(userReviews));

      nameInput.value = "";
      textInput.value = "";
      renderReviewFormStars();

      var recipe = findRecipe(currentRecipeId);
      renderReviews(recipe);
      showToast(currentLang === "uz" ? "Fikringiz uchun rahmat! 🎉" : currentLang === "ru" ? "Спасибо за отзыв! 🎉" : "Thanks for your review! 🎉");
    });
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
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

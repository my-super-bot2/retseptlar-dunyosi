// ============================================
// API.JS — TheMealDB + Google Translate ulanishi
// ============================================
// Bu fayl ikkita ishni qiladi:
// 1) TheMealDB.com saytidan (minglab haqiqiy retsept bazasi) taom qidiradi
// 2) Topilgan inglizcha matnni Google Translate orqali UZ/RU tiliga o'giradi
//
// Ikkalasi ham BEPUL va KALIT (API key) talab qilmaydi.

var RecipeAPI = (function () {
  "use strict";

  var MEALDB_BASE = "https://www.themealdb.com/api/json/v1/1";
  var TRANSLATE_BASE = "https://translate.googleapis.com/translate_a/single";

  // Tarjima natijalarini xotirada saqlab qo'yamiz — bir xil matnni
  // qayta-qayta tarjima qilib, vaqt va so'rovlarni isrof qilmaslik uchun
  var translationCache = {};

  // ---------- TheMealDB qidiruv ----------
  // Nomi bo'yicha taom qidiradi. Masalan: "chicken", "pasta"
  function searchMealDB(query) {
    var url = MEALDB_BASE + "/search.php?s=" + encodeURIComponent(query);
    return fetch(url)
      .then(function (res) { return res.json(); })
      .then(function (data) {
        return data.meals || [];
      })
      .catch(function () {
        return [];
      });
  }

  // Bitta taomni ID orqali to'liq olish (kerak bo'lganda)
  function lookupMeal(id) {
    var url = MEALDB_BASE + "/lookup.php?i=" + encodeURIComponent(id);
    return fetch(url)
      .then(function (res) { return res.json(); })
      .then(function (data) {
        return (data.meals && data.meals[0]) || null;
      })
      .catch(function () {
        return null;
      });
  }

  // ---------- Google Translate (kalitsiz) ----------
  // bir qatorli matnni berilgan tilga o'giradi
  function translateText(text, targetLang) {
    if (!text || !text.trim()) return Promise.resolve(text);
    if (targetLang === "en") return Promise.resolve(text); // original ingliz

    var cacheKey = targetLang + "::" + text;
    if (translationCache[cacheKey]) {
      return Promise.resolve(translationCache[cacheKey]);
    }

    var url = TRANSLATE_BASE + "?client=gtx&sl=en&tl=" + targetLang + "&dt=t&q=" + encodeURIComponent(text);

    return fetch(url)
      .then(function (res) { return res.json(); })
      .then(function (data) {
        // Google qaytaradigan format: [[["tarjima","original",null,null,1]], ...]
        // Uzun matnlar bo'laklarga bo'linib qaytishi mumkin — hammasini qo'shamiz
        var translated = data[0].map(function (chunk) { return chunk[0]; }).join("");
        translationCache[cacheKey] = translated;
        return translated;
      })
      .catch(function () {
        return text; // xato bo'lsa, original matnni qaytaramiz
      });
  }

  // Bir nechta matnni parallel tarjima qilish (tezroq)
  function translateMany(textArray, targetLang) {
    return Promise.all(textArray.map(function (t) {
      return translateText(t, targetLang);
    }));
  }

  // ---------- TheMealDB ma'lumotini bizning formatga o'tkazish ----------
  // TheMealDB strIngredient1..20 / strMeasure1..20 qilib beradi — buni
  // toza ro'yxatga aylantiramiz
  function extractIngredients(meal) {
    var list = [];
    for (var i = 1; i <= 20; i++) {
      var ing = meal["strIngredient" + i];
      var measure = meal["strMeasure" + i];
      if (ing && ing.trim()) {
        var line = (measure && measure.trim() ? measure.trim() + " " : "") + ing.trim();
        list.push(line);
      }
    }
    return list;
  }

  // Tayyorlash yo'riqnomasini bosqichlarga bo'lish
  // (TheMealDB hammasini bitta katta matn qilib beradi)
  function splitSteps(instructions) {
    if (!instructions) return [];
    var raw = instructions
      .split(/\r?\n+/)
      .map(function (s) { return s.trim(); })
      .filter(Boolean);

    // Agar qatorlarga bo'linmagan bo'lsa, gap nuqtalari bo'yicha bo'lamiz
    if (raw.length <= 1) {
      raw = instructions
        .split(/(?<=[.!?])\s+/)
        .map(function (s) { return s.trim(); })
        .filter(Boolean);
    }
    return raw;
  }

  // Asosiy funksiya: TheMealDB'dan kelgan 1 ta taomni to'liq tarjima
  // qilib, bizning sayt formatiga moslab beradi
  function buildLocalizedRecipe(meal, targetLang) {
    var ingredients = extractIngredients(meal);
    var steps = splitSteps(meal.strInstructions);
    var name = meal.strMeal;
    var area = meal.strArea || "";
    var category = meal.strCategory || "";

    if (targetLang === "en") {
      return Promise.resolve({
        id: "api-" + meal.idMeal,
        flag: areaToFlag(area),
        image: meal.strMealThumb,
        name: { en: name, uz: name, ru: name },
        tagline: { en: category + (area ? " · " + area : ""), uz: category, ru: category },
        ingredients: { en: ingredients, uz: ingredients, ru: ingredients },
        steps: { en: steps, uz: steps, ru: steps },
        time: null,
        servings: null,
        difficulty: { en: "—", uz: "—", ru: "—" },
        country: area,
        rating: 4.5,
        votes: 0,
        fromAPI: true
      });
    }

    // UZ yoki RU bo'lsa — hamma matnlarni tarjima qilamiz
    var allTexts = [name, category].concat(ingredients).concat(steps);

    return translateMany(allTexts, targetLang).then(function (translated) {
      var idx = 0;
      var tName = translated[idx++];
      var tCategory = translated[idx++];
      var tIngredients = ingredients.map(function () { return translated[idx++]; });
      var tSteps = steps.map(function () { return translated[idx++]; });

      var nameObj = { en: name, uz: name, ru: name };
      var taglineObj = { en: category, uz: category, ru: category };
      var ingObj = { en: ingredients, uz: ingredients, ru: ingredients };
      var stepsObj = { en: steps, uz: steps, ru: steps };

      nameObj[targetLang] = tName;
      taglineObj[targetLang] = tCategory + (area ? " · " + area : "");
      ingObj[targetLang] = tIngredients;
      stepsObj[targetLang] = tSteps;

      return {
        id: "api-" + meal.idMeal,
        flag: areaToFlag(area),
        image: meal.strMealThumb,
        name: nameObj,
        tagline: taglineObj,
        ingredients: ingObj,
        steps: stepsObj,
        time: null,
        servings: null,
        difficulty: { en: "—", uz: "—", ru: "—" },
        country: area,
        rating: 4.5,
        votes: 0,
        fromAPI: true
      };
    });
  }

  // Mamlakat nomidan bayroq emoji topish (taxminiy moslik)
  var AREA_FLAGS = {
    "American": "🇺🇸", "British": "🇬🇧", "Canadian": "🇨🇦", "Chinese": "🇨🇳",
    "Croatian": "🇭🇷", "Dutch": "🇳🇱", "Egyptian": "🇪🇬", "French": "🇫🇷",
    "Greek": "🇬🇷", "Indian": "🇮🇳", "Irish": "🇮🇪", "Italian": "🇮🇹",
    "Jamaican": "🇯🇲", "Japanese": "🇯🇵", "Kenyan": "🇰🇪", "Malaysian": "🇲🇾",
    "Mexican": "🇲🇽", "Moroccan": "🇲🇦", "Polish": "🇵🇱", "Portuguese": "🇵🇹",
    "Russian": "🇷🇺", "Spanish": "🇪🇸", "Thai": "🇹🇭", "Tunisian": "🇹🇳",
    "Turkish": "🇹🇷", "Vietnamese": "🇻🇳", "Ukrainian": "🇺🇦", "Uruguayan": "🇺🇾",
    "Filipino": "🇵🇭", "Indonesian": "🇮🇩"
  };

  function areaToFlag(area) {
    return AREA_FLAGS[area] || "🌍";
  }

  // ---------- Gemini AI Oshpaz (xavfsiz, Netlify Function orqali) ----------
  // Bu funksiya kalitni o'zida saqlamaydi — barchasi serverda (Netlify
  // Function) ishlaydi, brauzerda faqat savol va javob ko'chadi.
  function askGemini(prompt, lang) {
    return fetch("/.netlify/functions/gemini-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: prompt, lang: lang })
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.error) {
          throw new Error(data.error);
        }
        return data.text;
      });
  }

  // ---------- Tashqi API ----------
  return {
    searchMealDB: searchMealDB,
    lookupMeal: lookupMeal,
    translateText: translateText,
    buildLocalizedRecipe: buildLocalizedRecipe,
    askGemini: askGemini
  };

})();

// ============================================
// RETSEPTLAR DUNYOSI — MA'LUMOTLAR BAZASI
// ============================================

const RECIPES = [
  {
    id: "osh",
    country: "uz",
    flag: "🇺🇿",
    image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=900&q=80",
    name: { uz: "O'zbek Oshi (Palov)", ru: "Узбекский плов", en: "Uzbek Plov (Osh)" },
    tagline: {
      uz: "Milliy g'urur — har bir oilada o'z siri bor",
      ru: "Национальная гордость — у каждой семьи свой секрет",
      en: "National pride — every family has its secret"
    },
    time: 90,
    servings: 6,
    difficulty: { uz: "O'rta", ru: "Средне", en: "Medium" },
    ingredients: {
      uz: ["1 kg qo'y go'shti (yoki mol go'shti)", "1 kg guruch (devzira)", "1 kg sabzi", "4 ta piyoz", "300 ml o'simlik yog'i", "1 bosh sarimsoq", "1 ch.qoshiq zira", "Tuz, qalampir — ta'bga ko'ra"],
      ru: ["1 кг баранины (или говядины)", "1 кг риса (девзира)", "1 кг моркови", "4 луковицы", "300 мл растительного масла", "1 головка чеснока", "1 ч.л. зиры", "Соль, перец — по вкусу"],
      en: ["1 kg lamb (or beef)", "1 kg rice (devzira)", "1 kg carrots", "4 onions", "300 ml vegetable oil", "1 head of garlic", "1 tsp cumin (zira)", "Salt, pepper — to taste"]
    },
    steps: {
      uz: ["Qozonni qizdirib, yog'ni quying va tutun chiqquncha qizdiring", "Piyozni halqalab to'g'rab qovuring, so'ng go'shtni qo'shing", "Sabzini somon qilib to'g'rab soling, 10 daqiqa qovuring", "Suv quying, ziravorlarni soling va qaynatib zirvak tayyorlang (40 daqiqa)", "Yuvilgan guruchni tekis yoying, suv qo'shing", "Sarimsoqni o'rtaga botiring, qopqoqni yopib pishiring (30-40 daqiqa)", "Dam berib, aralashtirib dasturxonga tortiq qiling"],
      ru: ["Разогрейте казан, налейте масло до появления дымка", "Обжарьте лук кольцами, затем добавьте мясо", "Морковь нарежьте соломкой, обжарьте 10 минут", "Залейте водой, добавьте специи и варите зирвак 40 минут", "Выложите промытый рис ровным слоем, добавьте воду", "Воткните головку чеснока, накройте крышкой (30-40 минут)", "Дайте настояться, перемешайте и подавайте"],
      en: ["Heat the cauldron and pour oil until it smokes lightly", "Fry sliced onion rings, then add the meat", "Cut carrots into strips, fry for 10 minutes", "Add water and spices, simmer the zirvak base for 40 minutes", "Spread washed rice evenly, add water", "Press garlic head into the center, cover and cook (30-40 min)", "Let it rest, mix and serve"]
    },
    rating: 4.9,
    votes: 1284
  },
  {
    id: "pizza",
    country: "it",
    flag: "🇮🇹",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=900&q=80",
    name: { uz: "Margarita Pitsa", ru: "Пицца Маргарита", en: "Pizza Margherita" },
    tagline: {
      uz: "Italiya bayrog'i rangida — sodda va mukammal",
      ru: "В цветах итальянского флага — просто и идеально",
      en: "In the colors of the Italian flag — simple and perfect"
    },
    time: 45,
    servings: 4,
    difficulty: { uz: "Oson", ru: "Легко", en: "Easy" },
    ingredients: {
      uz: ["500 g pitsa uchun xamir", "200 g pomidor sousi", "250 g motsarella pishlog'i", "Yangi reyhon barglari", "Zaytun yog'i", "Tuz"],
      ru: ["500 г теста для пиццы", "200 г томатного соуса", "250 г сыра моцарелла", "Свежие листья базилика", "Оливковое масло", "Соль"],
      en: ["500g pizza dough", "200g tomato sauce", "250g mozzarella cheese", "Fresh basil leaves", "Olive oil", "Salt"]
    },
    steps: {
      uz: ["Xamirni yumaloq shaklga yoying", "Pomidor sousini tekis surting", "Motsarellani bo'lakcha qilib taqsimlang", "250°C da 10-12 daqiqa pishiring", "Tandirdan chiqarib, reyhon va zaytun yog'i bilan bezang"],
      ru: ["Раскатайте тесто в круглую форму", "Равномерно нанесите томатный соус", "Распределите кусочки моцареллы", "Выпекайте при 250°C 10-12 минут", "Достаньте и украсьте базиликом и оливковым маслом"],
      en: ["Roll the dough into a round shape", "Spread tomato sauce evenly", "Distribute mozzarella pieces", "Bake at 250°C for 10-12 minutes", "Remove and garnish with basil and olive oil"]
    },
    rating: 4.8,
    votes: 956
  },
  {
    id: "sushi",
    country: "jp",
    flag: "🇯🇵",
    image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=900&q=80",
    name: { uz: "Sushi Roll", ru: "Суши-ролл", en: "Sushi Roll" },
    tagline: {
      uz: "San'at darajasidagi nafis taom",
      ru: "Изысканное блюдо уровня искусства",
      en: "An exquisite dish that is a work of art"
    },
    time: 60,
    servings: 2,
    difficulty: { uz: "Qiyin", ru: "Сложно", en: "Hard" },
    ingredients: {
      uz: ["2 stakan sushi guruchi", "Nori (suv o'tlari varag'i)", "200 g tuna yoki losos", "1 ta bodring", "1 ta avokado", "Sushi sirkasi", "Soya sousi, vasabi"],
      ru: ["2 стакана риса для суши", "Нори (листы водорослей)", "200 г тунца или лосося", "1 огурец", "1 авокадо", "Рисовый уксус для суши", "Соевый соус, васаби"],
      en: ["2 cups sushi rice", "Nori (seaweed sheets)", "200g tuna or salmon", "1 cucumber", "1 avocado", "Sushi vinegar", "Soy sauce, wasabi"]
    },
    steps: {
      uz: ["Guruchni pishirib, sushi sirkasi bilan aralashtiring", "Bambuk to'shamaga nori qog'ozini yoying", "Guruchni tekis qatlam qilib yoying", "Baliq va sabzavotlarni o'rtaga joylashtiring", "Bambuk to'shama yordamida ehtiyotlik bilan o'rang", "O'tkir pichoq bilan bo'laklarga kesing"],
      ru: ["Сварите рис и смешайте с рисовым уксусом", "Расстелите нори на бамбуковой циновке", "Равномерно распределите рис", "Выложите рыбу и овощи в центр", "Аккуратно сверните с помощью циновки", "Нарежьте острым ножом на кусочки"],
      en: ["Cook rice and mix with sushi vinegar", "Lay nori sheet on a bamboo mat", "Spread rice in an even layer", "Place fish and vegetables in the center", "Roll carefully using the bamboo mat", "Cut into pieces with a sharp knife"]
    },
    rating: 4.7,
    votes: 612
  },
  {
    id: "tacos",
    country: "mx",
    flag: "🇲🇽",
    image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=900&q=80",
    name: { uz: "Meksika Tako", ru: "Мексиканские тако", en: "Mexican Tacos" },
    tagline: {
      uz: "Ko'cha taomlarining shohi — achchiq va to'yimli",
      ru: "Король уличной еды — острый и сытный",
      en: "The king of street food — spicy and hearty"
    },
    time: 35,
    servings: 4,
    difficulty: { uz: "Oson", ru: "Легко", en: "Easy" },
    ingredients: {
      uz: ["8 ta mayda makkajo'xori lepyoshka", "500 g mol go'shti", "1 ta piyoz", "2 ta pomidor", "1 dasta kashnich", "1 ta laym", "Chili kukuni, kumin"],
      ru: ["8 маленьких кукурузных лепёшек", "500 г говядины", "1 луковица", "2 помидора", "1 пучок кинзы", "1 лайм", "Порошок чили, кумин"],
      en: ["8 small corn tortillas", "500g beef", "1 onion", "2 tomatoes", "1 bunch cilantro", "1 lime", "Chili powder, cumin"]
    },
    steps: {
      uz: ["Go'shtni mayda to'g'rab, ziravorlar bilan qovuring", "Piyoz va pomidorni mayda to'g'rab salsa tayyorlang", "Lepyoshkalarni issiq tovada isiting", "Go'shtni lepyoshka ustiga joylashtiring", "Salsa, kashnich va laym sharbati bilan bezang"],
      ru: ["Мелко нарежьте мясо и обжарьте со специями", "Мелко нарежьте лук и помидоры для сальсы", "Разогрейте лепёшки на горячей сковороде", "Выложите мясо на лепёшку", "Украсьте сальсой, кинзой и соком лайма"],
      en: ["Dice the beef and fry with spices", "Finely chop onion and tomato for salsa", "Warm tortillas on a hot pan", "Place meat on the tortilla", "Top with salsa, cilantro and lime juice"]
    },
    rating: 4.6,
    votes: 487
  },
  {
    id: "pho",
    country: "vn",
    flag: "🇻🇳",
    image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=900&q=80",
    name: { uz: "Fo Bo (Vetnam sho'rvasi)", ru: "Фо Бо (вьетнамский суп)", en: "Phở Bò (Vietnamese Soup)" },
    tagline: {
      uz: "Bir piyola — butun Vetnam ta'mi",
      ru: "Одна тарелка — весь вкус Вьетнама",
      en: "One bowl — the entire taste of Vietnam"
    },
    time: 180,
    servings: 4,
    difficulty: { uz: "Qiyin", ru: "Сложно", en: "Hard" },
    ingredients: {
      uz: ["1.5 kg mol suyagi", "400 g mol go'shti (yupqa kesilgan)", "Guruch lag'mon", "Dolchin, anis, zanjabil", "Piyoz, kashnich", "Soya filizi", "Laym, chili"],
      ru: ["1.5 кг говяжьих костей", "400 г говядины (тонко нарезанной)", "Рисовая лапша", "Корица, анис, имбирь", "Лук, кинза", "Соевые ростки", "Лайм, чили"],
      en: ["1.5 kg beef bones", "400g beef (thinly sliced)", "Rice noodles", "Cinnamon, star anise, ginger", "Onion, cilantro", "Bean sprouts", "Lime, chili"]
    },
    steps: {
      uz: ["Suyaklarni 3 soat qaynatib bульон tayyorlang", "Ziravorlarni quruq tovada qovurib, bульонga qo'shing", "Guruch lag'monni issiq suvda yumshating", "Piyolaga lag'mon va xom go'sht joylashtiring", "Qaynoq bульон bilan ustidan quying", "Ko'katlar, laym va chili bilan bezang"],
      ru: ["Варите кости 3 часа для бульона", "Обжарьте специи на сухой сковороде, добавьте в бульон", "Размягчите рисовую лапшу в горячей воде", "Выложите лапшу и сырое мясо в тарелку", "Залейте кипящим бульоном", "Украсьте зеленью, лаймом и чили"],
      en: ["Simmer bones for 3 hours to make broth", "Toast spices in a dry pan, add to broth", "Soften rice noodles in hot water", "Place noodles and raw beef in a bowl", "Pour boiling broth over the top", "Garnish with herbs, lime and chili"]
    },
    rating: 4.8,
    votes: 392
  },
  {
    id: "croissant",
    country: "fr",
    flag: "🇫🇷",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=900&q=80",
    name: { uz: "Frantsuz Kruassani", ru: "Французский круассан", en: "French Croissant" },
    tagline: {
      uz: "Parij tongining ta'mi — qatlama va xushbo'y",
      ru: "Вкус парижского утра — слоёный и ароматный",
      en: "The taste of a Paris morning — flaky and fragrant"
    },
    time: 240,
    servings: 8,
    difficulty: { uz: "Qiyin", ru: "Сложно", en: "Hard" },
    ingredients: {
      uz: ["500 g un", "280 g sariyog'", "10 g xamirturush", "60 g shakar", "10 g tuz", "250 ml sovuq sut", "1 ta tuxum (surtish uchun)"],
      ru: ["500 г муки", "280 г сливочного масла", "10 г дрожжей", "60 г сахара", "10 г соли", "250 мл холодного молока", "1 яйцо (для смазки)"],
      en: ["500g flour", "280g butter", "10g yeast", "60g sugar", "10g salt", "250ml cold milk", "1 egg (for brushing)"]
    },
    steps: {
      uz: ["Xamirni yo'g'urib, 1 soat sovutgichda dam bering", "Sariyog'ni tekis qatlam qilib xamir ichiga joylashtiring", "Xamirni 3 marta buklab-yoyib, har safar sovutgichga qo'ying", "Uchburchaklarga kesib, oy shaklida o'rang", "2 soat isitilgan joyda ko'tarilishini kuting", "Tuxum bilan surtib, 200°C da 18 daqiqa pishiring"],
      ru: ["Замесите тесто, охладите 1 час", "Распределите масло ровным слоем внутри теста", "Сложите тесто 3 раза, каждый раз охлаждая", "Нарежьте треугольниками и скрутите в форму полумесяца", "Дайте подняться в тёплом месте 2 часа", "Смажьте яйцом и выпекайте при 200°C 18 минут"],
      en: ["Knead the dough, chill for 1 hour", "Place butter in an even layer inside the dough", "Fold and roll the dough 3 times, chilling between each", "Cut into triangles and roll into crescent shapes", "Let rise in a warm place for 2 hours", "Brush with egg and bake at 200°C for 18 minutes"]
    },
    rating: 4.9,
    votes: 728
  },
  {
    id: "pad-thai",
    country: "th",
    flag: "🇹🇭",
    image: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=900&q=80",
    name: { uz: "Pad Tay", ru: "Пад Тай", en: "Pad Thai" },
    tagline: {
      uz: "Tatland ko'chalarining mashhur lag'moni",
      ru: "Знаменитая лапша с улиц Таиланда",
      en: "Thailand's famous street noodles" 
    },
    time: 30,
    servings: 3,
    difficulty: { uz: "Oson", ru: "Легко", en: "Easy" },
    ingredients: {
      uz: ["250 g guruch lag'moni", "200 g qisqichbaqa yoki tovuq", "2 ta tuxum", "100 g soya filizi", "3 osh.q. fish sousi", "2 osh.q. tamarind pastasi", "Yeryong'oq, laym"],
      ru: ["250 г рисовой лапши", "200 г креветок или курицы", "2 яйца", "100 г соевых ростков", "3 ст.л. рыбного соуса", "2 ст.л. тамаринда", "Арахис, лайм"],
      en: ["250g rice noodles", "200g shrimp or chicken", "2 eggs", "100g bean sprouts", "3 tbsp fish sauce", "2 tbsp tamarind paste", "Peanuts, lime"]
    },
    steps: {
      uz: ["Lag'monni issiq suvda 10 daqiqa ivitib oling", "Tovada go'sht yoki qisqichbaqani qovuring", "Tuxumni chetga surib qovurib, aralashtiring", "Lag'mon va sousni qo'shib tez aralashtiring", "Soya filizini qo'shing", "Maydalangan yeryong'oq va laym bilan bezang"],
      ru: ["Замочите лапшу в горячей воде на 10 минут", "Обжарьте мясо или креветки на сковороде", "Обжарьте яйцо сбоку, перемешайте", "Добавьте лапшу и соус, быстро перемешайте", "Добавьте соевые ростки", "Украсьте измельчённым арахисом и лаймом"],
      en: ["Soak noodles in hot water for 10 minutes", "Stir-fry meat or shrimp in a pan", "Push aside, scramble egg, then mix together", "Add noodles and sauce, toss quickly", "Add bean sprouts", "Garnish with crushed peanuts and lime"]
    },
    rating: 4.7,
    votes: 341
  },
  {
    id: "borscht",
    country: "ua",
    flag: "🇺🇦",
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=900&q=80",
    name: { uz: "Borsh", ru: "Борщ", en: "Borscht" },
    tagline: {
      uz: "Qizil sho'rvalarning malikasi",
      ru: "Королева красных супов",
      en: "The queen of red soups"
    },
    time: 75,
    servings: 6,
    difficulty: { uz: "O'rta", ru: "Средне", en: "Medium" },
    ingredients: {
      uz: ["500 g mol go'shti", "3 ta lavlagi", "300 g karam", "2 ta kartoshka", "1 ta sabzi", "1 ta piyoz", "2 osh.q. pomidor pastasi", "Smetana, ukrop"],
      ru: ["500 г говядины", "3 свёклы", "300 г капусты", "2 картофеля", "1 морковь", "1 луковица", "2 ст.л. томатной пасты", "Сметана, укроп"],
      en: ["500g beef", "3 beets", "300g cabbage", "2 potatoes", "1 carrot", "1 onion", "2 tbsp tomato paste", "Sour cream, dill"]
    },
    steps: {
      uz: ["Go'shtni qaynatib bульон tayyorlang (40 daqiqa)", "Lavlagi va sabzini ushab, pomidor pastasi bilan qovuring", "Kartoshka va karamni bульonga soling", "Qovurilgan lavlagi aralashmasini qo'shing", "15 daqiqa qaynating, tuz-murch soling", "Smetana va ukrop bilan dasturxonga tortiq qiling"],
      ru: ["Сварите бульон из мяса (40 минут)", "Натрите свёклу и морковь, обжарьте с томатной пастой", "Добавьте картофель и капусту в бульон", "Добавьте обжаренную свекольную смесь", "Варите 15 минут, посолите и поперчите", "Подавайте со сметаной и укропом"],
      en: ["Boil beef to make broth (40 minutes)", "Grate beet and carrot, fry with tomato paste", "Add potato and cabbage to the broth", "Add the fried beet mixture", "Simmer 15 minutes, season with salt and pepper", "Serve with sour cream and dill"]
    },
    rating: 4.6,
    votes: 298
  },
  {
    id: "biryani",
    country: "in",
    flag: "🇮🇳",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=900&q=80",
    name: { uz: "Hindiston Biryani", ru: "Индийский бирьяни", en: "Indian Biryani" },
    tagline: {
      uz: "Ziravorlar mo''jizasi — har bir qoshiqda bayram",
      ru: "Чудо специй — праздник в каждой ложке",
      en: "A miracle of spices — a celebration in every bite"
    },
    time: 90,
    servings: 5,
    difficulty: { uz: "Qiyin", ru: "Сложно", en: "Hard" },
    ingredients: {
      uz: ["500 g basmati guruchi", "600 g tovuq go'shti", "200 g qatiq", "2 ta piyoz (qovurilgan)", "Zafaron, kardamon, dolchin", "Zanjabil-sarimsoq pastasi", "Yangi yalpiz va kashnich"],
      ru: ["500 г риса басмати", "600 г курицы", "200 г йогурта", "2 луковицы (жареные)", "Шафран, кардамон, корица", "Паста имбирь-чеснок", "Свежая мята и кинза"],
      en: ["500g basmati rice", "600g chicken", "200g yogurt", "2 onions (fried)", "Saffron, cardamom, cinnamon", "Ginger-garlic paste", "Fresh mint and cilantro"]
    },
    steps: {
      uz: ["Tovuqni qatiq va ziravorlarda 2 soat marinadlang", "Guruchni yarim pishguncha qaynating", "Qozon tagiga marinadlangan tovuqni joylashtiring", "Ustidan guruch qatlamini yoying", "Zafaron, qovurilgan piyoz va ko'katlar bilan bezang", "Qopqoqni mahkam yopib, 30 daqiqa dim qiling"],
      ru: ["Маринуйте курицу в йогурте со специями 2 часа", "Сварите рис до полуготовности", "Выложите маринованную курицу на дно казана", "Сверху выложите слой риса", "Украсьте шафраном, жареным луком и зеленью", "Плотно закройте крышку, томите 30 минут"],
      en: ["Marinate chicken in yogurt and spices for 2 hours", "Parboil the rice until half-cooked", "Layer marinated chicken at the bottom of the pot", "Spread a layer of rice on top", "Garnish with saffron, fried onion and herbs", "Seal the lid tightly, steam for 30 minutes"]
    },
    rating: 4.8,
    votes: 543
  }
];

// Boshlang'ich sharhlar (kichik "ma'lumotlar bazasi")
const SEED_REVIEWS = {
  osh: [
    { name: "Aziz", text: { uz: "Ajoyib retsept! Onamning oshiga juda o'xshab chiqdi.", ru: "Отличный рецепт! Очень похоже на плов моей мамы.", en: "Amazing recipe! Tastes just like my mom's plov." }, stars: 5 },
    { name: "Malika", text: { uz: "Devzira guruchi bilan ayniqsa mazali bo'ladi.", ru: "С рисом девзира получается особенно вкусно.", en: "Especially delicious with devzira rice." }, stars: 5 }
  ],
  pizza: [
    { name: "Jasur", text: { uz: "Oddiy lekin juda mazali, oilam yoqtirdi.", ru: "Просто, но очень вкусно, семье понравилось.", en: "Simple but very tasty, my family loved it." }, stars: 5 }
  ],
  pho: [
    { name: "Dilnoza", text: { uz: "3 soat sabr qilishga arziydi, bульon ajoyib chiqdi!", ru: "Стоит подождать 3 часа, бульон получился отличный!", en: "Worth the 3-hour wait, the broth came out amazing!" }, stars: 5 }
  ]
};

const COUNTRY_NAMES = {
  uz: { uz: "O'zbekiston", ru: "Узбекистан", en: "Uzbekistan" },
  it: { uz: "Italiya", ru: "Италия", en: "Italy" },
  jp: { uz: "Yaponiya", ru: "Япония", en: "Japan" },
  mx: { uz: "Meksika", ru: "Мексика", en: "Mexico" },
  vn: { uz: "Vetnam", ru: "Вьетнам", en: "Vietnam" },
  fr: { uz: "Frantsiya", ru: "Франция", en: "France" },
  th: { uz: "Tailand", ru: "Таиланд", en: "Thailand" },
  ua: { uz: "Ukraina", ru: "Украина", en: "Ukraine" },
  in: { uz: "Hindiston", ru: "Индия", en: "India" }
};

// UI matnlari — barcha 3 til
const UI_TEXT = {
  uz: {
    siteTitle: "Retseptlar Dunyosi",
    heroTitle: "Dunyo oshxonasi bir qadamda",
    heroSubtitle: "9 mamlakat, yuzlab ta'mlar — qaysi birini bugun pishirasiz?",
    searchPlaceholder: "Taom nomini kiriting (UZ yoki ingliz nomida)... masalan: osh, pizza, chicken",
    todaysPicks: "Kun taomlari",
    minutes: "daqiqa",
    servings: "porsiya",
    difficulty: "Murakkablik",
    ingredients: "Kerakli masalliqlar",
    steps: "Tayyorlash bosqichlari",
    reviews: "Fikrlar",
    addReview: "Fikr qoldiring",
    yourName: "Ismingiz",
    yourReview: "Fikringiz...",
    submit: "Yuborish",
    rateThis: "Ushbu taomni baholang",
    voted: "Ovoz berildi! Rahmat 🎉",
    noResults: "Hech narsa topilmadi. Boshqa nom bilan izlab ko'ring.",
    loading: "Yuklanmoqda...",
    viewRecipe: "Retseptni ko'rish",
    backToResults: "Orqaga",
    allRecipes: "Barcha retseptlar",
    searchResultsFor: "Qidiruv natijasi:",
    noReviewsYet: "Hozircha fikr yo'q. Birinchi bo'ling!",
    footerText: "Dunyo taomlarini sevuvchilar uchun ishtiyoq bilan yaratildi.",
    welcomeToast: "Xush kelibsiz! Dunyo taomlarini kashf eting 🌍"
  },
  ru: {
    siteTitle: "Мир Рецептов",
    heroTitle: "Кухня мира в одном клике",
    heroSubtitle: "9 стран, сотни вкусов — что приготовите сегодня?",
    searchPlaceholder: "Введите блюдо (на русском или английском)... например: плов, pizza, chicken",
    todaysPicks: "Блюда дня",
    minutes: "минут",
    servings: "порций",
    difficulty: "Сложность",
    ingredients: "Необходимые ингредиенты",
    steps: "Этапы приготовления",
    reviews: "Отзывы",
    addReview: "Оставить отзыв",
    yourName: "Ваше имя",
    yourReview: "Ваш отзыв...",
    submit: "Отправить",
    rateThis: "Оцените это блюдо",
    voted: "Голос принят! Спасибо 🎉",
    noResults: "Ничего не найдено. Попробуйте другое название.",
    loading: "Загрузка...",
    viewRecipe: "Смотреть рецепт",
    backToResults: "Назад",
    allRecipes: "Все рецепты",
    searchResultsFor: "Результаты поиска:",
    noReviewsYet: "Пока нет отзывов. Будьте первым!",
    footerText: "Создано с любовью для ценителей мировой кухни.",
    welcomeToast: "Добро пожаловать! Откройте для себя кухни мира 🌍"
  },
  en: {
    siteTitle: "World of Recipes",
    heroTitle: "World cuisine, one click away",
    heroSubtitle: "9 countries, hundreds of flavors — what will you cook today?",
    searchPlaceholder: "Type any dish name worldwide... e.g. plov, pizza, chicken curry",
    todaysPicks: "Today's Picks",
    minutes: "min",
    servings: "servings",
    difficulty: "Difficulty",
    ingredients: "Ingredients needed",
    steps: "Preparation steps",
    reviews: "Reviews",
    addReview: "Leave a review",
    yourName: "Your name",
    yourReview: "Your review...",
    submit: "Submit",
    rateThis: "Rate this dish",
    voted: "Vote counted! Thanks 🎉",
    noResults: "No results found. Try a different name.",
    loading: "Loading...",
    viewRecipe: "View recipe",
    backToResults: "Back",
    allRecipes: "All recipes",
    searchResultsFor: "Search results for:",
    noReviewsYet: "No reviews yet. Be the first!",
    footerText: "Crafted with passion for lovers of world cuisine.",
    welcomeToast: "Welcome! Discover world cuisine 🌍"
  }
};

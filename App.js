import React, { useEffect, useMemo, useState } from "react";
import {import ProductManager from "./ProductManager";
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";

import { collection, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

/* =========================
   HELPERS
========================= */

const money = (value) =>
  new Intl.NumberFormat("ku-IQ").format(Number(value) || 0) + " د.ع";

/* =========================
   PASSWORD SCREEN
========================= */

function PasswordScreen({
  title,
  passwordCorrect,
  onSuccess,
  onBack,
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const login = () => {
    if (password === passwordCorrect) {
      setError("");
      onSuccess();
    } else {
      setError("پاسۆردەکە هەڵەیە.");
      setPassword("");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.passwordContainer}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.back}>‹ گەڕانەوە</Text>
        </TouchableOpacity>

        <View style={styles.lockBox}>
          <Text style={styles.lockIcon}>🔐</Text>

          <Text style={styles.passwordTitle}>{title}</Text>

          <Text style={styles.passwordSubtitle}>
            بۆ چوونەژوورەوە پاسۆردەکە بنووسە
          </Text>

          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="پاسۆرد"
            placeholderTextColor="#777"
            secureTextEntry
            style={styles.passwordInput}
            autoCapitalize="none"
            autoCorrect={false}
            onSubmitEditing={login}
          />

          {error ? (
            <Text style={styles.passwordError}>{error}</Text>
          ) : null}

          <TouchableOpacity style={styles.goldBtn} onPress={login}>
            <Text style={styles.goldText}>چوونەژوورەوە</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* =========================
   DASHBOARD
========================= */

function Dashboard({ onBack }) {
  const cards = [
    ["💰", "فرۆشتنی ئەمڕۆ", money(1250000)],
    ["📈", "قازانجی ئەمڕۆ", money(340000)],
    ["💸", "خەرجی ئەمڕۆ", money(120000)],
    ["👥", "قەرزی کڕیاران", money(2180000)],
  ];

  const menu = [
    ["🧾", "فرۆشتن"],
    ["🛍️", "کڕین"],
    ["📦", "کۆگا"],
    ["👥", "کڕیارەکان"],
    ["🏭", "دابینکەرەکان"],
    ["💸", "خەرجییەکان"],
    ["📈", "قازانج و زیان"],
    ["📊", "ڕاپۆرتەکان"],
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.accountingContainer}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.back}>‹ گەڕانەوە</Text>
        </TouchableOpacity>

        <Text style={styles.accountingTitle}>
          📊 Dashboard ـی Shwshawaty ASYA
        </Text>

        <Text style={styles.accountingDate}>
          کورتەی حساباتی ئەمڕۆ
        </Text>

        <View style={styles.accountingGrid}>
          {cards.map((card, index) => (
            <View style={styles.accountingCard} key={index}>
              <Text style={styles.accountingIcon}>{card[0]}</Text>
              <Text style={styles.accountingCardTitle}>
                {card[1]}
              </Text>
              <Text style={styles.accountingCardValue}>
                {card[2]}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.accountingSection}>
          <Text style={styles.accountingSectionTitle}>
            🧾 دوایین مامەڵەکان
          </Text>

          <Transaction
            name="فرۆشتنی طقم جام"
            date="ئەمڕۆ • 08:45"
            value="+ 125,000 د.ع"
            income
          />

          <Transaction
            name="خەرجی گەیاندن"
            date="ئەمڕۆ • 10:20"
            value="- 35,000 د.ع"
          />

          <Transaction
            name="کڕینی کاڵا"
            date="دوێنێ • 15:10"
            value="- 280,000 د.ع"
          />
        </View>

        <View style={styles.accountingSection}>
          <View style={styles.warningHeader}>
            <Text style={styles.accountingSectionTitle}>
              📦 کۆگای کەم
            </Text>

            <Text style={styles.warningNumber}>7</Text>
          </View>

          <Text style={styles.warningText}>
            7 بەرهەم نزیکن لە تەواوبوون.
          </Text>
        </View>

        <Text style={styles.menuTitle}>بەشەکانی حسابات</Text>

        <View style={styles.menuGrid}>
          {menu.map(([icon, title], index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuButton}
              onPress={() =>
                Alert.alert(
                  title,
                  "ئەم بەشە لە قۆناغی داهاتوودا چالاک دەکرێت."
                )
              }
            >
              <Text style={styles.menuIcon}>{icon}</Text>
              <Text style={styles.menuText}>{title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.accountingNote}>
          <Text style={styles.accountingNoteTitle}>🔐 تێبینی</Text>

          <Text style={styles.accountingNoteText}>
            Dashboard ـەکە ئێستا بە شێوەی Demo ـە.
            Database ـی بەرهەمەکان لە Firebase ـەوە دێت.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Transaction({ name, date, value, income }) {
  return (
    <View style={styles.transaction}>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionName}>{name}</Text>
        <Text style={styles.transactionDate}>{date}</Text>
      </View>

      <Text style={income ? styles.income : styles.expense}>
        {value}
      </Text>
    </View>
  );
}

/* =========================
   MANAGER
========================= */

function ManagerPanel({ onBack, onAddProduct }) {
  const items = [
    ["📦", "بەڕێوبەرایەتی بەرهەمەکان"],
    ["➕", "زیادکردنی بەرهەم"],
    ["✏️", "دەستکاریکردنی بەرهەم"],
    ["🗑️", "سڕینەوەی بەرهەم"],
    ["👥", "بەڕێوبەرایەتی کڕیارەکان"],
    ["🏭", "دابینکەرەکان"],
    ["📊", "ڕاپۆرتەکانی فرۆشتن"],
    ["⚙️", "ڕێکخستنەکان"],
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.accountingContainer}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.back}>‹ گەڕانەوە</Text>
        </TouchableOpacity>

        <Text style={styles.managerTitle}>
          👨‍💼 بەشی بەڕێوبەر
        </Text>

        <Text style={styles.accountingDate}>
          بەخێربێیت بۆ بەشی بەڕێوبەرایەتی
        </Text>

        <View style={styles.managerWelcome}>
          <Text style={styles.managerWelcomeIcon}>👨‍💼</Text>

          <Text style={styles.managerWelcomeTitle}>
            بەڕێوبەری Shwshawaty ASYA
          </Text>

          <Text style={styles.managerWelcomeText}>
            لێرە دەتوانیت بەشەکانی بەڕێوبەرایەتی کۆنترۆڵ بکەیت.
          </Text>
        </View>

        <Text style={styles.menuTitle}>بەشەکانی بەڕێوبەر</Text>

        <View style={styles.menuGrid}>
          {items.map(([icon, title], index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuButton}
              onPress={() => {
  if (title === "زیادکردنی بەرهەم") {
    onAddProduct();
  } else {
    Alert.alert(
      title,
      "ئەم بەشە لە قۆناغی داهاتوودا چالاک دەکرێت."
    );
  }
}}
            >
              <Text style={styles.menuIcon}>{icon}</Text>
              <Text style={styles.menuText}>{title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* =========================
   MAIN APP
========================= */

export default function App() {
  const [started, setStarted] = useState(false);
  const [tab, setTab] = useState("home");
  const [category, setCategory] = useState("هەموو");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState([]);
  const [selected, setSelected] = useState(null);
  const [screen, setScreen] = useState("main");

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");

  /* =========================
     FIREBASE PRODUCTS
  ========================= */

  useEffect(() => {
    let unsubscribe;

    try {
      const productsRef = collection(db, "products");

      unsubscribe = onSnapshot(
        productsRef,
        (snapshot) => {
          const firestoreProducts = snapshot.docs.map((doc) => {
            const data = doc.data() || {};

            return {
              id: doc.id,
              name: data.name || "بەرهەم",
              price: Number(data.price) || 0,
              category: data.category || "کالای ماڵ",
              image: data.image || "",
            };
          });

          setProducts(firestoreProducts);
          setProductsLoading(false);
          setProductsError("");
        },
        (error) => {
          console.error("Firestore error:", error);

          setProductsLoading(false);
          setProductsError(
            "کێشەیەک هەیە لە پەیوەندی بە Database."
          );
        }
      );
    } catch (error) {
      console.error("Firebase initialization error:", error);

      setProductsLoading(false);
      setProductsError(
        "Firebase بە دروستی ئامادە نەکراوە."
      );
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  /* =========================
     CATEGORIES
  ========================= */

  const categories = useMemo(() => {
    const unique = [
      ...new Set(
        products
          .map((product) => product.category)
          .filter(Boolean)
      ),
    ];

    return ["هەموو", ...unique];
  }, [products]);

  /* =========================
     FILTER
  ========================= */

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        category === "هەموو" ||
        product.category === category;

      const matchesSearch =
        !search ||
        String(product.name)
          .toLowerCase()
          .includes(search);

      return matchesCategory && matchesSearch;
    });
  }, [products, category, query]);

  /* =========================
     CART
  ========================= */

  const addToCart = (product) => {
    setCart((current) => [...current, product]);

    Alert.alert(
      "زیادکرا ✅",
      `${product.name} خرایە ناو سەبەتەکە.`
    );
  };

  /* =========================
     WELCOME
  ========================= */

  if (!started) {
    return (
      <SafeAreaView style={styles.welcomeSafe}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeBrand}>
            Welcome Shwshawaty ASYA
          </Text>

          <Text style={styles.welcomeText}>
            بۆ بینینی بەرهەمەکان کلیک لە بەشی خوارەوە بکە
          </Text>

          <TouchableOpacity
            style={styles.startButton}
            onPress={() => setStarted(true)}
          >
            <Text style={styles.startButtonText}>
              دەستپێکردنی کڕین
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  /* =========================
     DASHBOARD PASSWORD
  ========================= */

  if (screen === "dashboardPassword") {
    return (
      <PasswordScreen
        title="Dashboard"
        passwordCorrect="gardunali"
        onSuccess={() => setScreen("dashboard")}
        onBack={() => setScreen("main")}
      />
    );
  }

  if (screen === "dashboard") {
    return <Dashboard onBack={() => setScreen("main")} />;
  }

  /* =========================
     MANAGER PASSWORD
  ========================= */

  if (screen === "managerPassword") {
    return (
      <PasswordScreen
        title="بەشی بەڕێوبەر"
        passwordCorrect="1993"
        onSuccess={() => setScreen("manager")}
        onBack={() => setScreen("main")}
      />
    );
  }

if (screen === "addProduct") {
  return (
    <ManagerPanel
      onBack={() => setScreen("main")}
      onAddProduct={() => setScreen("addProduct")}
    />
  );
}

  /* =========================
     PRODUCT DETAILS
  ========================= */

  if (selected) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView>
          <TouchableOpacity onPress={() => setSelected(null)}>
            <Text style={styles.back}>‹ گەڕانەوە</Text>
          </TouchableOpacity>

          {selected.image ? (
            <Image
              source={{ uri: selected.image }}
              style={styles.hero}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.noImage}>
              <Text style={styles.noImageText}>
                وێنەی بەرهەم بەردەست نییە
              </Text>
            </View>
          )}

          <View style={styles.pad}>
            <Text style={styles.title}>{selected.name}</Text>

            <Text style={styles.price}>
              {money(selected.price)}
            </Text>

            <Text style={styles.desc}>
              بەرهەمێکی جوان و کوالێتی بۆ ماڵەکەت.
              بۆ زانیاری زیاتر پەیوەندیمان پێوە بکە.
            </Text>

            <TouchableOpacity
              style={styles.goldBtn}
              onPress={() => addToCart(selected)}
            >
              <Text style={styles.goldText}>
                🛒 زیادکردن بۆ سەبەت
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  /* =========================
     MAIN
  ========================= */

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.brand}>ASYA</Text>
        <Text style={styles.sub}>
          Welcome Shwshawaty ASYA
        </Text>
      </View>

      {tab === "home" && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.banner}>
            <Text style={styles.bannerTitle}>
              کۆمەڵە خواردن
            </Text>

            <Text style={styles.bannerSub}>
              نوێ و تایبەت بۆ تۆ
            </Text>
          </View>

          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="بگەڕێ بۆ بەرهەم..."
            placeholderTextColor="#777"
            style={styles.search}
            textAlign="right"
            autoCorrect={false}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.cats}
            contentContainerStyle={styles.catsContent}
          >
            {categories.map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => setCategory(item)}
                style={[
                  styles.cat,
                  category === item && styles.catActive,
                ]}
              >
                <Text
                  style={
                    category === item
                      ? styles.catTextActive
                      : styles.catText
                  }
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.section}>
            بەرهەمە نوێکان
          </Text>

          {productsLoading && (
            <Text style={styles.loadingText}>
              بەرهەمەکان دەهێنرێن...
            </Text>
          )}

          {productsError ? (
            <Text style={styles.errorText}>
              {productsError}
            </Text>
          ) : null}

          {!productsLoading && products.length === 0 && (
            <Text style={styles.emptyProducts}>
              هیچ بەرهەمێک لە Database نەدۆزرایەوە.
            </Text>
          )}

          {!productsLoading &&
            products.length > 0 &&
            filtered.length === 0 && (
              <Text style={styles.emptyProducts}>
                هیچ بەرهەمێک بۆ ئەم گەڕانە نەدۆزرایەوە.
              </Text>
            )}

          <FlatList
            data={filtered}
            numColumns={2}
            scrollEnabled={false}
            keyExtractor={(item) => String(item.id)}
            columnWrapperStyle={styles.column}
            contentContainerStyle={styles.grid}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setSelected(item)}
                >
                  {item.image ? (
                    <Image
                      source={{ uri: item.image }}
                      style={styles.cardImg}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.cardImgPlaceholder}>
                      <Text
                        style={
                          styles.cardImgPlaceholderText
                        }
                      >
                        وێنە نییە
                      </Text>
                    </View>
                  )}

                  <Text
                    style={styles.cardName}
                    numberOfLines={2}
                  >
                    {item.name}
                  </Text>

                  <Text style={styles.cardPrice}>
                    {money(item.price)}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.smallBtn}
                  onPress={() => addToCart(item)}
                >
                  <Text style={styles.smallBtnText}>
                    + سەبەت
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </ScrollView>
      )}

      {tab === "cart" && (
        <ScrollView contentContainerStyle={styles.pad}>
          <Text style={styles.pageTitle}>
            سەبەت 🛒
          </Text>

          {cart.length === 0 ? (
            <Text style={styles.empty}>
              سەبەتەکەت بەتاڵە.
            </Text>
          ) : (
            <>
              {cart.map((product, index) => (
                <View
                  style={styles.row}
                  key={`${product.id}-${index}`}
                >
                  <Text style={styles.rowName}>
                    {product.name}
                  </Text>

                  <Text style={styles.cartPrice}>
                    {money(product.price)}
                  </Text>
                </View>
              ))}

              <TouchableOpacity
                style={styles.goldBtn}
                onPress={() =>
                  Alert.alert(
                    "داواکاری",
                    "لە وەشانی داهاتوودا داواکارییەکە بە سیستەمی فرۆشتن نێردراوە."
                  )
                }
              >
                <Text style={styles.goldText}>
                  تەواوکردنی داواکاری
                </Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      )}

      {tab === "profile" && (
        <ScrollView
          contentContainerStyle={styles.pad}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.pageTitle}>
            پڕۆفایل 👤
          </Text>

          <Text style={styles.desc}>
            بەخێربێیت بۆ پڕۆفایلی Shwshawaty ASYA.
          </Text>

          <TouchableOpacity
            style={styles.profileEntry}
            onPress={() =>
              setScreen("dashboardPassword")
            }
          >
            <Text style={styles.profileEntryIcon}>
              📊
            </Text>

            <View style={styles.profileEntryText}>
              <Text style={styles.profileEntryTitle}>
                Dashboard
              </Text>

              <Text style={styles.profileEntrySub}>
                داشبۆرد و حساباتی Shwshawaty ASYA
              </Text>
            </View>

            <Text style={styles.profileArrow}>‹</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.profileEntry}
            onPress={() =>
              setScreen("managerPassword")
            }
          >
            <Text style={styles.profileEntryIcon}>
              👨‍💼
            </Text>

            <View style={styles.profileEntryText}>
              <Text style={styles.profileEntryTitle}>
                بەشی بەڕێوبەر
              </Text>

              <Text style={styles.profileEntrySub}>
                بەڕێوبەرایەتی و کۆنترۆڵی ئەپ
              </Text>
            </View>

            <Text style={styles.profileArrow}>‹</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      <View style={styles.nav}>
        <TouchableOpacity
          onPress={() => setTab("home")}
          style={styles.navButton}
        >
          <Text
            style={
              tab === "home"
                ? styles.navOn
                : styles.navOff
            }
          >
            ⌂{"\n"}سەرەکی
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setTab("cart")}
          style={styles.navButton}
        >
          <Text
            style={
              tab === "cart"
                ? styles.navOn
                : styles.navOff
            }
          >
            🛒{"\n"}سەبەت ({cart.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setTab("profile")}
          style={styles.navButton}
        >
          <Text
            style={
              tab === "profile"
                ? styles.navOn
                : styles.navOff
            }
          >
            👤{"\n"}پڕۆفایل
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* =========================
   STYLES
========================= */

const styles = StyleSheet.create({
  welcomeSafe: {
    flex: 1,
    backgroundColor: "#0f0f0f",
  },

  welcomeContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
  },

  welcomeBrand: {
    fontSize: 30,
    fontWeight: "800",
    color: "#d7a52b",
    textAlign: "center",
  },

  welcomeText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginTop: 18,
    lineHeight: 28,
  },

  startButton: {
    backgroundColor: "#d7a52b",
    paddingVertical: 16,
    paddingHorizontal: 45,
    borderRadius: 14,
    marginTop: 35,
    minWidth: 220,
    alignItems: "center",
  },

  startButtonText: {
    color: "#111",
    fontSize: 17,
    fontWeight: "800",
  },

  safe: {
    flex: 1,
    backgroundColor: "#0f0f0f",
  },

  header: {
    padding: 18,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#292929",
  },

  brand: {
    fontSize: 30,
    fontWeight: "800",
    color: "#d7a52b",
  },

  sub: {
    color: "#fff",
    fontSize: 12,
    marginTop: 2,
  },

  banner: {
    margin: 16,
    padding: 22,
    borderRadius: 18,
    backgroundColor: "#1d1d1d",
  },

  bannerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#e1b63e",
    textAlign: "right",
  },

  bannerSub: {
    color: "#fff",
    marginTop: 6,
    fontSize: 16,
    textAlign: "right",
  },

  search: {
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: "#111",
  },

  cats: {
    marginVertical: 12,
  },

  catsContent: {
    paddingHorizontal: 16,
  },

  cat: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#555",
    marginRight: 8,
  },

  catActive: {
    backgroundColor: "#d7a52b",
    borderColor: "#d7a52b",
  },

  catText: {
    color: "#ddd",
  },

  catTextActive: {
    color: "#111",
    fontWeight: "700",
  },

  section: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    paddingHorizontal: 16,
    paddingVertical: 8,
    textAlign: "right",
  },

  loadingText: {
    color: "#d7a52b",
    textAlign: "center",
    fontSize: 16,
    padding: 30,
  },

  errorText: {
    color: "#ff6262",
    textAlign: "center",
    fontSize: 15,
    padding: 20,
  },

  emptyProducts: {
    color: "#aaa",
    textAlign: "center",
    fontSize: 16,
    padding: 30,
  },

  grid: {
    padding: 16,
    paddingBottom: 30,
  },

  column: {
    gap: 12,
    marginBottom: 12,
  },

  card: {
    backgroundColor: "#1c1c1c",
    borderRadius: 14,
    padding: 9,
    flex: 1,
  },

  cardImg: {
    width: "100%",
    height: 145,
    borderRadius: 10,
  },

  cardImgPlaceholder: {
    width: "100%",
    height: 145,
    borderRadius: 10,
    backgroundColor: "#292929",
    alignItems: "center",
    justifyContent: "center",
  },

  cardImgPlaceholderText: {
    color: "#888",
  },

  cardName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 8,
    textAlign: "right",
  },

  cardPrice: {
    color: "#d7a52b",
    fontWeight: "800",
    marginTop: 5,
    textAlign: "right",
  },

  smallBtn: {
    backgroundColor: "#d7a52b",
    borderRadius: 9,
    padding: 8,
    marginTop: 8,
    alignItems: "center",
  },

  smallBtnText: {
    color: "#111",
    fontWeight: "800",
  },

  nav: {
    height: 68,
    borderTopWidth: 1,
    borderTopColor: "#333",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#101010",
  },

  navButton: {
    minWidth: 80,
    alignItems: "center",
  },

  navOn: {
    color: "#d7a52b",
    textAlign: "center",
    fontWeight: "800",
  },

  navOff: {
    color: "#aaa",
    textAlign: "center",
  },

  pad: {
    padding: 18,
    paddingBottom: 30,
  },

  pageTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 20,
    textAlign: "right",
  },

  empty: {
    color: "#aaa",
    fontSize: 17,
    textAlign: "right",
  },

  row: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  rowName: {
    color: "#fff",
    flex: 1,
    marginRight: 10,
    textAlign: "right",
  },

  cartPrice: {
    color: "#d7a52b",
    fontWeight: "700",
  },

  goldBtn: {
    backgroundColor: "#d7a52b",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },

  goldText: {
    color: "#111",
    fontWeight: "800",
    fontSize: 16,
  },

  back: {
    color: "#d7a52b",
    fontSize: 18,
    padding: 16,
    textAlign: "right",
  },

  hero: {
    width: "100%",
    height: 330,
  },

  noImage: {
    width: "100%",
    height: 330,
    backgroundColor: "#1c1c1c",
    justifyContent: "center",
    alignItems: "center",
  },

  noImageText: {
    color: "#888",
    fontSize: 16,
  },

  title: {
    fontSize: 25,
    fontWeight: "800",
    color: "#fff",
    textAlign: "right",
  },

  price: {
    fontSize: 22,
    color: "#d7a52b",
    fontWeight: "800",
    marginTop: 10,
    textAlign: "right",
  },

  desc: {
    color: "#ccc",
    fontSize: 16,
    lineHeight: 26,
    marginTop: 15,
    textAlign: "right",
  },

  passwordContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },

  lockBox: {
    margin: 20,
    padding: 25,
    borderRadius: 20,
    backgroundColor: "#1c1c1c",
    borderWidth: 1,
    borderColor: "#333",
    alignItems: "center",
  },

  lockIcon: {
    fontSize: 50,
    marginBottom: 15,
  },

  passwordTitle: {
    color: "#d7a52b",
    fontSize: 27,
    fontWeight: "800",
    textAlign: "center",
  },

  passwordSubtitle: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 20,
  },

  passwordInput: {
    width: "100%",
    backgroundColor: "#fff",
    color: "#111",
    borderRadius: 12,
    padding: 14,
    fontSize: 17,
    textAlign: "center",
  },

  passwordError: {
    color: "#ff6262",
    marginTop: 12,
    fontSize: 14,
    fontWeight: "700",
  },

  profileEntry: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1c1c1c",
    borderRadius: 16,
    padding: 16,
    marginTop: 15,
    borderWidth: 1,
    borderColor: "#292929",
  },

  profileEntryIcon: {
    fontSize: 31,
    marginRight: 12,
  },

  profileEntryText: {
    flex: 1,
  },

  profileEntryTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
    textAlign: "right",
  },

  profileEntrySub: {
    color: "#999",
    fontSize: 12,
    marginTop: 5,
    textAlign: "right",
  },

  profileArrow: {
    color: "#d7a52b",
    fontSize: 30,
    marginLeft: 8,
  },

  accountingContainer: {
    padding: 16,
    paddingBottom: 45,
  },

  accountingTitle: {
    color: "#d7a52b",
    fontSize: 25,
    fontWeight: "800",
    textAlign: "right",
    marginTop: 4,
  },

  accountingDate: {
    color: "#999",
    fontSize: 14,
    textAlign: "right",
    marginTop: 6,
    marginBottom: 18,
  },

  accountingGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  accountingCard: {
    width: "48%",
    backgroundColor: "#1c1c1c",
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#292929",
  },

  accountingIcon: {
    fontSize: 25,
    textAlign: "right",
  },

  accountingCardTitle: {
    color: "#aaa",
    fontSize: 13,
    textAlign: "right",
    marginTop: 10,
  },

  accountingCardValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "right",
    marginTop: 6,
  },

  accountingSection: {
    backgroundColor: "#1c1c1c",
    borderRadius: 16,
    padding: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#292929",
  },

  accountingSectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "right",
  },

  transaction: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#292929",
  },

  transactionInfo: {
    flex: 1,
    marginRight: 10,
  },

  transactionName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "right",
  },

  transactionDate: {
    color: "#888",
    fontSize: 12,
    marginTop: 4,
    textAlign: "right",
  },

  income: {
    color: "#45d483",
    fontWeight: "800",
  },

  expense: {
    color: "#ff6262",
    fontWeight: "800",
  },

  warningHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  warningNumber: {
    color: "#ff6262",
    fontSize: 24,
    fontWeight: "900",
  },

  warningText: {
    color: "#aaa",
    textAlign: "right",
    marginTop: 8,
  },

  menuTitle: {
    color: "#d7a52b",
    fontSize: 20,
    fontWeight: "800",
    textAlign: "right",
    marginTop: 24,
    marginBottom: 12,
  },

  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  menuButton: {
    width: "48%",
    backgroundColor: "#1c1c1c",
    borderRadius: 14,
    paddingVertical: 18,
    marginBottom: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#292929",
  },

  menuIcon: {
    fontSize: 25,
  },

  menuText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 7,
    textAlign: "center",
  },

  accountingNote: {
    backgroundColor: "#171717",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#333",
    padding: 15,
    marginTop: 8,
  },

  accountingNoteTitle: {
    color: "#d7a52b",
    fontSize: 15,
    fontWeight: "800",
    textAlign: "right",
  },

  accountingNoteText: {
    color: "#999",
    fontSize: 13,
    lineHeight: 22,
    textAlign: "right",
    marginTop: 7,
  },

  managerTitle: {
    color: "#d7a52b",
    fontSize: 27,
    fontWeight: "800",
    textAlign: "right",
    marginTop: 4,
  },

  managerWelcome: {
    backgroundColor: "#1c1c1c",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#292929",
    padding: 20,
    alignItems: "center",
  },

  managerWelcomeIcon: {
    fontSize: 50,
  },

  managerWelcomeTitle: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "800",
    marginTop: 10,
    textAlign: "center",
  },

  managerWelcomeText: {
    color: "#aaa",
    fontSize: 14,
    lineHeight: 23,
    marginTop: 8,
    textAlign: "center",
  },
});
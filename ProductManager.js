import React, { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { addDoc, collection } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import { db, storage } from "./firebase";

import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";

export default function ProductManager({ onBack }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageUri, setImageUri] = useState("");

  // هەڵبژاردنی وێنە لە گەلەری
  const pickImage = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "ڕێگەپێدان پێویستە",
        "تکایە ڕێگە بدە بە ئەپەکە دەستی بە گەلەری بگات."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setImageUrl("");
    }
  };

  // Upload کردنی وێنە بۆ Firebase Storage
  const uploadImage = async () => {
    if (!imageUri) {
      return "";
    }

    const response = await fetch(imageUri);
    const blob = await response.blob();

    const filename = `products/${Date.now()}.jpg`;
    const storageRef = ref(storage, filename);

    await uploadBytes(storageRef, blob);

    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  };

  // زیادکردنی بەرهەم
  const saveProduct = async () => {
    if (!name.trim()) {
      Alert.alert("هەڵە", "تکایە ناوی بەرهەم بنووسە.");
      return;
    }

    if (!price.trim()) {
      Alert.alert("هەڵە", "تکایە نرخ بنووسە.");
      return;
    }

    if (!category.trim()) {
      Alert.alert("هەڵە", "تکایە جۆری بەرهەم بنووسە.");
      return;
    }

    try {
      const uploadedImage = await uploadImage();

      await addDoc(collection(db, "products"), {
        name: name.trim(),
        price: Number(price),
        category: category.trim(),
        stock: Number(stock) || 0,
        image: uploadedImage || imageUrl.trim(),
        createdAt: Date.now(),
      });

      Alert.alert(
        "سەرکەوتوو بوو ✅",
        "بەرهەمەکە بە سەرکەوتوویی زیاد کرا."
      );

      setName("");
      setPrice("");
      setCategory("");
      setStock("");
      setImageUrl("");
      setImageUri("");
    } catch (error) {
      console.log("SAVE PRODUCT ERROR:", error);

      Alert.alert(
        "هەڵە",
        "بەرهەمەکە زیاد نەکرا. تکایە Firebase ـەکە بپشکنە."
      );
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>

        <TouchableOpacity onPress={onBack}>
          <Text style={styles.back}>‹ گەڕانەوە</Text>
        </TouchableOpacity>

        <Text style={styles.title}>
          ➕ زیادکردنی بەرهەم
        </Text>

        <Text style={styles.subtitle}>
          زانیارییەکانی بەرهەم پڕ بکەرەوە
        </Text>

        <View style={styles.card}>

          <Text style={styles.label}>
            ناوی بەرهەم
          </Text>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="ناوی بەرهەم"
            placeholderTextColor="#777"
            style={styles.input}
            textAlign="right"
          />

          <Text style={styles.label}>
            نرخ
          </Text>

          <TextInput
            value={price}
            onChangeText={setPrice}
            placeholder="مثلاً 75000"
            placeholderTextColor="#777"
            keyboardType="numeric"
            style={styles.input}
            textAlign="right"
          />

          <Text style={styles.label}>
            جۆری بەرهەم
          </Text>

          <TextInput
            value={category}
            onChangeText={setCategory}
            placeholder="مثلاً کالای ماڵ"
            placeholderTextColor="#777"
            style={styles.input}
            textAlign="right"
          />

          <Text style={styles.label}>
            ژمارەی کۆگا
          </Text>

          <TextInput
            value={stock}
            onChangeText={setStock}
            placeholder="مثلاً 20"
            placeholderTextColor="#777"
            keyboardType="numeric"
            style={styles.input}
            textAlign="right"
          />

          <Text style={styles.imageTitle}>
            🖼️ وێنەی بەرهەم
          </Text>

          <TextInput
            value={imageUrl}
            onChangeText={setImageUrl}
            placeholder="🔗 لینکی وێنە دابنێ"
            placeholderTextColor="#777"
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />

          {imageUri || imageUrl ? (
            <Image
              source={{ uri: imageUri || imageUrl }}
              style={styles.preview}
              resizeMode="cover"
            />
          ) : null}

          <TouchableOpacity
            style={styles.galleryButton}
            onPress={pickImage}
          >
            <Text style={styles.galleryText}>
              📷 هەڵبژاردن لە گەلەری
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={saveProduct}
          >
            <Text style={styles.saveText}>
              ➕ زیادکردنی بەرهەم
            </Text>
          </TouchableOpacity>

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = {
  safe: {
    flex: 1,
    backgroundColor: "#0f0f0f",
  },

  container: {
    padding: 18,
    paddingBottom: 50,
  },

  back: {
    color: "#d7a52b",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 20,
  },

  title: {
    color: "#d7a52b",
    fontSize: 27,
    fontWeight: "800",
    textAlign: "center",
  },

  subtitle: {
    color: "#aaa",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#1b1b1b",
    borderRadius: 18,
    padding: 16,
  },

  label: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "right",
    marginBottom: 7,
    marginTop: 10,
  },

  input: {
    backgroundColor: "#fff",
    color: "#111",
    borderRadius: 11,
    padding: 13,
    fontSize: 15,
    marginBottom: 8,
  },

  imageTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "right",
    marginTop: 15,
    marginBottom: 10,
  },

  preview: {
    width: "100%",
    height: 220,
    borderRadius: 14,
    marginTop: 8,
    marginBottom: 12,
  },

  galleryButton: {
    borderWidth: 1,
    borderColor: "#d7a52b",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginTop: 5,
  },

  galleryText: {
    color: "#d7a52b",
    fontSize: 16,
    fontWeight: "800",
  },

  saveButton: {
    backgroundColor: "#d7a52b",
    borderRadius: 13,
    padding: 15,
    alignItems: "center",
    marginTop: 18,
  },

  saveText: {
    color: "#111",
    fontSize: 17,
    fontWeight: "900",
  },
};
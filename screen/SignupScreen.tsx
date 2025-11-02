import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { supabase } from "../lib/supabase";
import bcrypt from "bcryptjs";

// ตั้ง fallback สำหรับ React Native
bcrypt.setRandomFallback((len) => {
  let buf = [];
  for (let i = 0; i < len; i++) buf.push(Math.floor(Math.random() * 256));
  return buf;
});

export default function SignupScreen({ navigation }) {
  const [username, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password_hash, setPassword] = useState("");

  const handleSignup = async () => {
    const cleanEmail = email.trim();

    if (!username || !cleanEmail || !password_hash) {
      alert("Please fill all fields");
      return;
    }

    // ตรวจสอบ format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      alert("Invalid email format");
      return;
    }

    try {
      // 1️⃣ หา id ใหม่: max(id)+1
      const { data: lastUser, error: lastError } = await supabase
        .from("users")
        .select("id")
        .order("id", { ascending: false })
        .limit(1)
        .single();

      if (lastError && lastError.code !== "PGRST116") throw lastError; // PGRST116 = ไม่มี row
      const newId = lastUser ? lastUser.id + 1 : 1;

      // 2️⃣ Hash password
      const hashedPassword = bcrypt.hashSync(password_hash, 10);

      // 3️⃣ Insert user
      const { data, error } = await supabase
        .from("users")
        .insert([{ id: newId, username, email: cleanEmail, password_hash: hashedPassword }]);

      if (error) throw error;

      alert("Signup successful!");
      navigation.navigate("Login");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account ✨</Text>
      <Text style={styles.subtitle}>Sign up to get started</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor="#888"
        value={username}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry
        value={password_hash}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

// ===== Styles =====
const PRIMARY = "#B2FBA5";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FFF7",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: "#2C4A34",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B8766",
    marginBottom: 30,
  },
  input: {
    backgroundColor: "white",
    padding: 14,
    borderRadius: 14,
    fontSize: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2F7DB",
  },
  button: {
    backgroundColor: PRIMARY,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 4,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1F3D23",
  },
});

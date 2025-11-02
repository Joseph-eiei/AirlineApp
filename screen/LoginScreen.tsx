import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { supabase } from "../lib/supabase";
import bcrypt from "bcryptjs";

// สำหรับ React Native
bcrypt.setRandomFallback((len) => {
  let buf = [];
  for (let i = 0; i < len; i++) buf.push(Math.floor(Math.random() * 256));
  return buf;
});

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    try {
      // ดึง user จาก Supabase
      const { data: user, error } = await supabase
        .from("users")
        .select("id, username, email, password_hash")
        .eq("email", cleanEmail)
        .single();

      if (error || !user) {
        Alert.alert("Login failed", "User not found");
        return;
      }

      // ตรวจสอบ password ด้วย bcrypt
      const isValid = bcrypt.compareSync(password, user.password_hash);
      if (!isValid) {
        Alert.alert("Login failed", "Incorrect password");
        return;
      }

      // Login ผ่าน → ส่ง email ไปหน้า Account
      navigation.replace("Account", { email: user.email });

    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome 👋</Text>
      <Text style={styles.subtitle}>Log in to continue</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
        <Text style={styles.link}>Don't have an account? Sign up</Text>
      </TouchableOpacity>
    </View>
  );
}

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
  link: {
    marginTop: 16,
    fontSize: 15,
    color: "#4B8A55",
    textAlign: "center",
  },
});

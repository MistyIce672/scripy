import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuthStore } from "../store/auth";

type Mode = "email" | "code" | "password";

export default function SignInScreen() {
  const [mode, setMode] = useState<Mode>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { sendOtp, verifyOtp, signInWithPassword, loading } = useAuthStore();

  async function handleSendCode() {
    setError(null);
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    const result = await sendOtp(email.trim());
    if (result.error) {
      setError(result.error);
    } else {
      setMode("code");
    }
  }

  async function handleVerifyCode() {
    setError(null);
    if (!code.trim()) {
      setError("Please enter the code");
      return;
    }
    const result = await verifyOtp(email.trim(), code.trim());
    if (result.error) {
      setError(result.error);
    }
  }

  async function handlePasswordSignIn() {
    setError(null);
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    if (!password) {
      setError("Please enter your password");
      return;
    }
    const result = await signInWithPassword(email.trim(), password);
    if (result.error) {
      setError(result.error);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        <Text style={styles.title}>MiniApp Platform</Text>
        <Text style={styles.subtitle}>
          Create, share, and run HTML mini apps
        </Text>

        {mode === "email" && (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              autoFocus
              editable={!loading}
              onSubmitEditing={handleSendCode}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Pressable
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSendCode}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Sending..." : "Send Verification Code"}
              </Text>
            </Pressable>
            <Pressable onPress={() => { setError(null); setMode("password"); }}>
              <Text style={styles.linkText}>Sign in with password instead</Text>
            </Pressable>
          </View>
        )}

        {mode === "code" && (
          <View style={styles.form}>
            <Text style={styles.codeHeading}>Enter the code</Text>
            <Text style={styles.codeSubtext}>We sent an 8-digit code to {email}</Text>
            <TextInput
              style={styles.input}
              value={code}
              onChangeText={setCode}
              placeholder="12345678"
              placeholderTextColor="#999"
              keyboardType="number-pad"
              autoFocus
              maxLength={8}
              editable={!loading}
              onSubmitEditing={handleVerifyCode}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Pressable
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleVerifyCode}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Verifying..." : "Verify"}
              </Text>
            </Pressable>
            <Pressable onPress={() => { setError(null); setCode(""); setMode("email"); }}>
              <Text style={styles.linkText}>Use a different email</Text>
            </Pressable>
          </View>
        )}

        {mode === "password" && (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              autoFocus
              editable={!loading}
            />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor="#999"
              secureTextEntry
              editable={!loading}
              onSubmitEditing={handlePasswordSignIn}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Pressable
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handlePasswordSignIn}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Signing in..." : "Sign In"}
              </Text>
            </Pressable>
            <Pressable onPress={() => { setError(null); setPassword(""); setMode("email"); }}>
              <Text style={styles.linkText}>Sign in with verification code instead</Text>
            </Pressable>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1a1a1a",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 40,
  },
  form: {
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },
  error: {
    color: "#D32F2F",
    fontSize: 14,
  },
  button: {
    backgroundColor: "#1A73E8",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  linkText: {
    color: "#1A73E8",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 4,
  },
  codeHeading: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a1a1a",
    textAlign: "center",
  },
  codeSubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 4,
  },
});

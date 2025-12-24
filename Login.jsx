import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "../utils/firebase";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // 🔹 NEW
  const [isSignup, setIsSignup] = useState(false);

  const navigate = useNavigate();

  const handleAuth = async () => {
    try {
      if (isSignup) {
        // 🔹 CREATE USER
        const userCredential =
          await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );

        // 🔴 SET DISPLAY NAME (THIS IS THE FIX)
        await updateProfile(userCredential.user, {
          displayName: name,
        });

        alert("Account created successfully!");
      } else {
        // 🔹 LOGIN
        await signInWithEmailAndPassword(auth, email, password);
      }

      navigate("/dashboard");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>{isSignup ? "Create Account" : "Login"}</h2>

        {/* 🔹 NAME FIELD ONLY FOR SIGNUP */}
        {isSignup && (
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleAuth}>
          {isSignup ? "Sign Up" : "Login"}
        </button>

        <p
          style={{
            marginTop: "10px",
            cursor: "pointer",
            color: "#60a5fa",
          }}
          onClick={() => setIsSignup(!isSignup)}
        >
          {isSignup
            ? "Already have an account? Login"
            : "New user? Create an account"}
        </p>
      </div>
    </div>
  );
}

'use client'

import { useRouter} from "next/navigation";
import { useState } from "react";


export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if(!response.ok)
      {
        throw new Error(data.message || "An unknown error occurred");
      }
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("https://www.youtube.com/watch?v=dQw4w9WgXcQ"); // ":>" -Mr. Bogdanovich
    }
    catch (err)
    {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    }
    finally
    {
      setIsLoading(false);
    }
  };



  return(
    <main>
      <div>
        <h1>Welcome back!</h1>
        <p>Log into your account</p>
        <br/>
        <div>
          {error && (
            <div>
              <p className="error">{error}</p>
            </div>
          )}
          <br/>

          <form onSubmit={handleSubmit}>
            <div>
              <p>Username/Email</p>
              <input
                type="email"
                id={"email"}
                name={"email"}
                autoComplete={"email"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={ "eg. JohnPork/JohnPork@example.com"}
              />
            </div>
            <br/>
            <div>
              <p>Password</p>
              <input
                type="password"
                id={"password"}
                name={"password"}
                autoComplete={"current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={"Enter your password"}
              />
              <p></p>
              <a href="~/login">Forgot password?</a>
            </div>
            <br/><br/>
            <div>
              <button
                type={"submit"}
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Log in"}
              </button>

            </div>
            <br/>
            <p>Don't have an account? <a href="~/login">Sign up</a></p>
          </form>
        </div>
      </div>
    </main>
  )
}
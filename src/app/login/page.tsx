'use client'

import { useRouter} from "next/navigation";
import { useState } from "react";


export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
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
        if(data.fieldErrors)
        {
          setFieldErrors(data.fieldErrors);
        }
        return;
      }
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("https://www.youtube.com/watch?v=dQw4w9WgXcQ"); // ":>" -Mr. Bogdanovich
    }
    catch (err)
    {
      setFieldErrors({general: 'NETWORK ERROR - could not connect to server'});
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
          {fieldErrors.general && (
            <div>
              <p className="error text-red-600">{fieldErrors.general}</p>
            </div>
          )}
          <br/>

          <form onSubmit={handleSubmit}>
            <div>
              <p>Username/Email</p>
              {fieldErrors.email && (<p className="text-red-600">*{fieldErrors.email}</p>) }
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
              {fieldErrors.password && (<p className="text-red-600">*{fieldErrors.password}</p>) }
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
              <a href="~/login" className="text-purple-400">Forgot password?</a>
            </div>
            <br/><br/>
            <div>
              <button
                type={"submit"}
                disabled={isLoading}
                className="text-purple-700"
              >
                {isLoading ? "Logging in..." : "Log in"}
              </button>

            </div>
            <br/>
            <p>Don't have an account? <a href="~/login" className="text-purple-400">Sign up</a></p>
          </form>
        </div>
      </div>
    </main>
  )
}
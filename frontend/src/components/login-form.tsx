"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "@/app/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { setCookie } from "nookies";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [signInWithEmailAndPassword] = useSignInWithEmailAndPassword(auth);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const email = username.includes("@")
        ? username
        : username + "@random.com";
      const res = await signInWithEmailAndPassword(email, password);
      console.log({ res });

      if (res) {
        // Store user in local
        localStorage.setItem("user", username);

        // Clear form fields
        setUsername("");
        setPassword("");

        // Redirect to store
        router.push("/store");

        // Check auth state and admin status
        onAuthStateChanged(auth, async (user) => {
          if (user) {
            const tokenResult = await user.getIdTokenResult();
            const token = await user.getIdToken(true);
            console.log(token);
            const isAdmin = !!tokenResult.claims.admin; // Ensure it's a boolean

            // Store admin status in local as a string
            localStorage.setItem("isAdmin", JSON.stringify(isAdmin));

            if (isAdmin) {
              console.log("User is an admin");
            } else {
              console.log("User is a normal user");
            }

            setCookie(null, "token", token, {
              maxAge: 30 * 24 * 60 * 60, // 30 days
              path: "/", // Cookie available on all routes
            });
          } else {
            if (!localStorage.getItem("user")) {
              router.push("/login");
            }
          }
        });
      } else {
        throw new Error("Invalid Credentials");
      }
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <form
      onSubmit={handleLogin}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your username and password below to login to your account
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">Username</Label>
          <Input
            id="username"
            type="text"
            placeholder="John123"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full">
          Login
        </Button>
      </div>
      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <a href="/signup" className="underline underline-offset-4">
          Sign Up
        </a>
      </div>
    </form>
  );
}

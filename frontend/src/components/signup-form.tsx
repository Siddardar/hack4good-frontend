"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { use, useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "@/app/firebase/config";

const passwordRegex = /^.{6,}$/;

export function SignupForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [validPassword, setValidPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [matchPassword, setMatchPassword] = useState(false);
  const [createUserWithEmailAndPassword] =
    useCreateUserWithEmailAndPassword(auth);

  useEffect(() => {
    const res = passwordRegex.test(password);
    setValidPassword(res);
    const match = password === confirmPassword;
    setMatchPassword(match);
  }, [password, confirmPassword]);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const email = username + "@random.com";
      const res = await createUserWithEmailAndPassword(email, password);
      console.log({ res });
      setUsername("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form
      onSubmit={handleSignup}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Register a new account</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter a new username and password to create an account
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">Username</Label>
          <Input
            id="username"
            type="text"
            placeholder="John123"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="confirm_password">Confirm Password</Label>
          </div>
          <Input
            id="confirm_password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            aria-invalid={matchPassword ? "false" : "true"}
            required
          />
        </div>
        <Button
          type="submit"
          disabled={!matchPassword || !validPassword ? true : false}
          className="w-full"
        >
          Sign Up
        </Button>
      </div>
      <div className="text-center text-sm">
        Already have an account?{" "}
        <a href="/login" className="underline underline-offset-4">
          Login
        </a>
      </div>
    </form>
  );
}

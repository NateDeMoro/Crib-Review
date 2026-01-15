"use server";

import { signIn } from "@/auth";

export async function autoSignInAction(email: string, password: string) {
  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    return { success: true };
  } catch (error) {
    console.error("Auto sign-in error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Sign-in failed"
    };
  }
}

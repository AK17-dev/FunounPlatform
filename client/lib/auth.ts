import { supabase } from "./supabase";

export interface SignUpInput {
  email: string;
  password: string;
  full_name?: string;
  emailRedirectTo?: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

export async function signUp(input: SignUpInput) {
  const { error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        full_name: input.full_name ?? "",
      },
      emailRedirectTo: input.emailRedirectTo,
    },
  });

  if (error) {
    throw error;
  }
}

export async function signIn(input: SignInInput) {
  const { error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error) {
    throw error;
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}
export async function resetPassword(email: string, emailRedirectTo?: string) {
  const redirectUrl =
    emailRedirectTo ||
    (import.meta.env.VITE_SITE_URL
      ? `${import.meta.env.VITE_SITE_URL}/update-password`
      : "http://localhost:5173/update-password");

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  });

  if (error) {
    if (error.status === 429) {
      throw new Error("Too many reset attempts. Please wait a minute and try again.");
    }
    throw error;
  }
}
/*export async function resetPassword(email: string) {
  const redirectUrl =
    import.meta.env.VITE_SITE_URL
      ? `${import.meta.env.VITE_SITE_URL}/update-password`
      : "http://localhost:5173/update-password";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  });

  if (error) {
    if (error.status === 429) {
      throw new Error("Too many reset attempts. Please wait a minute and try again.");
    }

    throw error;
  }
}*/

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw error;
  }
}



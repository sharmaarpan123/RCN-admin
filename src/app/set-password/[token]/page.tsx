"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation } from "@tanstack/react-query";
import { postGuestSetPasswordApi } from "@/apis/ApiCalls";
import { Button, CustomNextLink } from "@/components";
import { catchAsync, checkResponse } from "@/utils/commonFunc";
import { toastSuccess } from "@/utils/toast";

type SetPasswordFormValues = {
  first_name: string;
  last_name?: string;
  password: string;
  confirmPassword: string;
};

const setPasswordSchema: yup.ObjectSchema<SetPasswordFormValues> = yup.object({
  first_name: yup
    .string()
    .trim()
    .required("First name is required.")
    .max(100, "First name must be at most 100 characters."),
  last_name: yup
    .string()
    .trim()
    .required("Last name is required.")
    .max(100, "Last name must be at most 100 characters."),
  password: yup
    .string()
    .trim()
    .required("Password is required.")
    .min(8, "Password must be at least 8 characters."),
  confirmPassword: yup
    .string()
    .trim()
    .required("Please confirm your password.")
    .oneOf([yup.ref("password")], "Passwords must match."),
});

const inputBaseClass =
  "w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white text-sm outline-none transition-all focus:border-[#b9d7c5] focus:shadow-[0_0_0_3px_rgba(31,122,75,0.12)]";
const inputErrorClass =
  "w-full px-3 py-2.5 rounded-xl border border-red-500 bg-white text-sm outline-none";

export default function SetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const token = typeof params.token === "string" ? params.token : "";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetPasswordFormValues>({
    resolver: yupResolver(setPasswordSchema),
    defaultValues: { first_name: "", last_name: "", password: "", confirmPassword: "" },
  });

  const setPasswordMutation = useMutation({
    mutationFn: catchAsync(async (values: SetPasswordFormValues) => {
      const res = await postGuestSetPasswordApi({
        token,
        password: values.password.trim(),
        first_name: values.first_name.trim(),
        last_name: values.last_name?.trim() || undefined,
      });
      const ok = checkResponse({ res, showSuccess: true });
      if (!ok) {
        // Throw to route into onError instead of onSuccess
        throw new Error("Failed to set password");
      }
      return res.data;
    }),
    onSuccess: () => {
      toastSuccess("Password set successfully. You can now sign in.");
      router.push("/login");
    },
  });

  const onSubmit = (values: SetPasswordFormValues) => {
    setPasswordMutation.mutate(values);
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-rcn-bg">
        <div className="max-w-md w-full rounded-2xl border border-rcn-border bg-white shadow-rcn p-6 text-center">
          <p className="text-rcn-muted text-sm m-0">
            Invalid or missing link. Please use the link from your email to set
            your password.
          </p>
          <CustomNextLink href="/login" className="mt-4 inline-block">
            <Button variant="primary" size="sm">
              Back to login
            </Button>
          </CustomNextLink>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 login-bg">
      <div className="max-w-[440px] w-full">
        <div className="rounded-2xl border border-rcn-border bg-white shadow-rcn p-6 md:p-8">
          <div className="flex gap-3 items-center mb-6">
            <div className="w-10 h-10 rounded-xl relative shrink-0 overflow-hidden shadow-[0_8px_18px_rgba(0,0,0,0.12)]">
              <Image
                src="/logo.jpeg"
                alt="RCN Logo"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-rcn-text m-0">
                Set your password
              </h1>
              <p className="text-rcn-muted text-sm m-0">
                Create a password for your account.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="set-password-first-name"
                className="text-xs font-medium text-rcn-muted"
              >
                First name
              </label>
              <input
                id="set-password-first-name"
                type="text"
                autoComplete="given-name"
                placeholder="Enter your first name"
                {...register("first_name")}
                className={errors.first_name ? inputErrorClass : inputBaseClass}
                aria-invalid={!!errors.first_name}
              />
              {errors.first_name && (
                <p className="text-xs text-rcn-danger mt-1 m-0" role="alert">
                  {errors.first_name.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="set-password-last-name"
                className="text-xs font-medium text-rcn-muted"
              >
                Last name
              </label>
              <input
                id="set-password-last-name"
                type="text"
                autoComplete="family-name"
                placeholder="Enter your last name"
                {...register("last_name")}
                className={errors.last_name ? inputErrorClass : inputBaseClass}
                aria-invalid={!!errors.last_name}
              />
              {errors.last_name && (
                <p className="text-xs text-rcn-danger mt-1 m-0" role="alert">
                  {errors.last_name.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="set-password-password"
                className="text-xs font-medium text-rcn-muted"
              >
                New password
              </label>
              <div className="relative">
                <input
                  id="set-password-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Enter password"
                  {...register("password")}
                  className={
                    errors.password ? inputErrorClass : inputBaseClass
                  }
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-rcn-muted text-xs font-medium hover:text-rcn-text"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-rcn-danger mt-1 m-0" role="alert">
                  {errors.password.message}
                </p>
              )}
              <p className="text-xs text-rcn-muted m-0">
                Must be at least 8 characters.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="set-password-confirm"
                className="text-xs font-medium text-rcn-muted"
              >
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="set-password-confirm"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Confirm password"
                  {...register("confirmPassword")}
                  className={
                    errors.confirmPassword ? inputErrorClass : inputBaseClass
                  }
                  aria-invalid={!!errors.confirmPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-rcn-muted text-xs font-medium hover:text-rcn-text"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-rcn-danger mt-1 m-0" role="alert">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="pt-2 flex flex-col gap-3">
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full"
                disabled={setPasswordMutation.isPending}
              >
                {setPasswordMutation.isPending
                  ? "Setting password…"
                  : "Set password"}
              </Button>
              <Link
                href="/login"
                className="text-center text-sm text-rcn-muted hover:text-rcn-accent transition-colors"
              >
                Back to login
              </Link>
            </div>
          </form>
        </div>

        <p className="text-center text-xs text-rcn-muted mt-4">
          If you didn’t request this, you can safely ignore this page.
        </p>
      </div>
    </div>
  );
}

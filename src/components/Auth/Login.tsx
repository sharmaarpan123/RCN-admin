/* eslint-disable react-hooks/immutability */
"use client";

import {
  adminLoginApi,
  adminVerifyOtpApi,
  authLoginApi,
  authVerifyOtpApi,
  organizationLoginApi,
  organizationVerifyOtpApi,
} from "@/apis/ApiCalls";
import {
  AdminPermission,
  AdminProfileData,
} from "@/app/master-admin/types/profile";
import { AuthProfileData } from "@/app/org-portal/types/profile";
import type { StaffProfileData } from "@/app/staff-portal/types/profile";
import { loginSuccess } from "@/store/slices/Auth/authSlice";
import { catchAsync, checkResponse } from "@/utils/commonFunc";
import { loginRoles } from "@/utils/const";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import * as yup from "yup";
import { toastSuccess } from "../../utils/toast";
import Button from "../Button";
import CustomNextLink from "../CustomNextLink";
import Modal from "../Modal";

export type LoginType = "user" | "org" | "admin";

const loginSchema = yup.object({
  loginType: yup.string().oneOf(["user", "org", "admin"]).required(),
  email: yup
    .string()
    .trim()
    .required("Please enter email.")
    .email("Please enter a valid email."),
  password: yup.string().required("Please enter password."),
});

type LoginFormValues = yup.InferType<typeof loginSchema>;

const defaultValues: LoginFormValues = {
  loginType: "org",
  email: "",
  password: "",
};

const OTP_LENGTH = 6;

type PendingOtpData = {
  loginType: LoginType;
  user_id: string;
  redirectTo: string;
};

const Login: React.FC = () => {
  const router = useRouter();

  const [showPassword, setShowPassword] = React.useState(false);
  const [pendingOtp, setPendingOtp] = React.useState<PendingOtpData | null>(
    null,
  );
  const [otpDigits, setOtpDigits] = React.useState<string[]>(() =>
    Array(OTP_LENGTH).fill(""),
  );
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [loginTypeTab, setLoginTypeTab] = React.useState<LoginType>("org");
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues,
    resolver: yupResolver(loginSchema),
  });

  const handleLoginTypeChange = (type: LoginType) => {
    setLoginTypeTab(type);
    setValue("loginType", type, { shouldValidate: true });
  };

  const closeOtpModal = useCallback(() => {
    setPendingOtp(null);
    setOtpDigits(Array(OTP_LENGTH).fill(""));
  }, []);

  const { isPending, mutate: mutateLogin } = useMutation({
    mutationFn: catchAsync(async (variables: LoginFormValues) => {
      const { email, password, loginType: type } = variables;
      const res =
        type === "user"
          ? await authLoginApi({ email: email.trim(), password })
          : type === "org"
            ? await organizationLoginApi({ email: email.trim(), password })
            : await adminLoginApi({ email: email.trim(), password });
      if (checkResponse({ res, showSuccess: true })) {
        const data = res?.data?.data as { user_id?: string };

        const user_id = data?.user_id;
        const redirectTo =
          type === "user"
            ? "/staff-portal"
            : type === "org"
              ? "/org-portal"
              : "/master-admin/dashboard";

        setPendingOtp({ loginType: type, user_id: user_id ?? "", redirectTo });
      }
    }),
  });

  const { isPending: isVerifyPending, mutate: mutateVerifyOtp } = useMutation({
    mutationFn: catchAsync(
      async ({ pending, otp }: { pending: PendingOtpData; otp: string }) => {
        const { loginType, user_id, redirectTo } = pending;
        console.log(redirectTo, "redirectTo");
        const body =
          loginType === "admin"
            ? { user_id, otp }
            : {
                user_id,
                otp,
                device_token: typeof window !== "undefined" ? "" : "",
                device_type: "web",
              };
        const res =
          loginType === "user"
            ? await authVerifyOtpApi(body)
            : loginType === "org"
              ? await organizationVerifyOtpApi(body)
              : await adminVerifyOtpApi(body);
        if (checkResponse({ res, showSuccess: true })) {
          const data = res?.data?.data as {
            accessToken?: string;
            token?: string;
            organization?: AuthProfileData;
            admin?: AdminProfileData;
            user?: StaffProfileData;
            permissions?: AdminPermission[];
          };

          const token = data?.accessToken ?? data?.token ?? null;
          const loginUser:
            | AuthProfileData
            | StaffProfileData
            | AdminProfileData
            | null =
            loginType === "user"
              ? (data?.user ?? null)
              : loginType === "org"
                ? (data?.organization ?? null)
                : data?.admin
                  ? {
                      ...data.admin,
                      permissions: [
                        ...(data.permissions ?? []),
                        {
                          _id: "6988fd20531a3cf60a3262",
                          key: "admin.dashboard",
                          description: "Dashboard",
                        },
                      ],
                    }
                  : null;

          // const role = loginUser
          //   ? loginRoles[loginUser.role_id as keyof typeof loginRoles]
          //   : null;
          // if (
          //   role &&
          //   ["Organization", "Admin", "Super Admin", "Staff"].includes(role)
          // ) {
          //   localStorage.setItem("authToken", token || "");
          //   localStorage.setItem("role", role );
          //   document.cookie = `authorization=${token}; path=/;`;
          //   document.cookie = `role=${role}; path=/;`;
          //   dispatch(loginSuccess({ token, role, loginUser }));
          //   router.push(redirectTo);
          //   closeOtpModal();
          // }

      
          if (
           loginUser && loginUser.role_id
          
          ) {
            localStorage.setItem("authToken", token || "");
            localStorage.setItem("role",loginType );
            document.cookie = `authorization=${token}; path=/;`;
            document.cookie = `role=${loginType}; path=/;`;
            dispatch(loginSuccess({ token, role:loginType, loginUser }));
            router.push(redirectTo);
            closeOtpModal();
          }
        }
      },
    ),
  });

  const handleOtpDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otpDigits];
    next[index] = value.slice(-1);
    setOtpDigits(next);
    if (value && index < OTP_LENGTH - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
      const next = [...otpDigits];
      next[index - 1] = "";
      setOtpDigits(next);
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = pasted
      .split("")
      .concat(Array(OTP_LENGTH).fill(""))
      .slice(0, OTP_LENGTH);
    setOtpDigits(next);
    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    otpInputRefs.current[focusIndex]?.focus();
  };

  const onSubmitOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const otp = otpDigits.join("");
    if (otp.length !== OTP_LENGTH || !pendingOtp) return;
    mutateVerifyOtp({ pending: pendingOtp, otp });
  };

  React.useEffect(() => {
    if (pendingOtp) {
      setOtpDigits(Array(OTP_LENGTH).fill(""));
      otpInputRefs.current[0]?.focus();
    }
  }, [pendingOtp]);

  const onSubmit = (data: LoginFormValues) => {
    mutateLogin(data);
  };

  const inputBaseClass =
    "w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white text-sm outline-none focus:border-[#b9d7c5] focus:shadow-[0_0_0_3px_rgba(31,122,75,0.12)] transition-all";

  return (
    <div className="min-h-screen flex items-center justify-center p-6 login-bg">
      <div className="max-w-[980px] w-full">
        <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-4">
          <div className="rounded-rcn-lg p-5 login-hero-gradient text-rcn-dark-text shadow-rcn min-h-[280px]">
            <div className="flex gap-3 items-center">
              <div className="w-10 h-10 rounded-xl relative shrink-0 overflow-hidden shadow-[0_8px_18px_rgba(0,0,0,0.25)]">
                <Image
                  src="/logo.jpeg"
                  alt="RCN Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h2 className="text-lg font-semibold m-0 mb-2">
                  Referral Coordination Network
                </h2>
                <p className="text-rcn-dark-text/85 text-sm m-0">
                  Admin Panel (Demo — No API)
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-2">
              <div className="flex items-start">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#7cf2b5] mr-2 mt-1"></span>
                <span className="text-sm">
                  Pick Sender & Receiver organizations from the master dashboard
                </span>
              </div>
              <div className="flex items-start">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#7cf2b5] mr-2 mt-1"></span>
                <span className="text-sm">
                  Narrow results by Organization Name + State + Zip
                </span>
              </div>
              <div className="flex items-start">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#7cf2b5] mr-2 mt-1"></span>
                <span className="text-sm">
                  See Sender Inbox & Receiver Inbox side-by-side after selection
                </span>
              </div>
              <div className="flex items-start">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#7cf2b5] mr-2 mt-1"></span>
                <span className="text-sm">
                  Data stored locally in your browser (localStorage)
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-rcn-border rounded-rcn-lg shadow-rcn p-4">
            <h3 className="text-sm font-semibold m-0 mb-3">Sign in</h3>

            <div className="flex gap-1 p-1 rounded-xl bg-[#f1fbf5] border border-rcn-border mb-4">
              {(["user", "org", "admin"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  disabled={isPending}
                  onClick={() => handleLoginTypeChange(type)}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium capitalize transition-all ${
                    loginTypeTab === type
                      ? "bg-white text-[#0b5d36] shadow-sm border border-[#b9e2c8]"
                      : "text-rcn-muted cursor-pointer border border-transparent"
                  }`}
                >
                  {type === "user" ? "User" : type === "org" ? "Org" : "Admin"}
                </button>
              ))}
            </div>

            <p className="text-xs text-rcn-muted m-0 mb-4">
              {loginTypeTab === "org"
                ? "Sign in with your organization account."
                : loginTypeTab === "user"
                  ? "Sign in with your user account."
                  : "Sign in with your admin account."}
            </p>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-1.5 my-2.5">
                <label className="text-xs text-rcn-muted">Email</label>
                <input
                  type="email"
                  placeholder="admin@rcn.local"
                  {...register("email")}
                  className={`${inputBaseClass} ${errors.email ? "border-red-500" : ""}`}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1.5 my-2.5">
                <label className="text-xs text-rcn-muted">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password")}
                    className={`${inputBaseClass} ${errors.password ? "border-red-500" : ""}`}
                    style={{ paddingRight: "2.5rem" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-rcn-muted hover:text-rcn-dark-text transition-colors cursor-pointer p-0 border-0 bg-transparent"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="pointer-events-none"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="pointer-events-none"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-3 mt-3 justify-end items-center">
                <Button variant="primary" type="submit" disabled={isPending}>
                  {isPending ? "Signing in…" : "Login"}
                </Button>
              </div>
            </form>

            <Modal
              isOpen={!!pendingOtp}
              onClose={closeOtpModal}
              maxWidth="400px"
              locked={false}
            >
              <div className="p-2 w-full">
                <h3 className="font-semibold text-lg m-0">Verify OTP</h3>
                <p className="text-sm text-rcn-muted m-0 mt-1">
                  Enter the 6-digit code sent to your email.
                </p>
                <form onSubmit={onSubmitOtp} className="mt-5">
                  <div
                    className="flex gap-2 justify-center"
                    onPaste={handleOtpPaste}
                  >
                    {Array.from({ length: OTP_LENGTH }, (_, i) => (
                      <input
                        key={i}
                        ref={(el) => {
                          otpInputRefs.current[i] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={otpDigits[i] ?? ""}
                        onChange={(e) =>
                          handleOtpDigitChange(i, e.target.value)
                        }
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className="w-11 h-12 text-center text-lg font-semibold rounded-xl border border-rcn-border bg-white outline-none focus:border-[#b9d7c5] focus:shadow-[0_0_0_3px_rgba(31,122,75,0.12)] transition-all"
                        aria-label={`Digit ${i + 1}`}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2 mt-5 justify-end">
                    <Button
                      variant="secondary"
                      size="sm"
                      type="button"
                      onClick={closeOtpModal}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      type="submit"
                      disabled={
                        otpDigits.join("").length !== OTP_LENGTH ||
                        isVerifyPending
                      }
                    >
                      {isVerifyPending ? "Verifying…" : "Verify"}
                    </Button>
                  </div>
                </form>
              </div>
            </Modal>

            <div className="h-px bg-rcn-border my-4"></div>

            <div className="mb-4">
              <p className="text-xs text-rcn-muted m-0 mb-3">
                Don&apos;t have an organization account?
              </p>
              <CustomNextLink
                href="/org-signup"
                variant="primary"
                size="sm"
                className="w-full justify-center"
              >
                Register Your Organization
              </CustomNextLink>
            </div>

          
          </div>
        </div>
        <p className="text-xs text-rcn-muted mt-3 text-center">
          Tip: open this in Chrome/Edge. Everything runs offline.
        </p>
      </div>
    </div>
  );
};

export default Login;

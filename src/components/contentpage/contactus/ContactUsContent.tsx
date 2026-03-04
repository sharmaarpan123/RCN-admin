"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { motion } from "framer-motion";
import { Button, PhoneInputField } from "@/components";
import { postContactApi } from "@/apis/ApiCalls";
import { checkResponse, catchAsync } from "@/utils/commonFunc";

const CONTACT_EMAIL = "jenny.wilson@rcn.com";
const CONTACT_PHONE = "630 547 3566";
const CONTACT_FAX = "630 366 6650";
const CONTACT_ADDRESS = "715 W. Lake Street, Suite 201, Addison, IL, 60101";

const inputClass =
  "w-full px-3 py-2.5 rounded-xl border border-rcn-border bg-white outline-none text-sm font-normal focus:border-rcn-brand/75 focus:ring-2 focus:ring-rcn-brand/12";

const contactFormSchema = yup.object({
  first_name: yup.string().required("First name is required").trim(),
  last_name: yup.string().required("Last name is required").trim(),
  email: yup
    .string()
    .required("Email is required")
    .email("Invalid email")
    .trim(),
  phone_number: yup.string().required("Phone number is required").trim(),
  dial_code: yup.string().required("Dial code is required").trim(),
  query: yup.string().required("Message is required").trim(),
});

type ContactFormValues = yup.InferType<typeof contactFormSchema>;

const defaultValues: ContactFormValues = {
  email: "",
  first_name: "",
  last_name: "",
  phone_number: "",
  query: "",
  dial_code: "",
};

export function ContactUsContent() {
  const [formKey, setFormKey] = React.useState(0);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    mode: "onChange",
    defaultValues,
    resolver: yupResolver(contactFormSchema),
  });

  const onSubmit = (data: ContactFormValues) => {
    catchAsync(async () => {
      const res = await postContactApi({
        email: data.email,
        phone_number: data.dial_code + " " + data.phone_number,
        query: data.query,
        first_name: data.first_name,
        last_name: data.last_name,
      });
      if (checkResponse({ res, showSuccess: true })) {
        reset(defaultValues, { keepDefaultValues: false });
        setFormKey((k) => k + 1);
      }
    })();
  };

  const phone_number = watch("phone_number");
  const dial_code = watch("dial_code") ?? "";

  const phoneValue =
    (dial_code ?? "") + (phone_number ?? "").replace(/\D/g, "");

  const handlePhoneChange = (value: string, country: { dialCode: string }) => {
    setValue(
      "phone_number",
      value.slice(country.dialCode.length).replace(/\D/g, ""),
      { shouldValidate: true },
    );
    setValue("dial_code", country.dialCode, { shouldValidate: true });
  };

  return (
    <motion.section
      className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 -mt-4 relative z-10"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: -80 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <div className="rounded-2xl overflow-hidden shadow-xl p-4 oy-6 border border-rcn-border bg-white flex flex-col lg:flex-row">
        {/* Left: Contact Information - green panel */}
        <div className="lg:w-[380px] rounded-2xl shrink-0 p-6 md:p-8 bg-rcn-gradient  flex flex-col ">
          <h2 className="text-xl font-bold text-white mb-3">
            Contact Information
          </h2>
          <p className="text-white/95 text-sm leading-relaxed mb-6">
            We&apos;re here to help! For questions or assistance, feel free to
            reach out and contact us anytime.
          </p>
          <div className="space-y-4">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="flex items-center gap-3 text-white hover:opacity-90 transition-opacity"
            >
              <span className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </span>
              <span className="text-sm font-medium">{CONTACT_EMAIL}</span>
            </a>
            <a
              href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`}
              className="flex items-center gap-3 text-white hover:opacity-90 transition-opacity"
            >
              <span className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </span>
              <span className="text-sm font-medium">{CONTACT_PHONE}</span>
            </a>

            <p className="flex items-center gap-3 text-white hover:opacity-90 transition-opacity">
              <span className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                {/* Fax icon (outline, similar style to heroicons/outline/printer) */}
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {/* Top paper feeder */}
                  <path
                    d="M6 3h12v5H6z"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Main fax body */}
                  <rect
                    x="4"
                    y="8"
                    width="16"
                    height="10"
                    rx="2"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Output paper */}
                  <path
                    d="M8 14h8M8 17h5"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Buttons */}
                  <circle cx="7" cy="11" r="1" strokeWidth={2} />
                  <circle cx="10" cy="11" r="1" strokeWidth={2} />
                </svg>
              </span>
              <span className="text-sm font-medium">{CONTACT_FAX}</span>
            </p>

            <p className="flex items-center gap-3 text-white hover:opacity-90 transition-opacity">
            <span className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {/* Pin shape */}
              <path
                d="M12 21s7-5.686 7-11a7 7 0 10-14 0c0 5.314 7 11 7 11z"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Center circle */}
              <circle
                cx="12"
                cy="10"
                r="3"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            </span>
            <span className="text-sm font-medium">{CONTACT_ADDRESS}</span>
            </p>

          </div>
        </div>

        {/* Right: Contact Form */}
        <div className="flex-1 px-6 py-4 md:px-8 lg:px-10">
          <form
            key={formKey}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="first_name"
                  className="block text-sm font-medium text-rcn-text mb-1"
                >
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="Ex. John"
                  className={inputClass}
                  {...register("first_name")}
                />
                {errors.first_name && (
                  <p className="mt-1 text-xs text-rcn-danger">
                    {errors.first_name.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="last_name"
                  className="block text-sm font-medium text-rcn-text mb-1"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="Ex. Doe"
                  className={inputClass}
                  {...register("last_name")}
                />
                {errors.last_name && (
                  <p className="mt-1 text-xs text-rcn-danger">
                    {errors.last_name.message}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-rcn-text mb-1"
              >
                Email Address
              </label>
              <input
                type="email"
                placeholder="Ex. Hello@bend.com"
                className={inputClass}
                {...register("email")}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-rcn-danger">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="phone_number"
                className="block text-sm font-medium text-rcn-text mb-1"
              >
                Phone Number
              </label>
              <PhoneInputField
                value={phoneValue}
                onChange={handlePhoneChange}
              />

              {errors.phone_number && (
                <p className="mt-1 text-xs text-rcn-danger">
                  {errors.phone_number.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="query"
                className="block text-sm font-medium text-rcn-text mb-1"
              >
                Message
              </label>
              <textarea
                rows={4}
                placeholder="Write a message..."
                className={`${inputClass} resize-y min-h-[100px]`}
                {...register("query")}
              />
              {errors.query && (
                <p className="mt-1 text-xs text-rcn-danger">
                  {errors.query.message}
                </p>
              )}
            </div>
            <div className="pt-2 w-full">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting}
                className="flex  items-center justify-center gap-2 w-full text-center bg-rcn-gradient"
              >
                <span className="font-[450]">Submit</span>

                <span className="bg-white rounded-[5px] p-1 ml-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M7 18C6.7 18 6.5 17.9 6.3 17.7C5.9 17.3 5.9 16.7 6.3 16.3L16.3 6.3C16.7 5.9 17.3 5.9 17.7 6.3C18.1 6.7 18.1 7.3 17.7 7.7L7.7 17.7C7.5 17.9 7.3 18 7 18Z"
                      fill="#1A9254"
                    />
                    <path
                      d="M17 17C16.4 17 16 16.6 16 16V8H8C7.4 8 7 7.6 7 7C7 6.4 7.4 6 8 6H17C17.6 6 18 6.4 18 7V16C18 16.6 17.6 17 17 17Z"
                      fill="#1A9254"
                    />
                  </svg>
                </span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </motion.section>
  );
}

import * as Yup from 'yup';

// Mirrors the backend Zod rules so users see problems before the request is sent.
export const E164_REGEX = /^\+[1-9]\d{7,14}$/;

export const phoneNumberRule = Yup.string()
    .trim()
    .matches(E164_REGEX, "Use international format, e.g. +995555123456")
    .required("Required");

export const emailRule = Yup.string().trim().email("Invalid email").max(255, "Too long").required("Required");

export const requiredText = (max: number) => Yup.string().trim().max(max, `At most ${max} characters`).required("Required");

export const errorMessage = (error: unknown, fallback = "Something went wrong. Please try again.") =>
    error instanceof Error && error.message ? error.message : fallback;

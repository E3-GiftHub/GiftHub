"use client";

import {
  generateUploadButton,
  generateUploadDropzone,
  generateReactHelpers
} from "@uploadthing/react";

import type { ourFileRouter } from "~/app/api/uploadthing/core";

export const UploadButton   = generateUploadButton<typeof ourFileRouter>();
export const UploadDropzone = generateUploadDropzone<typeof ourFileRouter>();

import type {OurFileRouter} from "~/server/uploadthing";

export const {useUploadThing} = generateReactHelpers<OurFileRouter>();
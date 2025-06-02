"use client";

import {generateReactHelpers} from "@uploadthing/react";
import type {OurFileRouter} from "~/server/api/uploadthing";

export const {useUploadThing} = generateReactHelpers<OurFileRouter>();
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { ensureUser } from "@/lib/auth";

const f = createUploadthing();

export const uploadRouter = {
  avatar: f({
    image: { maxFileSize: "2MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const user = await ensureUser();
      return { userId: user.id };
    })
    .onUploadComplete(({ metadata, file }) => {
      return { url: file.ufsUrl, userId: metadata.userId };
    }),

  companyLogo: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const user = await ensureUser();
      return { userId: user.id };
    })
    .onUploadComplete(({ file }) => {
      return { url: file.ufsUrl };
    }),

  profileAsset: f({
    image: { maxFileSize: "4MB", maxFileCount: 4 },
  })
    .middleware(async () => {
      const user = await ensureUser();
      return { userId: user.id };
    })
    .onUploadComplete(({ file }) => {
      return { url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type AppFileRouter = typeof uploadRouter;

import {createTRPCRouter, protectedProcedure} from "~/server/api/trpc";
import {UTApi} from "uploadthing/server";
import {z} from "zod";

const utapi = new UTApi();

export const profilePictureRouter = createTRPCRouter({
  upload: protectedProcedure
    .input(z.object({
      key: z.string(),
    }))
    .mutation(async ({input, ctx}) => {
      if(!input.key.includes(ctx.session.user.id!)){
        throw new Error("Unauthorized file access");
      }

      const fileUrl = `${process.env.AUTH_URL}/api/uploadthing/${input.key}`;
      const updatedUser = await ctx.db.user.update({
        where: {
          username: ctx.session.user.id!,
        },
        data: {
          pictureUrl: fileUrl,
        }
      });

      return {
        success: true,
        url: fileUrl,
      };
    }),
  delete: protectedProcedure
    .mutation(async ({ctx}) =>{
      const user = await ctx.db.user.findUnique({
        where: {
          username: ctx.session.user.id,
        },
        select: {
          pictureUrl: true,
        },
      });

      if(!user?.pictureUrl){
        throw new Error("No profile picture to delete");
      }

      const key = user.pictureUrl.split("/")[1];

      try{
        //await utapi.deleteFiles(key);

        await ctx.db.user.update({
          where: {
            username: ctx.session.user.id,
          },
          data: {
            pictureUrl: null,
          }
        });

        return{
          success: true,
        }
      }catch(e){
        throw new Error("Failed to delete profile picture");
      }
    })
})
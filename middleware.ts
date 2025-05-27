// import { auth } from "~/app/api/auth/[...nextauth]/route";
// import {NextResponse} from "next/server";
//
// export default auth((req) => {
//   if(!req.auth){
//     const url = req.nextUrl.clone();
//     url.pathname = "/login";
//     return NextResponse.redirect(url);
//   }
// });
//
// export const config = {
//   matcher: [
//     '/inbox',
//     '/home'
//   ],
// }
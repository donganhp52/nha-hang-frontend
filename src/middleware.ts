import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { ur } from "zod/v4/locales";
import { decodeToken } from "./lib/utils";
import { Role } from "./constants/type";

const managePaths = ["/manage"];
const guestPaths = ["/guest"];
const privatePaths = [...managePaths, ...guestPaths];
const unAuthPaths = ["/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // pathname: /manage/dashboard
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  //Việc chỉ kiểm tra refreshToken đảm bảo rằng miễn là người dùng còn một phiên đăng nhập hợp lệ (còn refreshToken), họ sẽ luôn bị chặn truy cập vào các trang như /login hoặc /register, bất kể accessToken của họ còn hạn hay đã hết hạn.

  //1. chưa đăng nhập (không tồn tại refresh Token) thì ko cho vào private path và điều hướng về trang login
  if (privatePaths.some((path) => pathname.startsWith(path) && !refreshToken)) {
    // Gửi tín hiệu cho trang Login biết rằng nó cần phải dọn dẹp local storage.
    const url = new URL("/login", request.url);
    url.searchParams.set("clearTokens", "true");
    return NextResponse.redirect(url);
  }
  // 2. trường hợp đã đăng nhập
  if (refreshToken) {
    // 2.1 Nếu cố tình vào trang login sẽ redirect về trang chủ
    if (unAuthPaths.some((path) => pathname.startsWith(path)) && refreshToken) {
      console.log("4444444444");

      return NextResponse.redirect(new URL("/", request.url));
    }
    // 2.2 Nhưng access token lại hết hạn
    // Đăng nhập rồi, nhưng access token lại hết hạn thì cho redirect về trang /logout để xóa refresh_token ở server và dọn dẹp local storage, sau đó mới đẩy người dùng về trang /login. Trong URL có đính kèm param là RefreshToken để tránh trường hợp bị hack click logout link (chỉ logout khi đúng là link trên máy người dùng)
    if (
      privatePaths.some((path) => pathname.startsWith(path)) &&
      !accessToken &&
      refreshToken
    ) {
      // Redirect về trang refresh token để tự động lấy access token mới
      const url = new URL("/refresh-token", request.url);
      url.searchParams.set("refreshToken", refreshToken);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    // 2.3 vào ko đúng role thì sẽ bị redirect về trang chủ
    const role = decodeToken(refreshToken).role;
    // Guest nhưng cố vào route của owner
    const isGuestGotoManagePath =
      role === Role.Guest &&
      managePaths.some((path) => pathname.startsWith(path));
    // manager nhưng cố gắng vào route của guest
    const isOwnerGotoGuestPath =
      role !== Role.Guest &&
      guestPaths.some((path) => pathname.startsWith(path));
    if (isGuestGotoManagePath || isOwnerGotoGuestPath) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/manage/:path*", "/guest/:path*", "/login"],
};

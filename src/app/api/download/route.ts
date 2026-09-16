import { NextResponse } from "next/server";

const GITHUB_REPO = "princeshiamofficial/Recordly";
const LATEST_VERSION = "v1.3.5-beta.2";

export const HEAD = GET;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const platform = (searchParams.get("platform") || "windows").toLowerCase();

  if (platform === "windows" || platform === "win") {
    return NextResponse.redirect(
      `https://github.com/${GITHUB_REPO}/releases/download/${LATEST_VERSION}/CamVerse-windows-x64.exe`,
      { status: 302 }
    );
  }

  if (platform === "mac" || platform === "darwin") {
    return NextResponse.redirect(
      `https://github.com/${GITHUB_REPO}/releases/download/${LATEST_VERSION}/CamVerse-mac-universal.dmg`,
      { status: 302 }
    );
  }

  if (platform === "linux") {
    return NextResponse.redirect(
      `https://github.com/${GITHUB_REPO}/releases/download/${LATEST_VERSION}/CamVerse-linux-x86_64.AppImage`,
      { status: 302 }
    );
  }

  return NextResponse.redirect(`https://github.com/${GITHUB_REPO}/releases`, {
    status: 302,
  });
}

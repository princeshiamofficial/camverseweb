import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const GITHUB_REPO = "princeshiamofficial/Recordly";
const LATEST_VERSION = "v1.3.5-beta.2";

export const HEAD = GET;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const platform = (searchParams.get("platform") || "windows").toLowerCase();

  // If Windows, check if local build exists in the release directory for instant direct streaming
  if (platform === "windows" || platform === "win") {
    const localCandidates = [
      path.resolve(process.cwd(), "../release/CamVerse-windows-x64.exe"),
      "C:\\Transfer\\Project 2026\\Recordly\\release\\CamVerse-windows-x64.exe",
      path.resolve(process.cwd(), "public/downloads/CamVerse-windows-x64.exe"),
    ];

    for (const localPath of localCandidates) {
      if (fs.existsSync(localPath)) {
        try {
          const stats = fs.statSync(localPath);
          const nodeStream = fs.createReadStream(localPath);

          // Convert Node readable stream to Web standard ReadableStream
          const webStream = new ReadableStream({
            start(controller) {
              nodeStream.on("data", (chunk) => controller.enqueue(chunk));
              nodeStream.on("end", () => controller.close());
              nodeStream.on("error", (err) => controller.error(err));
            },
            cancel() {
              nodeStream.destroy();
            },
          });

          return new Response(webStream, {
            headers: {
              "Content-Type": "application/vnd.microsoft.portable-executable",
              "Content-Disposition": 'attachment; filename="CamVerse-windows-x64.exe"',
              "Content-Length": stats.size.toString(),
              "Cache-Control": "public, max-age=3600",
            },
          });
        } catch {
          break;
        }
      }
    }

    // Redirect to GitHub release installer if local file cannot be read
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

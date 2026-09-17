import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getLiveDownloadUrl } from "@/lib/download-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const platform = (searchParams.get("platform") || "windows").toLowerCase();

  // 1. Check if a direct file exists locally in public/downloads
  const filenameMap: Record<string, string> = {
    windows: "CamVerse-Setup.exe",
    win: "CamVerse-Setup.exe",
    mac: "CamVerse-Setup.dmg",
    darwin: "CamVerse-Setup.dmg",
    linux: "CamVerse-Setup.AppImage",
  };

  const directFilename = filenameMap[platform] || "CamVerse-Setup.exe";
  const localFilePath = path.join(process.cwd(), "public", "downloads", directFilename);

  if (fs.existsSync(localFilePath)) {
    try {
      const fileBuffer = fs.readFileSync(localFilePath);
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Disposition": `attachment; filename="${directFilename}"`,
          "Cache-Control": "public, max-age=3600",
        },
      });
    } catch (err) {
      console.error("[download-route] Error reading local file:", err);
    }
  }

  // 2. Fetch configured live direct download link
  const directUrl = await getLiveDownloadUrl(platform);

  if (directUrl && directUrl.startsWith("http")) {
    return NextResponse.redirect(directUrl, {
      status: 302,
    });
  }

  // 3. Fallback direct download
  return NextResponse.redirect(
    "https://github.com/princeshiamofficial/Recordly/releases/latest/download/CamVerse-windows-x64.exe",
    { status: 302 }
  );
}

export const HEAD = GET;

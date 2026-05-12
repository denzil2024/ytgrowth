"""Render the OG image: brand mark only, no copy.

Most chat apps (WhatsApp, Slack, iMessage, Discord) crop the share image
to a square thumbnail. Title and description come from the meta tags
separately, so the image only carries the brand. See vidiq.com / linear.app /
vercel.com share previews for the same pattern.

Output: frontend/public/og-image-preview.png (1200x630)
"""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "frontend" / "public" / "og-image-preview.png"

HTML = """
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{width:1200px;height:630px}
  body{
    background:#0a0a0f;
    font-family:'DM Sans',system-ui,sans-serif;
    -webkit-font-smoothing:antialiased;
    overflow:hidden;
    position:relative;
  }

  /* Square safe-zone (where chat-app crops will land). Everything important
     lives inside this 630x630 centered region. */
  .safe{
    position:absolute;top:0;left:50%;transform:translateX(-50%);
    width:630px;height:630px;
    display:flex;align-items:center;justify-content:center;
  }

  .mark{
    display:flex;align-items:center;gap:22px;
  }

  /* Exact favicon.svg from frontend/public, scaled up. Not redrawn. */
  .logo{width:140px;height:140px;display:block;flex-shrink:0}

  .wordmark{
    font-family:'Inter',system-ui,sans-serif;
    font-weight:800;
    font-size:120px;
    letter-spacing:-5px;
    color:#ffffff;
    line-height:1;
  }
</style>
</head>
<body>
  <div class="safe">
    <div class="mark">
      <svg class="logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" fill="none">
        <rect width="26" height="26" rx="7" fill="#e5251b"/>
        <path d="M18.5 10.2a1.6 1.6 0 0 0-1.12-1.12C16.4 8.8 13 8.8 13 8.8s-3.4 0-4.38.3A1.6 1.6 0 0 0 7.5 10.2 17 17 0 0 0 7.2 13a17 17 0 0 0 .3 2.8 1.6 1.6 0 0 0 1.12 1.12C9.6 17.2 13 17.2 13 17.2s3.4 0 4.38-.3a1.6 1.6 0 0 0 1.12-1.12A17 17 0 0 0 18.8 13a17 17 0 0 0-.3-2.8z" fill="white"/>
        <polygon points="11.2,16 16,13 11.2,10" fill="#e5251b"/>
      </svg>
      <div class="wordmark">YTGrowth</div>
    </div>
  </div>
</body>
</html>
"""


def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context(
            viewport={"width": 1200, "height": 630},
            device_scale_factor=2,
        )
        page = context.new_page()
        page.set_content(HTML, wait_until="networkidle")
        page.wait_for_timeout(800)
        page.screenshot(
            path=str(OUT),
            omit_background=False,
            clip={"x": 0, "y": 0, "width": 1200, "height": 630},
        )
        browser.close()
    print(f"Wrote {OUT}  ({OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()

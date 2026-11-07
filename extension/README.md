# Breadcrumb desktop extension

Click the extension on a regular webpage to open Breadcrumb with its title and exact URL filled in. Add a thought and press Save. If signed out, sign in with Google first; your draft remains in that tab.

## Install in desktop Google Chrome

1. Download the repository or supplied extension ZIP and extract it.
2. Open `chrome://extensions`, enable Developer mode, and choose **Load unpacked**.
3. Select the `extension` folder containing `manifest.json`.
4. Pin Breadcrumb using Chrome’s Extensions menu.
5. Open a regular HTTP/HTTPS webpage and click Breadcrumb.

The destination is https://breadcrumb-alpha.vercel.app. A `!` badge means the current page is unsupported; hover for the explanation. Browser settings pages, local files and URLs longer than 3,000 characters are unsupported.

## Access and limits

Only `activeTab` is requested. The extension reads the clicked page’s title and URL; it does not scrape content, capture screenshots, watch other tabs or hold service keys. Capture data travels in the client-only URL fragment, which the app removes after import. The user reviews and saves through the normal website account.

An existing draft is preserved and the user chooses whether to append the page. This is a load-unpacked hackathon build, not a Chrome Web Store listing. The user reports that installation and page-title/link capture work in their manual test. Agent-controlled installed-browser verification remains blocked; automated worker/import tests are separate evidence.

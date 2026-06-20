# Modify API Response v2

A Chrome extension that lets you mock and override API responses directly in the browser. Define rules by URL pattern, HTTP method, and status code, then return custom JSON payloads without touching the backend.

Useful for frontend development, testing error states, prototyping UI flows, and debugging API integrations.

---

## Features

- **Mock API responses** — Intercept `XMLHttpRequest` calls and return custom JSON with a chosen HTTP status code
- **Rule management** — Create, update, enable/disable, and delete override rules from the popup UI
- **URL matching** — Match requests by partial URL substring and HTTP method (`GET`, `POST`, `PUT`, `DELETE`)
- **JSON editor** — Edit response bodies with a built-in JSON editor (code, tree, and form modes)
- **Import / Export** — Save and restore your override configuration as a JSON file
- **Live sync** — Changes apply immediately across open tabs without reloading the extension
- **Visual feedback** — On-page toast notifications when a response is overridden

---

## How It Works

```
┌─────────────────┐     chrome.storage      ┌──────────────┐
│  Popup UI       │ ──────────────────────► │  content.js  │
│  (React)        │                         │  (isolated)  │
└─────────────────┘                         └──────┬───────┘
                                                   │ CustomEvent
                                                   ▼
                                            ┌──────────────┐
                                            │   page.js    │
                                            │  (MAIN world)│
                                            │  XHR override│
                                            └──────────────┘
```

1. **Popup UI** — You configure override rules in the extension popup. Rules are persisted in `chrome.storage.local`.
2. **Content script** (`content.js`) — Reads stored rules and dispatches a custom DOM event whenever rules change.
3. **Page script** (`page.js`) — Runs in the page's main world and replaces `window.XMLHttpRequest`. When a request matches an enabled rule, it returns the configured JSON and status instead of calling the real API.
4. **Background service worker** (`background.js`) — Monitors response headers (e.g. CORS) across all URLs.

> **Note:** Only `XMLHttpRequest` is intercepted. Requests made with the Fetch API are not currently overridden.

---

## Installation

### From source (developer mode)

1. Clone or download this repository.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Build the popup UI:

   ```bash
   npm run build
   ```

4. Open Chrome and go to `chrome://extensions/`.
5. Enable **Developer mode** (top-right toggle).
6. Click **Load unpacked** and select the project root folder (the folder containing `manifest.json`).

The extension icon should appear in your toolbar. Click it to open the popup.

---

## Usage

### Create an override rule

1. Click the extension icon to open the popup.
2. Enter a **URL** fragment to match (e.g. `/api/users` — any request URL containing this string will match).
3. Select the **HTTP method** and desired **status code**.
4. Edit the **JSON response body** in the editor on the right.
5. Click **Add**.

The new rule appears in the table above and is enabled by default.

### Enable or disable a rule

Use the checkbox in the first column of the rules table. Only **enabled** rules are applied.

### Edit a rule

Click a row in the table to load its values into the form and JSON editor, make your changes, then click **Update**.

### Delete a rule

Click the trash icon on the row you want to remove.

### Import / Export

- **Export** — Downloads all current rules as a timestamped JSON file (e.g. `overrides_2026-06-20T12-00-00-000Z.json`).
- **Import** — Loads rules from a previously exported JSON file and replaces the current configuration.

---

## Override Rule Schema

Each rule is stored as an object with the following fields:

| Field     | Type      | Description                                      |
|-----------|-----------|--------------------------------------------------|
| `id`      | `string`  | Unique identifier (UUID)                         |
| `url`     | `string`  | URL substring to match against the request URL   |
| `method`  | `string`  | HTTP method: `GET`, `POST`, `PUT`, or `DELETE`   |
| `status`  | `string`  | HTTP status code: `200`, `400`, `401`, or `500`  |
| `json`    | `object`  | Response body returned to the application        |
| `enabled` | `boolean` | Whether the rule is active                       |

Example:

```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "url": "/api/users",
    "method": "GET",
    "status": "200",
    "json": {
      "data": [
        { "id": 1, "name": "Alice" },
        { "id": 2, "name": "Bob" }
      ]
    },
    "enabled": true
  }
]
```

---

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- npm

### Scripts

| Command           | Description                          |
|-------------------|--------------------------------------|
| `npm run dev`     | Start Vite dev server for the popup  |
| `npm run build`   | Build popup UI to `dist/`            |
| `npm run preview` | Preview the production build         |
| `npm run lint`    | Run ESLint                           |

After changing popup UI code, run `npm run build` and reload the extension in `chrome://extensions/` to see your changes.

### Project structure

```
override-api/
├── manifest.json          # Chrome extension manifest (MV3)
├── background.js          # Service worker
├── content.js             # Content script (storage → page bridge)
├── page.js                # Main-world XHR interceptor
├── ultils.js              # Shared utilities
├── src/
│   ├── App.jsx            # Root React component
│   ├── pages/
│   │   └── override/
│   │       ├── list-override/   # Rules table & management
│   │       └── create/          # Rule form, import/export
│   └── components/ui/     # Chakra UI component wrappers
├── dist/                  # Built popup (generated by Vite)
└── vite.config.js
```

### Tech stack

- **Extension:** Chrome Manifest V3
- **Popup UI:** React 18, Vite 6, Chakra UI v3
- **Forms:** React Hook Form
- **JSON editing:** [jsoneditor](https://github.com/josdejong/jsoneditor)
- **Styling:** SCSS modules

---

## Permissions

| Permission        | Reason                                              |
|-------------------|-----------------------------------------------------|
| `storage`         | Persist override rules locally                      |
| `<all_urls>` host | Inject scripts and intercept requests on any site   |

The extension does not collect or transmit data to external servers. All rules are stored locally in your browser.

---

## Limitations

- Only **XMLHttpRequest** requests are intercepted; **Fetch API** calls are not supported.
- URL matching is a simple **substring** check — there is no regex or wildcard support.
- Supported status codes in the UI are limited to `200`, `400`, `401`, and `500`.
- A short artificial delay (~200 ms) is applied before returning mocked responses.

---

## License

This project is provided as-is for development and testing purposes.

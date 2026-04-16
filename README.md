# ultramarathonsbenelux

This project displays a calendar of ultramarathons in the Benelux region. The data is retrieved using an automatic scraper that fetches races from the DUV statistics site.

## Setup

Install the required dependencies for the scraper:
```bash
pip install -r requirements.txt
```

## Running the Scraper

To fetch the latest race data, run:
```bash
python scraper.py
```
This will automatically parse the latest data and store it in `races.json`.

## Viewing the Site

Since the application uses `fetch()` to load the data from `races.json`, it must be served through a web server (otherwise CORS/file protocol restrictions may prevent the data from loading).

Start a simple local web server:
```bash
python3 -m http.server 8000
```

Then visit [http://localhost:8000](http://localhost:8000) in your web browser.
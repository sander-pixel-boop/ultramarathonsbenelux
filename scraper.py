import requests
from bs4 import BeautifulSoup
import json

def scrape_duv():
    countries = {'BEL': 'Belgium', 'NED': 'Netherlands', 'LUX': 'Luxembourg'}
    all_races = []

    for c_code, c_name in countries.items():
        # Scrape for current year and future
        for year in ['2024', '2025', '2026']:
            url = f"https://statistik.d-u-v.org/calendar.php?year={year}&country={c_code}"
            headers = {"User-Agent": "Mozilla/5.0"}
            response = requests.get(url, headers=headers)
            soup = BeautifulSoup(response.content, 'html.parser')

            rows = soup.find_all('tr')
            for row in rows:
                cols = row.find_all('td')
                # A valid event row typically has ~7 columns and first column is a date
                if len(cols) >= 4 and cols[0].text.strip().count('.') == 2:
                    date = cols[0].text.strip()
                    name = cols[1].text.strip()
                    distance = cols[2].text.strip()
                    link_tag = cols[1].find('a')
                    link = "https://statistik.d-u-v.org/" + link_tag['href'] if link_tag else ""

                    all_races.append({
                        "name": name,
                        "country": c_name,
                        "distance": distance,
                        "date": date,
                        "url": link
                    })

    with open('races.json', 'w') as f:
        json.dump(all_races, f, indent=4)

    print(f"Successfully scraped {len(all_races)} races and saved to races.json")

if __name__ == '__main__':
    scrape_duv()

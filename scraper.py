import requests
from bs4 import BeautifulSoup
import json
import re

def scrape_ultraned():
    url = "https://ultraned.org/?post_type=tribe_events"
    headers = {"User-Agent": "Mozilla/5.0"}
    races = []
    try:
        response = requests.get(url, headers=headers)
        soup = BeautifulSoup(response.content, 'html.parser')
        events = soup.find_all(class_='type-tribe_events')
        for event in events:
            link = event.find('a', class_='tribe-events-calendar-list__event-title-link')
            if link:
                title = link.text.strip()
                event_url = link.get('href')
                time_tag = event.find('time')
                date_str = time_tag.get('datetime', time_tag.text.strip()) if time_tag else ''
            else:
                title_a = event.find('h3', class_='tribe-events-list-event-title')
                if not title_a or not title_a.find('a'): continue
                link = title_a.find('a')
                title = link.text.strip()
                event_url = link.get('href')
                time_tag = event.find(class_='tribe-event-schedule-details')
                date_str = time_tag.text.strip() if time_tag else ''

            original_url = event_url
            try:
                event_page = requests.get(event_url, headers=headers)
                event_soup = BeautifulSoup(event_page.content, 'html.parser')
                url_elem = event_soup.find(class_='tribe-events-event-url')
                if url_elem and url_elem.find('a'):
                    original_url = url_elem.find('a')['href']
                else:
                    for a in event_soup.find_all('a'):
                        href = a.get('href', '')
                        if href and 'http' in href and 'ultraned.org' not in href and 'facebook' not in href and 'google' not in href:
                            original_url = href
                            break
            except:
                pass

            races.append({
                "name": title,
                "country": "Netherlands",
                "distance": "Ultra",
                "date": date_str,
                "url": original_url,
                "city": ""
            })
    except Exception as e:
        print(f"Error scraping Ultraned: {e}")
    return races

def scrape_hardloopkalender():
    url = "https://hardloopkalender.nl/loopagenda-hardlopen/ultraloop/1"
    headers = {"User-Agent": "Mozilla/5.0"}
    races = []
    try:
        response = requests.get(url, headers=headers)
        soup = BeautifulSoup(response.content, 'html.parser')
        rows = soup.find_all('tr')
        for row in rows:
            cells = row.find_all('td')
            if not cells: continue

            date_str = cells[0].text.strip()
            if not date_str: continue

            links = cells[1].find_all('a', href=True)
            event_link = None
            title = ""
            for a in links:
                if '/loopevenement/' in a['href'] or '/hardloopevenement/' in a['href']:
                    event_link = a['href']
                    title = a.get('title', a.text.strip())
                    break

            if not event_link: continue

            full_url = "https://hardloopkalender.nl" + event_link if event_link.startswith('/') else event_link
            original_url = full_url

            try:
                event_page = requests.get(full_url, headers=headers)
                event_soup = BeautifulSoup(event_page.content, 'html.parser')
                website = event_soup.find(lambda tag: tag.name == "a" and tag.text and "website" in tag.text.lower())
                if website and 'href' in website.attrs:
                    original_url = website['href']
            except:
                pass

            races.append({
                "name": title,
                "country": "Netherlands",
                "distance": "Ultra",
                "date": date_str,
                "url": original_url,
                "city": ""
            })
    except Exception as e:
        print(f"Error scraping Hardloopkalender: {e}")
    return races

def scrape_finishers():
    url = "https://www.finishers.com/nl/activiteiten/stratenloop/ultralopen"
    headers = {"User-Agent": "Mozilla/5.0"}
    races = []
    try:
        response = requests.get(url, headers=headers)
        soup = BeautifulSoup(response.content, 'html.parser')
        events = soup.find_all('a', href=True)
        visited = set()
        for a in events:
            href = a['href']
            if '/nl/evenement/' in href and href not in visited:
                visited.add(href)
                full_url = "https://www.finishers.com" + href
                original_url = full_url
                try:
                    event_page = requests.get(full_url, headers=headers)
                    event_soup = BeautifulSoup(event_page.content, 'html.parser')
                    title_elem = event_soup.find('h1')
                    title = title_elem.text.strip() if title_elem else href.split('/')[-1]

                    for link in event_soup.find_all('a', href=True):
                        l_href = link['href']
                        if 'http' in l_href and 'finishers.com' not in l_href and 'facebook' not in l_href and 'instagram' not in l_href and 'twitter' not in l_href:
                            original_url = l_href
                            break

                    races.append({
                        "name": title,
                        "country": "Netherlands",
                        "distance": "Ultra",
                        "date": "TBD",
                        "url": original_url,
                        "city": ""
                    })
                except:
                    pass
    except Exception as e:
        print(f"Error scraping Finishers: {e}")
    return races

def scrape_trail_running():
    url = "https://www.trail-running.eu/wp-json/trail-running/v1/get-events?lang=en"
    headers = {"User-Agent": "Mozilla/5.0"}
    races = []
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 403:
            return races
        data = response.json()
        items = data.get("items", [])
        for item in items:
            title = item.get("title", "")
            date_str = item.get("date_nice", item.get("date", ""))
            distances = item.get("distances_nice", "")
            event_url = item.get("permalink", "")

            original_url = event_url
            try:
                if event_url:
                    event_page = requests.get(event_url, headers=headers)
                    event_soup = BeautifulSoup(event_page.content, 'html.parser')
                    for link in event_soup.find_all('a', href=True):
                        l_href = link['href']
                        if 'http' in l_href and 'trail-running.eu' not in l_href and 'facebook' not in l_href and 'google' not in l_href:
                            original_url = l_href
                            break
            except:
                pass

            races.append({
                "name": title,
                "country": "Netherlands",
                "distance": distances,
                "date": date_str,
                "url": original_url,
                "city": ""
            })
    except Exception as e:
        print(f"Error scraping Trail-running.eu: {e}")
    return races

def scrape_ultraracecalendar():
    url = "https://ultraracecalendar.com/calendar/all/ultras/"
    headers = {"User-Agent": "Mozilla/5.0"}
    races = []
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 403:
            print("Ultraracecalendar returned 403 - blocked by Cloudflare")
            return races
        soup = BeautifulSoup(response.content, 'html.parser')
        events = soup.find_all('div', class_='event-card')
        for event in events:
            title_elem = event.find('h3')
            title = title_elem.text.strip() if title_elem else "Unknown Race"
            date_elem = event.find('div', class_='event-date')
            date_str = date_elem.text.strip() if date_elem else ""

            link_elem = event.find('a', href=True)
            event_url = link_elem['href'] if link_elem else ""
            original_url = event_url

            if event_url:
                try:
                    event_page = requests.get(event_url, headers=headers)
                    event_soup = BeautifulSoup(event_page.content, 'html.parser')
                    for link in event_soup.find_all('a', href=True):
                        l_href = link['href']
                        if 'http' in l_href and 'ultraracecalendar.com' not in l_href and 'facebook' not in l_href:
                            original_url = l_href
                            break
                except:
                    pass

            races.append({
                "name": title,
                "country": "Unknown",
                "distance": "Ultra",
                "date": date_str,
                "url": original_url,
                "city": ""
            })
    except Exception as e:
        print(f"Error scraping ultraracecalendar: {e}")
    return races

def scrape_ahotu():
    url = "https://www.ahotu.com/nl/kalender/trail-running/ultramarathon/belgie"
    headers = {"User-Agent": "Mozilla/5.0"}
    races = []
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 403:
            print("Ahotu returned 403 - blocked by Cloudflare")
            return races
        soup = BeautifulSoup(response.content, 'html.parser')
        events = soup.find_all('a', class_='event-link')
        for event in events:
            title = event.text.strip()
            event_url = event.get('href', '')
            original_url = event_url

            if event_url:
                if not event_url.startswith('http'):
                    event_url = 'https://www.ahotu.com' + event_url
                try:
                    event_page = requests.get(event_url, headers=headers)
                    event_soup = BeautifulSoup(event_page.content, 'html.parser')
                    for link in event_soup.find_all('a', href=True):
                        l_href = link['href']
                        if 'http' in l_href and 'ahotu.com' not in l_href and 'facebook' not in l_href:
                            original_url = l_href
                            break
                except:
                    pass

            races.append({
                "name": title,
                "country": "Belgium",
                "distance": "Ultra",
                "date": "TBD",
                "url": original_url,
                "city": ""
            })
    except Exception as e:
        print(f"Error scraping ahotu: {e}")
    return races


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
                    city_raw = cols[3].text.strip()
                    city = re.sub(r'\s*\([^)]*\)$', '', city_raw).strip()
                    link_tag = cols[1].find('a')
                    link = "https://statistik.d-u-v.org/" + link_tag['href'] if link_tag else ""

                    original_url = link
                    if link:
                        try:
                            event_response = requests.get(link, headers=headers)
                            event_soup = BeautifulSoup(event_response.content, 'html.parser')
                            webpage_td = event_soup.find('b', string=lambda t: t and 'Web page:' in t)
                            if webpage_td:
                                td_sibling = webpage_td.parent.find_next_sibling('td')
                                if td_sibling:
                                    a_tag = td_sibling.find('a')
                                    if a_tag and a_tag.get('href'):
                                        original_url = a_tag['href']
                        except Exception as e:
                            print(f"Error fetching original url for {link}: {e}")

                    all_races.append({
                        "name": name,
                        "country": c_name,
                        "distance": distance,
                        "date": date,
                        "url": original_url,
                        "city": city
                    })

    return all_races

if __name__ == '__main__':
    all_races = []

    print("Scraping DUV...")
    duv_races = scrape_duv()
    all_races.extend(duv_races)

    print("Scraping Ultraned...")
    ultraned_races = scrape_ultraned()
    all_races.extend(ultraned_races)

    print("Scraping Hardloopkalender...")
    hardloopkalender_races = scrape_hardloopkalender()
    all_races.extend(hardloopkalender_races)

    print("Scraping Finishers...")
    finishers_races = scrape_finishers()
    all_races.extend(finishers_races)

    print("Scraping Trail-running.eu...")
    trail_races = scrape_trail_running()
    all_races.extend(trail_races)

    print("Scraping Ultraracecalendar...")
    ultrarace_races = scrape_ultraracecalendar()
    all_races.extend(ultrarace_races)

    print("Scraping Ahotu...")
    ahotu_races = scrape_ahotu()
    all_races.extend(ahotu_races)

    with open('races.json', 'w') as f:
        json.dump(all_races, f, indent=4)

    print(f"Successfully scraped {len(all_races)} races and saved to races.json")

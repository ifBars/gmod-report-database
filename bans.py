import sqlite3
import requests
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor, as_completed

class Ban:
    def __init__(self, date, player_name, player_steam_id, admin_name, admin_steam_id, evidence, length, reason):
        self.date = date
        self.player_name = player_name
        self.player_steam_id = player_steam_id
        self.admin_name = admin_name
        self.admin_steam_id = admin_steam_id
        self.length = length
        self.evidence = evidence
        self.reason = reason

    def __repr__(self):
        return (f"Ban(Date: {self.date}, Player: {self.player_name}, PlayerSteamID: {self.player_steam_id}, "
                f"Admin: {self.admin_name}, AdminSteamID: {self.admin_steam_id}, "
                f"Length: {self.length}, Reason: {self.reason})")

class BanScraper:
    def __init__(self, base_url, admin_steam_id, max_pages=100):
        self.base_url = base_url
        self.admin_steam_id = admin_steam_id
        self.max_pages = max_pages

    def fetch_page(self, page_num):
        page_url = f"{self.base_url}/index.php?page={page_num}"
        print(f"Scraping page: {page_url}")
        response = requests.get(page_url)
        return response.content

    def parse_bans(self, content):
        ban_list = []
        soup = BeautifulSoup(content, 'html.parser')
        ban_entries = soup.find_all('tr')[1:]

        for ban_entry in ban_entries:
            columns = ban_entry.find_all('td')
            if len(columns) > 0:
                date = columns[0].text.strip()
                player_name = columns[1].text.split('(<')[0].strip()
                player_steam_id = columns[1].find('a').text.strip()
                admin_name = columns[2].text.split('(<')[0].strip()
                admin_steam_id = columns[2].find('a').text.strip()
                evidence = ""
                length = columns[3].text.strip()
                reason = columns[4].text.strip()

                if admin_steam_id == self.admin_steam_id:
                    ban = Ban(date, player_name, player_steam_id, admin_name, admin_steam_id, evidence, length, reason)
                    ban_list.append(ban)

        return ban_list

    def scrape_bans(self):
        ban_list = []
        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(self.fetch_page, page_num) for page_num in range(1, self.max_pages + 1)]

            for future in as_completed(futures):
                try:
                    content = future.result()
                    bans = self.parse_bans(content)
                    ban_list.extend(bans)
                except Exception as e:
                    print(f"An error occurred: {e}")

        return ban_list

class BanDatabase:
    def __init__(self, db_name='bans.db'):
        self.db_name = db_name
        self.create_table()

    def create_table(self):
        with sqlite3.connect(self.db_name) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS bans (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    date TEXT,
                    player_name TEXT,
                    player_steam_id TEXT,
                    admin_name TEXT,
                    admin_steam_id TEXT,
                    length TEXT,
                    evidence TEXT,
                    reason TEXT
                )
            ''')
            conn.commit()

    def insert_bans(self, bans):
        with sqlite3.connect(self.db_name) as conn:
            cursor = conn.cursor()
            cursor.executemany('''
                INSERT INTO bans (date, player_name, player_steam_id, admin_name, admin_steam_id, length, reason)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', [(ban.date, ban.player_name, ban.player_steam_id, ban.admin_name, ban.admin_steam_id, ban.length, ban.reason) for ban in bans])
            conn.commit()

    def insert_ban(self, ban):
        with sqlite3.connect(self.db_name) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO bans (date, player_name, player_steam_id, admin_name, admin_steam_id, length, reason)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (ban.date, ban.player_name, ban.player_steam_id, ban.admin_name, ban.admin_steam_id, ban.length, ban.reason))
            conn.commit()

    def get_all_bans(self):
        with sqlite3.connect(self.db_name) as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM bans')
            rows = cursor.fetchall()
            return [Ban(*row[1:]) for row in rows]  # Skips the id field

    def get_ban_by_id(self, ban_id):
        with sqlite3.connect(self.db_name) as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM bans WHERE id = ?', (ban_id,))
            row = cursor.fetchone()
            if row:
                return Ban(*row[1:])  # Skips the id field
            return None

    def delete_ban(self, ban_id):
        with sqlite3.connect(self.db_name) as conn:
            cursor = conn.cursor()
            cursor.execute('DELETE FROM bans WHERE id = ?', (ban_id,))
            conn.commit()

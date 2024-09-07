import sqlite3
import requests
from bs4 import BeautifulSoup

class Ban:
    def __init__(self, date, player_name, player_steam_id, admin_name, admin_steam_id, length, reason):
        self.date = date
        self.player_name = player_name
        self.player_steam_id = player_steam_id
        self.admin_name = admin_name
        self.admin_steam_id = admin_steam_id
        self.length = length
        self.reason = reason

    def __repr__(self):
        return (f"Ban(Date: {self.date}, Player: {self.player_name}, PlayerSteamID: {self.player_steam_id}, "
                f"Admin: {self.admin_name}, AdminSteamID: {self.admin_steam_id}, "
                f"Length: {self.length}, Reason: {self.reason})")

class BanScraper:
    def __init__(self, base_url, admin_steam_id, max_pages=50):
        self.base_url = base_url
        self.admin_steam_id = admin_steam_id
        self.max_pages = max_pages

    def scrape_bans(self):
        ban_list = []
        for page_num in range(1, self.max_pages + 1):
            page_url = f"{self.base_url}/index.php?page={page_num}"
            print(f"Scraping page: {page_url}")
            response = requests.get(page_url)
            soup = BeautifulSoup(response.content, 'html.parser')

            # Find all rows in the table containing bans
            ban_entries = soup.find_all('tr')[1:]  # Skip the header row

            for ban_entry in ban_entries:
                columns = ban_entry.find_all('td')
                if len(columns) > 0:
                    # Extract ban information
                    date = columns[0].text.strip()
                    player_name = columns[1].text.split('(<')[0].strip()
                    player_steam_id = columns[1].find('a').text.strip()
                    admin_name = columns[2].text.split('(<')[0].strip()
                    admin_steam_id = columns[2].find('a').text.strip()
                    length = columns[3].text.strip()
                    reason = columns[4].text.strip()

                    # Check if the admin_steam_id matches the target admin_steam_id
                    if admin_steam_id == self.admin_steam_id:
                        ban = Ban(date, player_name, player_steam_id, admin_name, admin_steam_id, length, reason)
                        ban_list.append(ban)

            # If there are no more rows, stop the loop
            if not ban_entries:
                break

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

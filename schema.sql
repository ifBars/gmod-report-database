CREATE TABLE IF NOT EXISTS report (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date_time TEXT NOT NULL,
    reporter TEXT NOT NULL,
    reportee TEXT NOT NULL,
    report_reason TEXT NOT NULL,
    evidence TEXT,
    punishment TEXT NOT NULL
);

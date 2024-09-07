import os

basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or '66dc54f8-db38-8000-bc1a-2eaaa3439bf2'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'reports.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

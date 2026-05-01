
import imaplib
import email
import os
from dotenv import load_dotenv

load_dotenv()

IMAP_HOST = os.getenv('IMAP_HOST', 'imap.gmail.com')
IMAP_PORT = int(os.getenv('IMAP_PORT', 993))
IMAP_EMAIL = os.getenv('IMAP_EMAIL')
IMAP_PASSWORD = os.getenv('IMAP_APP_PASSWORD')

def search_viator():
    mail = imaplib.IMAP4_SSL(IMAP_HOST, IMAP_PORT)
    mail.login(IMAP_EMAIL, IMAP_PASSWORD)
    mail.select('INBOX')
    
    # Search for Viator in the whole inbox
    status, data = mail.search(None, 'BODY', '"Viator"')
    ids = data[0].split()
    print(f"Found {len(ids)} emails containing 'Viator'")
    
    for eid in ids[-5:]: # Check last 5
        status, msg_data = mail.fetch(eid, '(RFC822)')
        msg = email.message_from_bytes(msg_data[0][1])
        print(f"Subject: {msg.get('Subject')}")
        print(f"From: {msg.get('From')}")
        print(f"Date: {msg.get('Date')}")
        print("-" * 20)

    mail.logout()

if __name__ == '__main__':
    search_viator()

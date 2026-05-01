
import imaplib
import email
import os
from dotenv import load_dotenv
from bs4 import BeautifulSoup

load_dotenv()

IMAP_HOST = os.getenv('IMAP_HOST', 'imap.gmail.com')
IMAP_PORT = int(os.getenv('IMAP_PORT', 993))
IMAP_EMAIL = os.getenv('IMAP_EMAIL')
IMAP_PASSWORD = os.getenv('IMAP_APP_PASSWORD')

def get_last_viator_fwd():
    mail = imaplib.IMAP4_SSL(IMAP_HOST, IMAP_PORT)
    mail.login(IMAP_EMAIL, IMAP_PASSWORD)
    mail.select('INBOX')
    
    status, data = mail.search(None, 'SUBJECT', '"BR-1391951661"')
    ids = data[0].split()
    
    if not ids:
        print("Not found")
        return

    status, msg_data = mail.fetch(ids[-1], '(RFC822)')
    msg = email.message_from_bytes(msg_data[0][1])
    
    for part in msg.walk():
        if part.get_content_type() == 'text/html':
            html = part.get_payload(decode=True).decode('utf-8', errors='ignore')
            soup = BeautifulSoup(html, 'html.parser')
            print(soup.get_text(separator='\n', strip=True))
            break
        elif part.get_content_type() == 'text/plain':
            print(part.get_payload(decode=True).decode('utf-8', errors='ignore'))

    mail.logout()

if __name__ == '__main__':
    get_last_viator_fwd()

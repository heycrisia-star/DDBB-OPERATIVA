import sys
import os
from bs4 import BeautifulSoup
import email
import imaplib
from dotenv import load_dotenv

def parse_text(html, plain):
    if html:
        soup = BeautifulSoup(html, 'html.parser')
        return soup.get_text(separator=' ', strip=True)
    return plain

load_dotenv(os.path.join(os.getcwd(), '.env'))
mail = imaplib.IMAP4_SSL("imap.gmail.com")
mail.login(os.getenv('IMAP_EMAIL'), os.getenv('IMAP_APP_PASSWORD'))
mail.select("inbox")

status, messages = mail.search(None, '(BODY "343696684" FROM "FareHarbor")')
if messages[0]:
    msg_id = messages[0].split()[-1]
    res, msg = mail.fetch(msg_id, "(RFC822)")
    for response in msg:
        if isinstance(response, tuple):
            msg_obj = email.message_from_bytes(response[1])
            html = ""
            if msg_obj.is_multipart():
                for part in msg_obj.walk():
                    if part.get_content_type() == "text/html":
                        html = part.get_payload(decode=True).decode(errors='ignore')
            text = parse_text(html, "")
            print("=== PARSED TEXT ===")
            print(text)
            
            import re
            pax_m = re.search(r'Para cuántas personas.*?(\d+)', text, re.IGNORECASE | re.DOTALL)
            print("PAX MATCH:", pax_m.group(1) if pax_m else None)
            
            client_m = re.search(r'Nombre:\s*\n*(.+)', text)
            print("CLIENT MATCH (Nombre):", client_m.group(1) if client_m else None)
            
            client2_m = re.search(r'Nombre de la persona que reserva:\s*(.+)', text)
            print("CLIENT MATCH 2:", client2_m.group(1) if client2_m else None)

mail.close()
mail.logout()

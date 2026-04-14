import email
import imaplib
import os
from bs4 import BeautifulSoup
from dotenv import load_dotenv

load_dotenv(os.path.join(os.getcwd(), '.env'))
mail = imaplib.IMAP4_SSL("imap.gmail.com")
mail.login(os.getenv('IMAP_EMAIL'), os.getenv('IMAP_APP_PASSWORD'))
mail.select("inbox")

status, messages = mail.search(None, '(BODY "Dogan" FROM "GetYourGuide")')
if messages[0]:
    msg_id = messages[0].split()[-1]
    res, msg = mail.fetch(msg_id, "(RFC822)")
    for response in msg:
        if isinstance(response, tuple):
            msg_obj = email.message_from_bytes(response[1])
            body = ""
            if msg_obj.is_multipart():
                for part in msg_obj.walk():
                    if part.get_content_type() == "text/html":
                        html = part.get_payload(decode=True).decode(errors='ignore')
                        body = BeautifulSoup(html, "html.parser").get_text(separator="\n", strip=True)
                        break
            
            print("=== EMAIL EXTRACTED TEXT ===")
            print('\n'.join(line for line in body.split('\n') if len(line) > 0))
mail.close()
mail.logout()

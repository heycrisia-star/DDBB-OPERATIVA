"""
execution/email_parser.py

Script determinista que lee los correos de GetYourGuide y FareHarbor
desde el buzón IMAP e inyecta/actualiza las reservas en mockTours.js.

Arquitectura de 3 capas:
  - Directiva: directives/email_parser.md
  - Orquestación: Agente IA
  - Ejecución: este script

Fuentes soportadas:
  - GYG:  do-not-reply@notification.getyourguide.com
  - FH:   messages@fareharbor.com

Estados detectados:
  - 'confirmado'  → nueva reserva o modificación confirmada
  - 'cancelado'   → cancelación por parte del cliente o plataforma
"""

import imaplib
import email
import json
import os
import re
import sys
from datetime import datetime
from bs4 import BeautifulSoup
from dotenv import load_dotenv

# ── 0. Config ──────────────────────────────────────────────────────────────
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

IMAP_HOST = os.getenv('IMAP_HOST', 'imap.gmail.com')
IMAP_PORT = int(os.getenv('IMAP_PORT', 993))
IMAP_EMAIL = os.getenv('IMAP_EMAIL')
IMAP_PASSWORD = os.getenv('IMAP_APP_PASSWORD')

MOCK_FILE = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'mockTours.js')

GYG_SENDER = 'do-not-reply@notification.getyourguide.com'
FH_SENDER  = 'messages@fareharbor.com'

MONTHS_ES = {
    'january': '01', 'february': '02', 'march': '03', 'april': '04',
    'may': '05', 'june': '06', 'july': '07', 'august': '08',
    'september': '09', 'october': '10', 'november': '11', 'december': '12',
    'enero': '01', 'febrero': '02', 'marzo': '03', 'abril': '04',
    'mayo': '05', 'junio': '06', 'julio': '07', 'agosto': '08',
    'septiembre': '09', 'octubre': '10', 'noviembre': '11', 'diciembre': '12'
}

# ── 1. IMAP helpers ─────────────────────────────────────────────────────────

def connect_imap():
    mail = imaplib.IMAP4_SSL(IMAP_HOST, IMAP_PORT)
    mail.login(IMAP_EMAIL, IMAP_PASSWORD)
    mail.select('INBOX')
    return mail


def fetch_emails(mail, sender):
    status, data = mail.search(None, 'FROM', sender)
    ids = data[0].split()
    results = []
    for eid in ids:
        status, msg_data = mail.fetch(eid, '(RFC822)')
        msg = email.message_from_bytes(msg_data[0][1])
        results.append(msg)
    return results


def get_text_and_html(msg):
    html, plain = '', ''
    for part in msg.walk():
        ct = part.get_content_type()
        if ct == 'text/html' and not html:
            html = part.get_payload(decode=True).decode('utf-8', errors='ignore')
        elif ct == 'text/plain' and not plain:
            plain = part.get_payload(decode=True).decode('utf-8', errors='ignore')
    return html, plain


def parse_text(html, plain):
    if html:
        soup = BeautifulSoup(html, 'html.parser')
        return soup.get_text(separator='\n', strip=True)
    return plain

# ── 2. Data extraction helpers ───────────────────────────────────────────────

def clean_price(price_str, apply_discount=True):
    """Convert '180,56 €' → 135.42 (after 25% deduction if requested)."""
    price_str = re.sub(r'[€$\s]', '', price_str).replace(',', '.')
    try:
        price = float(price_str)
        if apply_discount:
            return round(price * 0.75, 2)  # deduct 25% commission for GYG
        return round(price, 2)
    except:
        return 0.0


def parse_date_gyg(date_str):
    """
    Parse dates like 'March 25, 2026 6:00 PM' or 'March 25, 2026 18:00'
    Returns (date_iso, time_hhmm)
    """
    date_str = date_str.strip()
    # Try: "March 25, 2026 6:00 PM"
    m = re.search(r'(\w+)\s+(\d+),\s+(\d{4})\s+(\d+):(\d+)\s*(AM|PM)?', date_str, re.IGNORECASE)
    if m:
        month_name, day, year, hour, minute, ampm = m.groups()
        month = MONTHS_ES.get(month_name.lower(), '01')
        hour = int(hour)
        if ampm and ampm.upper() == 'PM' and hour != 12:
            hour += 12
        elif ampm and ampm.upper() == 'AM' and hour == 12:
            hour = 0
        return f"{year}-{month}-{day.zfill(2)}", f"{hour:02d}:{minute}"
    return '', ''


def parse_date_fh(date_str):
    """
    Parse FH dates: 'Viernes, 20 Marzo 2026 a las 9:30 am - 11:00 am'
    Returns (date_iso, time_hhmm)
    """
    m = re.search(r'(\d+)\s+(\w+)\s+(\d{4})\s+a\s+las\s+(\d+):(\d+)\s*(am|pm)?', date_str, re.IGNORECASE)
    if m:
        day, month_name, year, hour, minute, ampm = m.groups()
        month = MONTHS_ES.get(month_name.lower(), '01')
        hour = int(hour)
        if ampm and ampm.lower() == 'pm' and hour != 12:
            hour += 12
        return f"{year}-{month}-{day.zfill(2)}", f"{hour:02d}:{minute}"
    return '', ''


def get_duration_from_option(option_str):
    if not option_str:
        return 2
    m = re.search(r'(\d+)[:\s]?h', option_str, re.IGNORECASE)
    if m:
        return int(m.group(1))
    return 2


LANG_MAP = {
    'english': 'EN', 'inglés': 'EN', 'ingles': 'EN',
    'german': 'DE', 'alemán': 'DE', 'aleman': 'DE',
    'french': 'FR', 'francés': 'FR', 'frances': 'FR',
    'spanish': 'ES', 'español': 'ES', 'espanol': 'ES',
    'italian': 'IT', 'italiano': 'IT',
    'dutch': 'NL', 'holandés': 'NL',
    'portuguese': 'PT', 'portugués': 'PT',
}

# ── 3. GYG Parser ────────────────────────────────────────────────────────────

def parse_gyg_email(msg):
    """
    Extract booking data from a GYG notification email.
    Returns a dict or None if not parseable.
    """
    subject = msg.get('Subject', '')
    date_header = msg.get('Date')
    booking_date = ''
    if date_header:
        try:
            booking_date = email.utils.parsedate_to_datetime(date_header).strftime('%Y-%m-%d')
        except:
            booking_date = datetime.now().strftime('%Y-%m-%d')
    else:
        booking_date = datetime.now().strftime('%Y-%m-%d')

    html, plain = get_text_and_html(msg)
    text = parse_text(html, plain)

    # Determine status
    if any(w in subject.lower() for w in ['cancel', 'cancelad']):
        status = 'cancelado'
    elif any(w in subject.lower() for w in ['modif', 'update', 'cambi']):
        status = 'modificado'
    else:
        status = 'confirmado'

    # Booking reference
    ref_m = re.search(r'(GYG[A-Z0-9]{8,})', text)
    if not ref_m:
        ref_m = re.search(r'Número de referencia\s*\n+([A-Z0-9]+)', text)
    if not ref_m:
        return None
    code = ref_m.group(1)

    # Date & Time
    date_m = re.search(r'Fecha\s*\n+(.+)', text)
    date_iso, time_hm = '', ''
    if date_m:
        date_iso, time_hm = parse_date_gyg(date_m.group(1).strip())

    # Pax
    pax_m = re.search(r'Número de participantes\s*\n+([\d]+)', text)
    pax = int(pax_m.group(1)) if pax_m else 1

    # Client
    client_m = re.search(r'Cliente principal\s*\n+(.+)', text)
    client = client_m.group(1).strip() if client_m else ''

    # Phone
    phone_m = re.search(r'Teléfono:\s*([+\d\s\-()]+)', text)
    phone = phone_m.group(1).strip() if phone_m else ''

    # Language
    lang_m = re.search(r'Idioma:\s*(\w+)', text)
    lang_raw = lang_m.group(1).lower() if lang_m else 'en'
    language = LANG_MAP.get(lang_raw, 'EN')

    # Price (gross, then apply 25% discount)
    price_m = re.search(r'Precio\s*\n+([\d,.]+\s*€)', text)
    net_price = clean_price(price_m.group(1)) if price_m else 0.0

    # Product
    product_m = re.search(r'Se ha reservado tu producto\s*\n+(.+)', text)
    product = product_m.group(1).strip() if product_m else ''

    # Duration: search for "Tour de X:00 h" or similar in text
    dur_m = re.search(r'(?:Tour|Opc(?:i|í)ón).*?(\d+)[:\s]?(?:00)?\s*[hH]', text)
    duration = int(dur_m.group(1)) if dur_m else 2

    return {
        'code': code,
        'date': date_iso,
        'start': time_hm,
        'duration': duration,
        'operator': 'GYG',
        'status': status,
        'pax': pax,
        'vehicle': '01-DR',
        'driver': 'Cristian',
        'clientName': client,
        'phone': phone,
        'language': language,
        'country': '',  # populated later if needed
        'netPrice': net_price,
        'product': product,
        'bookingDate': booking_date
    }

# ── 4. FareHarbor Parser ─────────────────────────────────────────────────────

def parse_fh_email(msg):
    """
    Extract booking data from a FareHarbor email.
    Returns a dict or None if not parseable.
    """
    subject = msg.get('Subject', '')
    # Decode subject
    decoded_parts = email.header.decode_header(subject)
    subject = ''.join(
        p.decode(enc or 'utf-8') if isinstance(p, bytes) else p
        for p, enc in decoded_parts
    )

    date_header = msg.get('Date')
    booking_date = ''
    if date_header:
        try:
            booking_date = email.utils.parsedate_to_datetime(date_header).strftime('%Y-%m-%d')
        except:
            booking_date = datetime.now().strftime('%Y-%m-%d')
    else:
        booking_date = datetime.now().strftime('%Y-%m-%d')

    html, plain = get_text_and_html(msg)
    text = parse_text(html, plain)

    # Skip meetup/marketing emails
    if 'meetup' in text.lower() or 'meetup' in subject.lower():
        return None

    # Status
    if 'cancelad' in subject.lower() or 'cancelad' in text.lower()[:200]:
        status = 'cancelado'
    elif 'modific' in subject.lower():
        status = 'modificado'
    else:
        status = 'confirmado'

    # Booking reference
    ref_m = re.search(r'Reserva\s+n[.º°]+\s*([\d]+)', text)
    if not ref_m:
        return None
    code = f"FH{ref_m.group(1)}"

    # Date & time
    date_m = re.search(r'(\w+,\s+\d+\s+\w+\s+\d{4}\s+a\s+las\s+[\d:]+\s*(?:am|pm)?)', text, re.IGNORECASE)
    date_iso, time_hm = '', ''
    if date_m:
        date_iso, time_hm = parse_date_fh(date_m.group(1))

    # Pax (FH format: "4 ¿Para cuántas personas?")
    pax_m = re.search(r'Para cuántas personas.*?(\d+)', text, re.IGNORECASE | re.DOTALL)
    if not pax_m:
        pax_m = re.search(r'(\d+)\s+(?:Adult|adulto|Tour Privado)', text, re.IGNORECASE)
    pax = int(pax_m.group(1)) if pax_m else 1

    # Client
    client_m = re.search(r'Nombre:\s*\n*(.+)', text)
    client = client_m.group(1).strip() if client_m else ''

    # Phone
    phone_m = re.search(r'Teléfono:\s*\n*([+\d\s\-()]+)', text)
    phone = phone_m.group(1).strip() if phone_m else ''

    # Price (Total reserva)
    price_m = re.search(r'Total\s+reserva\s*\n+([\d,.]+\s*€)', text)
    net_price = clean_price(price_m.group(1), apply_discount=False) if price_m else 0.0

    # Product (tour name - line before the date)
    product_m = re.search(r'Reserva n[.º°]+\s*[\d]+\s*\n+(.+)', text)
    product = product_m.group(1).strip() if product_m else ''

    return {
        'code': code,
        'date': date_iso,
        'start': time_hm,
        'duration': get_duration_from_option(product),
        'operator': 'FH',
        'status': status,
        'pax': pax,
        'vehicle': '01-DR',
        'driver': 'Cristian',
        'clientName': client,
        'phone': phone,
        'language': 'EN',
        'country': '',
        'netPrice': net_price,
        'product': product,
        'bookingDate': booking_date
    }

# ── 5. Mock file I/O ────────────────────────────────────────────────────────

def load_mock():
    with open(MOCK_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
    json_str = content[content.index('['):content.rindex(']') + 1]
    return json.loads(json_str)


def save_mock(tours):
    with open(MOCK_FILE, 'w', encoding='utf-8') as f:
        f.write('export const MOCK_TOURS = ' + json.dumps(tours, indent=2, ensure_ascii=False) + ';\n')


def upsert_booking(tours, booking):
    """Insert new booking or update existing one (matched by code). Never overwrites driver/vehicle set manually."""
    if booking['code'] == 'GYGLMR44FKNR':
        booking['date'] = '2026-04-05'
        booking['start'] = '14:00'

    existing = next((t for t in tours if t.get('code') == booking['code']), None)
    if existing:
        # Update only status, date, pax, price if changed — preserve driver/vehicle
        for key in ['status', 'date', 'start', 'pax', 'netPrice', 'clientName', 'phone', 'language']:
            if booking.get(key):
                existing[key] = booking[key]
        print(f"  [UPDATE] {booking['code']} → status={booking['status']}")
    else:
        new_id = max((t.get('id', 0) for t in tours), default=0) + 1
        booking['id'] = new_id
        tours.append(booking)
        print(f"  [INSERT] {booking['code']} — {booking['clientName']} ({booking['date']})")

# ── 6. Stats summary ─────────────────────────────────────────────────────────

def print_stats(tours):
    total = len(tours)
    confirmed = sum(1 for t in tours if t.get('status') == 'confirmado')
    cancelled = sum(1 for t in tours if t.get('status') == 'cancelado')
    ratio = round(cancelled / total * 100, 1) if total > 0 else 0
    print(f"\n📊 Stats: {total} total | {confirmed} confirmed | {cancelled} cancelled ({ratio}% cancellation rate)")

# ── 7. Main ──────────────────────────────────────────────────────────────────

def main():
    print("🚀 LegacyTours Email Parser")
    print(f"   Connecting to {IMAP_HOST}...")

    mail = connect_imap()
    print("   ✅ IMAP connected\n")

    tours = load_mock()
    existing_codes = {t.get('code') for t in tours}

    new_count, updated_count, skipped_count = 0, 0, 0

    # ── GYG ──
    print("📬 Fetching GYG emails...")
    gyg_msgs = fetch_emails(mail, GYG_SENDER)
    print(f"   Found {len(gyg_msgs)} GYG emails")
    for msg in gyg_msgs:
        booking = parse_gyg_email(msg)
        if not booking:
            skipped_count += 1
            continue
        was_existing = booking['code'] in existing_codes
        upsert_booking(tours, booking)
        if was_existing:
            updated_count += 1
        else:
            new_count += 1
            existing_codes.add(booking['code'])

    # ── FareHarbor ──
    print("\n📬 Fetching FareHarbor emails...")
    fh_msgs = fetch_emails(mail, FH_SENDER)
    print(f"   Found {len(fh_msgs)} FH emails")
    for msg in fh_msgs:
        booking = parse_fh_email(msg)
        if not booking:
            skipped_count += 1
            continue
        was_existing = booking['code'] in existing_codes
        upsert_booking(tours, booking)
        if was_existing:
            updated_count += 1
        else:
            new_count += 1
            existing_codes.add(booking['code'])

    mail.logout()

    save_mock(tours)

    print(f"\n✅ Done: {new_count} new | {updated_count} updated | {skipped_count} skipped")
    print_stats(tours)
    print(f"\n💾 Saved to {MOCK_FILE}")


if __name__ == '__main__':
    main()

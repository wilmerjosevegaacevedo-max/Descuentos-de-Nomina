import os
import imaplib
import email
from email.header import decode_header
from dotenv import load_dotenv

def decodificar(texto):
    if not texto: return ""
    decoded_list = decode_header(texto)
    res = ""
    for byte_str, charset in decoded_list:
        if isinstance(byte_str, bytes):
            res += byte_str.decode(charset or 'utf-8', errors='ignore')
        else:
            res += str(byte_str)
    return res

print("Iniciando diagnostico de IMAP...")
load_dotenv(".env")
user = os.getenv("MAILBOX_USER")
password = os.getenv("MAILBOX_PASSWORD")

try:
    print(f"Conectando a {user}...")
    imap = imaplib.IMAP4_SSL("imap.gmail.com")
    imap.login(user, password)
    
    status, data = imap.select("INBOX")
    print(f"[*] CARPETA 'INBOX': Status={status}, Total Mensajes={data[0].decode()}")
    
    status_unseen, unseen_data = imap.search(None, 'UNSEEN')
    ids_unseen = unseen_data[0].decode().split()
    print(f"[*] MENSAJES NO LEIDOS ('UNSEEN'): {len(ids_unseen)} (IDs: {ids_unseen})")
    
    # Revisar el ultimo correo (este o no leido)
    status_all, all_data = imap.search(None, 'ALL')
    ids_all = all_data[0].split()
    if ids_all:
        last_id = ids_all[-1]
        res, msg_data = imap.fetch(last_id, '(RFC822)')
        raw = msg_data[0][1]
        msg = email.message_from_bytes(raw)
        
        asunto = decodificar(msg.get("Subject"))
        print(f"[*] ULTIMO CORREO RECIBIDO (ID {last_id.decode()}):")
        print(f"    - Asunto: {asunto}")
        
        adjuntos = []
        for part in msg.walk():
            if part.get_filename():
                adjuntos.append(decodificar(part.get_filename()))
        print(f"    - Adjuntos detectados: {adjuntos}")
        
    imap.logout()
except Exception as e:
    print(f"Error de diagnostico: {e}")

import smpplib.client
import smpplib.consts
import smpplib.gsm
import threading
import time
import logging
from database import get_db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("smpp_client")

class SMPPClient:
    def __init__(self, provider_id, host, port, system_id, password, **kwargs):
        self.provider_id = provider_id
        self.host = host
        self.port = port
        self.system_id = system_id
        self.password = password
        self.client = None
        self.connected = False
        self.worker_thread = None
        self.stop_event = threading.Event()

        # Optional settings
        self.system_type = kwargs.get('system_type', '')
        self.service_type = kwargs.get('service_type', 'itel')
        self.source_ton = kwargs.get('source_ton', 1)
        self.source_npi = kwargs.get('source_npi', 1)
        self.dest_ton = kwargs.get('dest_ton', 1)
        self.dest_npi = kwargs.get('dest_npi', 1)

    def connect(self):
        try:
            self.client = smpplib.client.Client(self.host, self.port)
            self.client.set_message_received_handler(self._on_message_received)
            self.client.set_message_sent_handler(self._on_message_sent)

            self.client.connect()
            self.client.bind_transceiver(system_id=self.system_id, password=self.password, system_type=self.system_type)
            self.connected = True
            logger.info(f"SMPP Connected to {self.host}:{self.port} for provider {self.provider_id}")

            # Update provider status in DB
            with get_db() as conn:
                conn.execute("UPDATE providers SET status = 'active', last_active_at = datetime('now') WHERE id = ?", (self.provider_id,))

            return True
        except Exception as e:
            logger.error(f"SMPP Connection failed for {self.provider_id}: {e}")
            self.connected = False
            return False

    def _on_message_received(self, pdu):
        logger.info(f"Received message: {pdu.short_message}")
        # Here we would process the SMS and save to DB
        # This will be integrated with sms_processor.py
        try:
            from sms_processor import process_incoming_sms
            # PDU contains source_addr, destination_addr, short_message
            process_incoming_sms(
                to_number=pdu.destination_addr.decode() if pdu.destination_addr else "",
                from_sender=pdu.source_addr.decode() if pdu.source_addr else "",
                message=pdu.short_message.decode(errors='ignore'),
                provider_id=self.provider_id
            )
        except Exception as e:
            logger.error(f"Error processing received SMPP message: {e}")

    def _on_message_sent(self, pdu):
        logger.info(f"Message sent: {pdu.sequence}")

    def listen(self):
        self.stop_event.clear()
        self.worker_thread = threading.Thread(target=self._listen_loop, daemon=True)
        self.worker_thread.start()

    def _listen_loop(self):
        while not self.stop_event.is_set():
            try:
                if not self.connected:
                    if not self.connect():
                        time.sleep(10) # Wait before retry
                        continue

                self.client.listen()
            except Exception as e:
                logger.error(f"SMPP Listen Error for {self.provider_id}: {e}")
                self.connected = False
                time.sleep(5)

    def disconnect(self):
        self.stop_event.set()
        if self.client:
            try:
                self.client.unbind()
                self.client.disconnect()
            except:
                pass
        self.connected = False

class SMPPManager:
    def __init__(self):
        self.clients = {} # provider_id -> SMPPClient

    def start_all(self):
        with get_db() as conn:
            providers = conn.execute("SELECT * FROM providers WHERE type = 'smpp' AND status = 'active'").fetchall()
            for p in providers:
                self.start_provider(p)

    def start_provider(self, p):
        if p['id'] in self.clients:
            self.clients[p['id']].disconnect()

        client = SMPPClient(
            provider_id=p['id'],
            host=p['smpp_host'],
            port=p['smpp_port'],
            system_id=p['smpp_system_id'],
            password=p['smpp_password'],
            system_type=p['smpp_system_type'],
            service_type=p['smpp_service_type'],
            source_ton=p['smpp_source_ton'],
            source_npi=p['smpp_source_npi'],
            dest_ton=p['smpp_dest_ton'],
            dest_npi=p['smpp_dest_npi']
        )
        self.clients[p['id']] = client
        client.listen()

    def stop_provider(self, provider_id):
        if provider_id in self.clients:
            self.clients[provider_id].disconnect()
            del self.clients[provider_id]

smpp_manager = SMPPManager()

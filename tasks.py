from celery_config import celery_app
from sms_processor import process_incoming_sms
import logging

logger = logging.getLogger("celery_tasks")

@celery_app.task(name="tasks.async_process_sms")
def async_process_sms(payload):
    try:
        result = process_incoming_sms(payload)
        return result
    except Exception as e:
        logger.error(f"Error in async_process_sms: {e}")
        return {"success": False, "error": str(e)}

@celery_app.task(name="tasks.cleanup_expired_allocations")
def cleanup_expired_allocations():
    from database import get_db
    from datetime import datetime
    now = datetime.utcnow().isoformat()
    with get_db() as conn:
        expired = conn.execute("SELECT * FROM allocations WHERE status = 'active' AND expires_at < ?", (now,)).fetchall()
        for alloc in expired:
            if alloc['number_ids']:
                nums = [n for n in alloc['number_ids'].split(",") if n]
                for num in nums:
                    conn.execute("UPDATE numbers SET assigned_to=NULL, assigned_at=NULL WHERE number=?", (num,))
            conn.execute("UPDATE allocations SET status = 'expired' WHERE id = ?", (alloc['id'],))
    return len(expired)

import os
import json
import asyncio
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from backend.app.core.config import settings

logger = logging.getLogger("sbi_saathi_db")
logging.basicConfig(level=logging.INFO)

# Global variables to hold the client and database references
db_client = None
db = None
use_mock_db = False

# ==========================================
# ASYNC JSON MOCK DATABASE FALLBACK ENGINE
# ==========================================

class MockCursor:
    def __init__(self, data):
        self._data = data
        self._index = 0

    def sort(self, key_or_list, direction=None):
        # Basic sorting if needed (e.g. descending date)
        if isinstance(key_or_list, str):
            reverse = direction == -1
            self._data.sort(key=lambda x: x.get(key_or_list, ""), reverse=reverse)
        return self

    def limit(self, limit_num):
        self._data = self._data[:limit_num]
        return self

    async def to_list(self, length=None):
        await asyncio.sleep(0.01)  # Simulate network latency
        if length is not None:
            return self._data[:length]
        return self._data

    def __aiter__(self):
        return self

    async def __anext__(self):
        await asyncio.sleep(0.01)
        if self._index >= len(self._data):
            raise StopAsyncIteration
        val = self._data[self._index]
        self._index += 1
        return val


class MockCollection:
    def __init__(self, db_instance, collection_name):
        self.db = db_instance
        self.name = collection_name

    def _load_data(self):
        if not os.path.exists(settings.MOCK_DB_FILE):
            return []
        try:
            with open(settings.MOCK_DB_FILE, "r") as f:
                data = json.load(f)
                return data.get(self.name, [])
        except Exception as e:
            logger.error(f"Error loading mock database file: {e}")
            return []

    def _save_data(self, data):
        all_data = {}
        if os.path.exists(settings.MOCK_DB_FILE):
            try:
                with open(settings.MOCK_DB_FILE, "r") as f:
                    all_data = json.load(f)
            except Exception:
                all_data = {}
        all_data[self.name] = data
        try:
            with open(settings.MOCK_DB_FILE, "w") as f:
                json.dump(all_data, f, indent=2, default=str)
        except Exception as e:
            logger.error(f"Error saving mock database file: {e}")

    async def find_one(self, filter_query):
        await asyncio.sleep(0.01)
        data = self._load_data()
        for doc in data:
            match = True
            for k, v in filter_query.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                return doc
        return None

    def find(self, filter_query=None):
        data = self._load_data()
        if not filter_query:
            return MockCursor(data)
        
        filtered_data = []
        for doc in data:
            match = True
            for k, v in filter_query.items():
                # Simple check for equals or in list
                if isinstance(v, dict) and "$in" in v:
                    if doc.get(k) not in v["$in"]:
                        match = False
                        break
                elif doc.get(k) != v:
                    match = False
                    break
            if match:
                filtered_data.append(doc)
        return MockCursor(filtered_data)

    async def insert_one(self, document):
        await asyncio.sleep(0.01)
        data = self._load_data()
        # Handle string ID conversion
        if "_id" not in document:
            import uuid
            document["_id"] = str(uuid.uuid4())
        data.append(document)
        self._save_data(data)
        
        class InsertResult:
            def __init__(self, inserted_id):
                self.inserted_id = inserted_id
        return InsertResult(document["_id"])

    async def update_one(self, filter_query, update_query, upsert=False):
        await asyncio.sleep(0.01)
        data = self._load_data()
        target_doc = None
        target_idx = -1
        
        for idx, doc in enumerate(data):
            match = True
            for k, v in filter_query.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                target_doc = doc
                target_idx = idx
                break

        if not target_doc:
            if upsert:
                # Create a new document combining filter and set fields
                new_doc = filter_query.copy()
                if "$set" in update_query:
                    new_doc.update(update_query["$set"])
                if "_id" not in new_doc:
                    import uuid
                    new_doc["_id"] = str(uuid.uuid4())
                data.append(new_doc)
                self._save_data(data)
                return True
            return False

        # Apply update
        if "$set" in update_query:
            target_doc.update(update_query["$set"])
        
        data[target_idx] = target_doc
        self._save_data(data)
        return True

    async def delete_one(self, filter_query):
        await asyncio.sleep(0.01)
        data = self._load_data()
        for idx, doc in enumerate(data):
            match = True
            for k, v in filter_query.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                data.pop(idx)
                self._save_data(data)
                return True
        return False

    async def delete_many(self, filter_query):
        await asyncio.sleep(0.01)
        data = self._load_data()
        new_data = []
        deleted_count = 0
        for doc in data:
            match = True
            for k, v in filter_query.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                deleted_count += 1
            else:
                new_data.append(doc)
        self._save_data(new_data)
        return deleted_count


class MockDatabase:
    def __init__(self):
        logger.info("Initializing Mock database engine...")

    def __getattr__(self, name):
        # Dynamically return a mock collection
        return MockCollection(self, name)

    def __getitem__(self, name):
        return MockCollection(self, name)


# ==========================================
# DATABASE INITIALIZATION
# ==========================================

async def init_db():
    global db_client, db, use_mock_db
    
    if not settings.MONGODB_URI:
        logger.warning("No MONGODB_URI environment variable configured. Falling back to Mock JSON DB.")
        db = MockDatabase()
        use_mock_db = True
        return
        
    try:
        # Attempt to connect to MongoDB
        logger.info("Connecting to MongoDB database...")
        db_client = AsyncIOMotorClient(settings.MONGODB_URI, serverSelectionTimeoutMS=2000)
        # Verify connection
        await db_client.admin.command('ping')
        db = db_client[settings.DB_NAME]
        logger.info("Successfully connected to MongoDB database!")
        use_mock_db = False
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}. Falling back to Mock JSON DB.")
        db = MockDatabase()
        use_mock_db = True


def get_db():
    global db
    if db is None:
        # Fallback inline initialization
        db = MockDatabase()
    return db

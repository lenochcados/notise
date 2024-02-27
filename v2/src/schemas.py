from datetime import datetime

from pydantic import BaseModel

class NoteCreate(BaseModel):
    title: str
    body: str
    date: datetime

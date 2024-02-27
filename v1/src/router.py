from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import insert, select, delete, update
from fastapi import APIRouter, Depends
from datetime import datetime

from src.database import get_async_session
from src.models import note
from src.schemas import NoteCreate

router = APIRouter(
    prefix="/notes",
    tags=["Notes"]
)


@router.post("/")
async def add_note(new_note: NoteCreate, session: AsyncSession = Depends(get_async_session)):
    stmt = insert(note).values(**new_note.__dict__).returning(note)
    result = await session.execute(stmt)
    await session.commit()

    note_id = result.scalars().unique().first()
    result = await session.execute(
        select(note).where(note.c.id == note_id)
    )
    return result.scalars().unique().first()


@router.put("/")
async def edit_note(id: int, new_note: NoteCreate, session: AsyncSession = Depends(get_async_session)):
    query = update(note).where(note.c.id==id).values(title = new_note.title, body = new_note.body, date = new_note.date)
    print(query)
    await session.execute(query)
    await session.commit()
    return {"status": "success"}


@router.get("/")
async def get_all_note(session: AsyncSession = Depends(get_async_session)):
    query = select(note)
    result = await session.execute(query)
    return [r._mapping for r in result.all()]


@router.delete("/")
async def del_note(id: int, session: AsyncSession = Depends(get_async_session)):
    query = delete(note).where(note.c.id==id)
    print(query)
    await session.execute(query)
    await session.commit()
    return {"status": "success"}

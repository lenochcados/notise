from sqlalchemy import MetaData, Table, Column, String, TIMESTAMP, Integer, Sequence

metadata = MetaData()

ID_SEQ = Sequence("cart_id_seq", start=1)

note = Table(
    "note",
    metadata,
    Column('id', Integer, ID_SEQ, primary_key=True, server_default=ID_SEQ.next_value()),
    Column("title", String),
    Column("body", String),
    Column("date", TIMESTAMP)
)
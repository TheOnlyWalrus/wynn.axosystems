import os

import asyncpg
import typing


class DBException(Exception):
    pass


class BaseDBConnection:
    def __init__(self, host, db_name, user):
        self.conn: typing.Optional[asyncpg.Connection] = None
        self.host = host
        self.db_name = db_name
        self.user = user

    async def connect(self):
        """Do not re-implement in child classes"""
        if self.conn:
            raise DBException(f'Connection to database {self.db_name} already established.')

        self.conn = await asyncpg.connect(
            user=self.user,
            password=os.environ.get('WEB_USER_DB_PASSWORD'),
            database=self.db_name,
            host=self.host
        )

    async def close(self):
        """Do not re-implement in child classes"""
        if not self.conn:
            raise DBException(f'Connection to database {self.db_name} does not exist.')

        await self.conn.close()
        self.conn = None

    @property
    def is_connected(self):
        return bool(self.conn)

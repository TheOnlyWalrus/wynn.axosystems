import os

import asyncpg
import typing


class DBException(Exception):
    pass


class BaseDBConnection:
    def __init__(self, host, db_name, user):
        self.pool: typing.Optional[asyncpg.pool.Pool] = None
        self.host = host
        self.db_name = db_name
        self.user = user

    async def connect(self):
        """Do not re-implement in child classes"""
        if self.pool:
            raise DBException(f'Connection to database {self.db_name} already established.')

        self.pool = await asyncpg.create_pool(
            user=self.user,
            password=os.environ.get('WEB_USER_DB_PASSWORD'),
            database=self.db_name,
            host=self.host
        )

    async def close(self):
        """Do not re-implement in child classes"""
        if not self.pool:
            raise DBException(f'Connection to database {self.db_name} does not exist.')

        await self.pool.close()
        self.pool = None

    @property
    def is_connected(self):
        return self.pool is not None

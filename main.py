from fastapi import FastAPI
from starlette.exceptions import HTTPException
from starlette.staticfiles import StaticFiles
from starlette.requests import Request
from starlette.templating import Jinja2Templates

from utils.database import BaseDBConnection

import random
import string
import os


class WebDBConnection(BaseDBConnection):
    async def get_user(self, uid=None, username=None):
        if not self.conn:
            await self.connect()

        if not uid and not username:
            raise Exception('Missing an argument in WebDBConnection.get_user')

        if uid is not None:
            user = await self.conn.fetchrow('SELECT * FROM wynn.users WHERE id=($1)', uid)
        else:
            user = await self.conn.fetchrow('SELECT * FROM wynn.users WHERE username ILIKE ($1)', username)

        return user


ALLOWED_EXTENSIONS = {'png', 'gif', 'jpg', 'jpeg', 'svg', 'mp4', 'jfif'}
ASSET_DIR = '/home/web/cdn/assets'

app = FastAPI()
db = WebDBConnection('192.168.0.129', 'axosystems', 'web')
app.mount('/css', StaticFiles(directory='web/static/css'), name='css')
app.mount('/js', StaticFiles(directory='web/static/js'), name='js')
app.mount('/img', StaticFiles(directory='web/static/img'), name='img')
app.mount('/json', StaticFiles(directory='web/static/json'), name='json')

templates = Jinja2Templates(directory='web/templates')


def check_file(f):
    return f.split('.')[-1].lower() in ALLOWED_EXTENSIONS


def random_string(length):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))


@app.on_event('startup')
async def startup():
    if not db.is_connected:
        await db.connect()


@app.on_event('shutdown')
async def cleanup():
    if db.is_connected:
        await db.close()


@app.get('/')
async def home(request: Request):
    return templates.TemplateResponse('home.html', {'request': request})


@app.get('/about')
async def about(request: Request):
    return templates.TemplateResponse('about.html', {'request': request})


@app.get('/projects')
async def projects(request: Request):
    return templates.TemplateResponse('projects.html', {'request': request})


@app.get('/projects/foxquest')
async def foxquest(request: Request):
    return templates.TemplateResponse('foxquest.html', {'request': request})


@app.get('/projects/zote')
async def projects_zote(request: Request):
    return templates.TemplateResponse('zote.html', {'request': request})


@app.get('/water')
async def water(request: Request):
    return templates.TemplateResponse('water.html', {'request': request})


@app.post('/api/v1/upload')
async def post_api_upload(request: Request):
    if request.query_params.get('key') != os.getenv('API_KEY', 'hopefully it will never be this totally random string that im writing here'):
        return {'status': 401, 'message': 'Invalid API key.'}

    form = await request.form()
    file = form.get('file')
    if not file:
        return {}  ## should probably actually send something back

    if not check_file(file.filename):
        return {'status': 415, 'message': 'Invalid media type.'}

    new_name = random_string(16) + '.' + file.filename.split('.')[-1]
    with open(f'{ASSET_DIR}/{new_name}', 'wb') as f:
        f.write(await file.read())

    return {'status': 200, 'location': {'dir': f'/{new_name}'}}


"""
    Errors
"""


async def not_found(request: Request, exc: HTTPException):
    return templates.TemplateResponse('404.html', {'request': request})


app.add_exception_handler(404, not_found)

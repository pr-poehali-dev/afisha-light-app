import os
import io
import json
import base64
import urllib.request
import urllib.parse

def handler(event: dict, context) -> dict:
    """Загрузка изображения в VK appWidgets. Возвращает url (VK CDN) и vk_cover_id."""

    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    image_b64 = body.get('image', '')

    if not image_b64:
        return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'image required'})}

    if ',' in image_b64:
        image_b64 = image_b64.split(',', 1)[1]

    image_data = base64.b64decode(image_b64)

    service_token = os.environ.get('VK_SERVICE_TOKEN', '')
    if not service_token:
        return {'statusCode': 500, 'headers': cors, 'body': json.dumps({'error': 'VK_SERVICE_TOKEN not set'})}

    try:
        import requests as req_lib
        from PIL import Image as PILImage

        VK_API = 'https://api.vk.com/method'

        # Масштабируем до 1530x384 (требование VK для типа 510x128)
        img = PILImage.open(io.BytesIO(image_data)).convert('RGB')
        img = img.resize((1530, 384), PILImage.LANCZOS)
        buf = io.BytesIO()
        img.save(buf, format='JPEG', quality=90)
        img_data = buf.getvalue()

        # 1. Получаем upload URL
        params = urllib.parse.urlencode({'image_type': '510x128', 'access_token': service_token, 'v': '5.199'})
        req_us = urllib.request.Request(f"{VK_API}/appWidgets.getAppImageUploadServer?{params}")
        with urllib.request.urlopen(req_us, timeout=10) as r:
            us_resp = json.loads(r.read())
        print(f"[upload] getAppImageUploadServer: {us_resp}")

        if 'error' in us_resp:
            return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': us_resp['error'].get('error_msg')})}

        upload_url = us_resp['response']['upload_url']

        # 2. Загружаем файл
        up_r = req_lib.post(upload_url, files={'file': ('cover.jpg', img_data, 'image/jpeg')}, timeout=20)
        up_data = up_r.json()
        print(f"[upload] upload resp: {up_data}")

        # 3. Сохраняем через saveAppImage
        save_params = urllib.parse.urlencode({
            'hash': up_data.get('hash', ''),
            'image': up_r.text,
            'access_token': service_token,
            'v': '5.199',
        })
        req_save = urllib.request.Request(f"{VK_API}/appWidgets.saveAppImage", data=save_params.encode())
        with urllib.request.urlopen(req_save, timeout=10) as r:
            save_resp = json.loads(r.read())
        print(f"[upload] saveAppImage: {save_resp}")

        if 'error' in save_resp:
            return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': save_resp['error'].get('error_msg')})}

        img_obj = save_resp['response']
        vk_cover_id = img_obj.get('id', '')

        # Берём публичный URL — наибольший размер из ответа
        images = img_obj.get('images', [])
        url = ''
        if images:
            largest = max(images, key=lambda x: x.get('width', 0))
            url = largest.get('url', '')

        print(f"[upload] cover_id={vk_cover_id}, url={url}")

        return {
            'statusCode': 200,
            'headers': cors,
            'body': json.dumps({'url': url, 'vk_cover_id': vk_cover_id}),
        }

    except Exception as ex:
        import traceback
        print(f"[upload] error: {traceback.format_exc()}")
        return {'statusCode': 500, 'headers': cors, 'body': json.dumps({'error': str(ex)})}

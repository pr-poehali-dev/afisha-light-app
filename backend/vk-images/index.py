import os
import io
import json
import base64
import urllib.request
import urllib.parse

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}
VK_API = 'https://api.vk.com/method'
VK_V = '5.199'


def vk_call(method: str, params: dict) -> dict:
    """Вызов VK API с сервисным токеном."""
    params['access_token'] = os.environ.get('VK_SERVICE_TOKEN', '')
    params['v'] = VK_V
    data = urllib.parse.urlencode(params).encode()
    req = urllib.request.Request(f"{VK_API}/{method}", data=data, method='POST')
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.loads(r.read())


def handler(event: dict, context) -> dict:
    """API для работы с изображениями виджетов VK.
    GET  ?action=list&image_type=510x128 — список загруженных изображений
    POST ?action=upload — загрузить новое изображение (base64 в теле)
    """
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    action = params.get('action', 'list')
    image_type = params.get('image_type', '510x128')

    def ok(data):
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(data, default=str)}

    def err(msg, code=400):
        return {'statusCode': code, 'headers': CORS, 'body': json.dumps({'error': msg})}

    # GET ?action=list — получить список загруженных изображений
    if method == 'GET' and action == 'list':
        resp = vk_call('appWidgets.getAppImages', {'image_type': image_type, 'count': 50})
        if 'error' in resp:
            return err(resp['error'].get('error_msg', 'VK error'))
        items = resp.get('response', {}).get('items', [])
        return ok(items)

    # POST ?action=upload — загрузить новое изображение
    if method == 'POST' and action == 'upload':
        try:
            import requests as req_lib
            from PIL import Image as PILImage

            body = json.loads(event.get('body') or '{}')
            image_b64 = body.get('image', '')
            if ',' in image_b64:
                image_b64 = image_b64.split(',', 1)[1]
            image_data = base64.b64decode(image_b64)

            # Определяем нужный размер
            size_map = {
                '510x128': (1530, 384),
                '160x160': (160, 160),
                '160x240': (160, 240),
                '50x50':   (50, 50),
            }
            target_w, target_h = size_map.get(image_type, (1530, 384))

            # Масштабируем
            img = PILImage.open(io.BytesIO(image_data)).convert('RGB')
            img = img.resize((target_w, target_h), PILImage.LANCZOS)
            buf = io.BytesIO()
            img.save(buf, format='JPEG', quality=90)
            img_data = buf.getvalue()

            # 1. Получаем upload URL
            us_resp = vk_call('appWidgets.getAppImageUploadServer', {'image_type': image_type})
            print(f"[vk-images] getAppImageUploadServer: {us_resp}")
            if 'error' in us_resp:
                return err(us_resp['error'].get('error_msg', 'VK error'))
            upload_url = us_resp['response']['upload_url']

            # 2. Загружаем файл
            up_r = req_lib.post(upload_url, files={'file': ('cover.jpg', img_data, 'image/jpeg')}, timeout=30)
            up_data = up_r.json()
            print(f"[vk-images] upload resp: {up_data}")

            # 3. Сохраняем через saveAppImage
            save_resp = vk_call('appWidgets.saveAppImage', {
                'hash': up_data.get('hash', ''),
                'image': up_r.text,
            })
            print(f"[vk-images] saveAppImage: {save_resp}")
            if 'error' in save_resp:
                return err(save_resp['error'].get('error_msg', 'VK save error'))

            img_obj = save_resp['response']
            return ok({'id': img_obj.get('id'), 'images': img_obj.get('images', [])})

        except Exception as ex:
            import traceback
            print(f"[vk-images] error: {traceback.format_exc()}")
            return err(str(ex))

    return err('Unknown action')

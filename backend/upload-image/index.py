import json
import base64
import urllib.request
import urllib.parse

def handler(event: dict, context) -> dict:
    """Загрузка фото мероприятия в фотоальбом группы VK.
    Принимает: image (base64), group_id, vk_token.
    Возвращает: url (публичный из VK), vk_photo_id (owner_id_photo_id).
    """

    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    image_b64 = body.get('image', '')
    group_id = int(body.get('group_id', 0))
    vk_token = body.get('vk_token', '')

    if not image_b64:
        return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'image required'})}
    if not vk_token or not group_id:
        return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'vk_token and group_id required'})}

    if ',' in image_b64:
        image_b64 = image_b64.split(',', 1)[1]
    image_data = base64.b64decode(image_b64)

    if image_data[:3] == b'\xff\xd8\xff':
        content_type = 'image/jpeg'
    elif image_data[:8] == b'\x89PNG\r\n\x1a\n':
        content_type = 'image/png'
    else:
        content_type = 'image/jpeg'

    try:
        import requests as req_lib

        VK_API = 'https://api.vk.com/method'

        # 1. Получаем upload URL
        params = urllib.parse.urlencode({
            'group_id': abs(group_id),
            'access_token': vk_token,
            'v': '5.199',
        })
        req_us = urllib.request.Request(f"{VK_API}/photos.getWallUploadServer?{params}")
        with urllib.request.urlopen(req_us, timeout=10) as r:
            us_resp = json.loads(r.read())
        print(f"[upload] getWallUploadServer: {us_resp}")

        if 'error' in us_resp:
            return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': us_resp['error'].get('error_msg')})}

        upload_url = us_resp['response']['upload_url']

        # 2. Загружаем фото
        up_r = req_lib.post(upload_url, files={'photo': ('photo.jpg', image_data, content_type)}, timeout=20)
        up_data = up_r.json()
        print(f"[upload] upload resp: {up_data}")

        if not up_data.get('photo') or up_data.get('photo') == '[]':
            return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'VK upload failed'})}

        # 3. Сохраняем фото
        save_params = urllib.parse.urlencode({
            'group_id': abs(group_id),
            'photo': up_data.get('photo', ''),
            'server': up_data.get('server', ''),
            'hash': up_data.get('hash', ''),
            'access_token': vk_token,
            'v': '5.199',
        })
        req_save = urllib.request.Request(f"{VK_API}/photos.saveWallPhoto", data=save_params.encode())
        with urllib.request.urlopen(req_save, timeout=10) as r:
            save_resp = json.loads(r.read())
        print(f"[upload] saveWallPhoto: {save_resp}")

        if 'error' in save_resp or not save_resp.get('response'):
            return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': save_resp.get('error', {}).get('error_msg', 'Save failed')})}

        photo = save_resp['response'][0]
        owner_id = photo.get('owner_id', '')
        photo_id = photo.get('id', '')
        vk_photo_id = f"{owner_id}_{photo_id}"

        # Берём наибольший публичный URL из sizes
        sizes = photo.get('sizes', [])
        url = ''
        if sizes:
            largest = max(sizes, key=lambda x: x.get('width', 0))
            url = largest.get('url', '')
        if not url:
            url = photo.get('photo_807') or photo.get('photo_604') or photo.get('photo_130') or ''

        print(f"[upload] vk_photo_id={vk_photo_id}, url={url}")

        return {
            'statusCode': 200,
            'headers': cors,
            'body': json.dumps({'url': url, 'vk_photo_id': vk_photo_id}),
        }

    except Exception as ex:
        import traceback
        print(f"[upload] error: {traceback.format_exc()}")
        return {'statusCode': 500, 'headers': cors, 'body': json.dumps({'error': str(ex)})}

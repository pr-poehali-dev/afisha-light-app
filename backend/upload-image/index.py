import os
import json
import base64
import uuid
import hmac
import hashlib
import datetime
import urllib.request
import urllib.parse

def handler(event: dict, context) -> dict:
    """Загрузка фото мероприятия. Грузит в S3 (CDN) и параллельно в фотоальбом группы VK если передан vk_token.
    Возвращает: url (CDN), vk_photo_id (формат owner_id_photo_id для icon_id в виджетах).
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

    if ',' in image_b64:
        image_b64 = image_b64.split(',', 1)[1]

    image_data = base64.b64decode(image_b64)

    if image_data[:3] == b'\xff\xd8\xff':
        ext, content_type = 'jpg', 'image/jpeg'
    elif image_data[:8] == b'\x89PNG\r\n\x1a\n':
        ext, content_type = 'png', 'image/png'
    else:
        ext, content_type = 'jpg', 'image/jpeg'

    file_key = f"events/{uuid.uuid4()}.{ext}"

    # === Загрузка в S3 ===
    access_key = os.environ['AWS_ACCESS_KEY_ID']
    secret_key = os.environ['AWS_SECRET_ACCESS_KEY']
    bucket = 'files'
    region = 'us-east-1'
    host = 'bucket.poehali.dev'
    endpoint = f'https://{host}'

    now = datetime.datetime.utcnow()
    date_str = now.strftime('%Y%m%d')
    datetime_str = now.strftime('%Y%m%dT%H%M%SZ')

    content_sha256 = hashlib.sha256(image_data).hexdigest()
    headers_to_sign = {
        'content-type': content_type,
        'host': host,
        'x-amz-content-sha256': content_sha256,
        'x-amz-date': datetime_str,
    }
    canonical_headers = ''.join(f"{k}:{v}\n" for k, v in sorted(headers_to_sign.items()))
    signed_headers = ';'.join(sorted(headers_to_sign.keys()))
    canonical_request = '\n'.join(['PUT', f'/{bucket}/{file_key}', '', canonical_headers, signed_headers, content_sha256])
    credential_scope = f'{date_str}/{region}/s3/aws4_request'
    string_to_sign = '\n'.join(['AWS4-HMAC-SHA256', datetime_str, credential_scope, hashlib.sha256(canonical_request.encode()).hexdigest()])

    def sign(key, msg):
        return hmac.new(key, msg.encode(), hashlib.sha256).digest()

    signing_key = sign(sign(sign(sign(f'AWS4{secret_key}'.encode(), date_str), region), 's3'), 'aws4_request')
    signature = hmac.new(signing_key, string_to_sign.encode(), hashlib.sha256).hexdigest()
    authorization = f'AWS4-HMAC-SHA256 Credential={access_key}/{credential_scope}, SignedHeaders={signed_headers}, Signature={signature}'

    s3_url = f'{endpoint}/{bucket}/{file_key}'
    req = urllib.request.Request(s3_url, data=image_data, method='PUT')
    req.add_header('Authorization', authorization)
    req.add_header('Content-Type', content_type)
    req.add_header('x-amz-content-sha256', content_sha256)
    req.add_header('x-amz-date', datetime_str)
    with urllib.request.urlopen(req) as resp:
        resp.read()

    cdn_url = f"https://cdn.poehali.dev/projects/{access_key}/bucket/{file_key}"

    # === Загрузка в фотоальбом группы VK ===
    vk_photo_id = ''
    if vk_token and group_id:
        try:
            import requests as req_lib

            VK_API = 'https://api.vk.com/method'

            # 1. Получаем upload URL для стены группы
            params = urllib.parse.urlencode({
                'group_id': abs(group_id),
                'access_token': vk_token,
                'v': '5.199',
            })
            req_us = urllib.request.Request(f"{VK_API}/photos.getWallUploadServer?{params}")
            with urllib.request.urlopen(req_us, timeout=10) as r:
                us_resp = json.loads(r.read())
            print(f"[upload-vk] getWallUploadServer: {us_resp}")

            if 'response' in us_resp:
                upload_url = us_resp['response']['upload_url']

                # 2. Загружаем фото
                up_r = req_lib.post(upload_url, files={'photo': ('photo.jpg', image_data, content_type)}, timeout=20)
                up_data = up_r.json()
                print(f"[upload-vk] upload resp: {up_data}")

                if up_data.get('photo') and up_data.get('photo') != '[]':
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
                    print(f"[upload-vk] saveWallPhoto: {save_resp}")

                    if save_resp.get('response'):
                        photo = save_resp['response'][0]
                        owner_id = photo.get('owner_id', '')
                        photo_id = photo.get('id', '')
                        vk_photo_id = f"{owner_id}_{photo_id}"
                        print(f"[upload-vk] vk_photo_id={vk_photo_id}")

        except Exception as ex:
            import traceback
            print(f"[upload-vk] error: {traceback.format_exc()}")

    return {
        'statusCode': 200,
        'headers': cors,
        'body': json.dumps({'url': cdn_url, 'vk_photo_id': vk_photo_id}),
    }

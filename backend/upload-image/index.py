import os
import io
import json
import base64
import uuid
import hmac
import hashlib
import datetime
import urllib.request
import urllib.parse

def handler(event: dict, context) -> dict:
    """Загрузка изображения в S3 + параллельная загрузка в VK appWidgets. Возвращает url и vk_cover_id."""

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

    url = f'{endpoint}/{bucket}/{file_key}'
    req = urllib.request.Request(url, data=image_data, method='PUT')
    req.add_header('Authorization', authorization)
    req.add_header('Content-Type', content_type)
    req.add_header('x-amz-content-sha256', content_sha256)
    req.add_header('x-amz-date', datetime_str)
    with urllib.request.urlopen(req) as resp:
        resp.read()

    cdn_url = f"https://cdn.poehali.dev/projects/{access_key}/bucket/{file_key}"

    # === Параллельная загрузка в VK appWidgets ===
    vk_cover_id = ''
    service_token = os.environ.get('VK_SERVICE_TOKEN', '')
    if service_token:
        try:
            import requests as req_lib
            from PIL import Image as PILImage

            # Масштабируем до 1530x384 (VK требует этот размер для типа 510x128)
            img = PILImage.open(io.BytesIO(image_data)).convert('RGB')
            img = img.resize((1530, 384), PILImage.LANCZOS)
            buf = io.BytesIO()
            img.save(buf, format='JPEG', quality=90)
            cover_data = buf.getvalue()

            VK_API = 'https://api.vk.com/method'

            # 1. Получаем upload URL
            params = urllib.parse.urlencode({'image_type': '510x128', 'access_token': service_token, 'v': '5.199'})
            req_us = urllib.request.Request(f"{VK_API}/appWidgets.getAppImageUploadServer?{params}")
            with urllib.request.urlopen(req_us, timeout=10) as r:
                us_resp = json.loads(r.read())
            print(f"[upload-vk] getAppImageUploadServer: {us_resp}")

            if 'response' in us_resp:
                upload_url = us_resp['response']['upload_url']

                # 2. Загружаем файл
                up_r = req_lib.post(upload_url, files={'file': ('cover.jpg', cover_data, 'image/jpeg')}, timeout=20)
                up_data = up_r.json()
                print(f"[upload-vk] upload resp: {up_data}")

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
                print(f"[upload-vk] saveAppImage: {save_resp}")

                if save_resp.get('response', {}).get('id'):
                    vk_cover_id = save_resp['response']['id']
                    print(f"[upload-vk] cover_id={vk_cover_id}")

        except Exception as ex:
            import traceback
            print(f"[upload-vk] error: {traceback.format_exc()}")

    return {
        'statusCode': 200,
        'headers': cors,
        'body': json.dumps({'url': cdn_url, 'vk_cover_id': vk_cover_id}),
    }

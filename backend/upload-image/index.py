import os
import json
import base64
import uuid
import hmac
import hashlib
import datetime
import urllib.request
import urllib.parse
import io

def handler(event: dict, context) -> dict:
    """Загрузка изображения обложки мероприятия в S3. Принимает base64, возвращает URL."""

    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    image_b64 = body.get('image')
    group_id = body.get('group_id', 0)
    vk_token = body.get('vk_token', '')
    print(f"[upload] group_id={group_id}, has_token={bool(vk_token)}, has_image={bool(image_b64)}")

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

    access_key = os.environ['AWS_ACCESS_KEY_ID']
    secret_key = os.environ['AWS_SECRET_ACCESS_KEY']
    bucket = 'files'
    region = 'us-east-1'
    host = 'bucket.poehali.dev'
    endpoint = f'https://{host}'

    # AWS Signature V4
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

    canonical_request = '\n'.join([
        'PUT',
        f'/{bucket}/{file_key}',
        '',
        canonical_headers,
        signed_headers,
        content_sha256,
    ])

    credential_scope = f'{date_str}/{region}/s3/aws4_request'
    string_to_sign = '\n'.join([
        'AWS4-HMAC-SHA256',
        datetime_str,
        credential_scope,
        hashlib.sha256(canonical_request.encode()).hexdigest(),
    ])

    def sign(key, msg):
        return hmac.new(key, msg.encode(), hashlib.sha256).digest()

    signing_key = sign(sign(sign(sign(f'AWS4{secret_key}'.encode(), date_str), region), 's3'), 'aws4_request')
    signature = hmac.new(signing_key, string_to_sign.encode(), hashlib.sha256).hexdigest()

    authorization = (
        f'AWS4-HMAC-SHA256 Credential={access_key}/{credential_scope}, '
        f'SignedHeaders={signed_headers}, Signature={signature}'
    )

    url = f'{endpoint}/{bucket}/{file_key}'
    req = urllib.request.Request(url, data=image_data, method='PUT')
    req.add_header('Authorization', authorization)
    req.add_header('Content-Type', content_type)
    req.add_header('x-amz-content-sha256', content_sha256)
    req.add_header('x-amz-date', datetime_str)

    with urllib.request.urlopen(req) as resp:
        resp.read()

    cdn_url = f"https://cdn.poehali.dev/projects/{access_key}/bucket/{file_key}"

    # Загружаем фото в VK если переданы токен и group_id — получаем cover_id
    vk_cover_id = ''
    if vk_token and group_id:
        try:
            import requests as req_lib
            from PIL import Image as PILImage

            # Масштабируем до 510x128 для cover_list
            img_obj = PILImage.open(io.BytesIO(image_data)).convert('RGB')
            img_obj = img_obj.resize((510, 128), PILImage.LANCZOS)
            buf = io.BytesIO()
            img_obj.save(buf, format='JPEG', quality=90)
            cover_data = buf.getvalue()

            # Получаем upload URL
            vk_api = 'https://api.vk.com/method'
            params = urllib.parse.urlencode({'group_id': abs(int(group_id)), 'access_token': vk_token, 'v': '5.199'})
            req_us = urllib.request.Request(f"{vk_api}/photos.getWallUploadServer?{params}")
            with urllib.request.urlopen(req_us, timeout=10) as r:
                us_resp = json.loads(r.read())

            if 'response' in us_resp:
                upload_url = us_resp['response']['upload_url']
                up_r = req_lib.post(upload_url, files={'photo': ('cover.jpg', cover_data, 'image/jpeg')}, timeout=20)
                up_data = up_r.json()

                if up_data.get('photo') and up_data.get('photo') != '[]':
                    save_params = urllib.parse.urlencode({
                        'group_id': abs(int(group_id)),
                        'photo': up_data.get('photo', ''),
                        'server': up_data.get('server', ''),
                        'hash': up_data.get('hash', ''),
                        'access_token': vk_token,
                        'v': '5.199',
                    })
                    req_save = urllib.request.Request(f"{vk_api}/photos.saveWallPhoto", data=save_params.encode())
                    with urllib.request.urlopen(req_save, timeout=10) as r:
                        save_resp = json.loads(r.read())
                    if save_resp.get('response'):
                        photo = save_resp['response'][0]
                        vk_cover_id = f"{photo['owner_id']}_{photo['id']}"
        except Exception as ex:
            print(f"[upload] vk cover upload error: {ex}")

    return {
        'statusCode': 200,
        'headers': cors,
        'body': json.dumps({'url': cdn_url, 'vk_cover_id': vk_cover_id}),
    }
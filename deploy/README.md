# VPS Media Upload Setup

Set production environment values:

```env
MEDIA_STORAGE_ROOT=/var/www/gts-katha-media
NEXT_PUBLIC_MEDIA_BASE_URL=/uploads
UPLOAD_CHUNK_SIZE_MB=2
```

Create writable storage:

```bash
sudo mkdir -p /var/www/gts-katha-media
sudo chown -R YOUR_APP_USER:YOUR_APP_GROUP /var/www/gts-katha-media
```

Use `nginx-gts-katha.conf.example` as proxy baseline. Uploads default to 2 MB chunks, so Nginx never receives a full 30-60 minute media file in one request. Keep `UPLOAD_CHUNK_SIZE_MB` within 1-6 MB and leave the Nginx timeouts at 300 seconds or above.

Seed or rotate admin credentials:

```bash
npm run seed:admin
```

This reads `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` from `.env` or `.env.local`.

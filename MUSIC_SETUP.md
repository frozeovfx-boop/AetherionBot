# Yuta müzik — senin yapacakların

## 1) Lavalink (zorunlu)

```bash
docker compose -f docker-compose.lavalink.yml up -d
```

veya ayrı VPS / Railway’de ikinci servis.

Test: `http://HOST:2333/v4/info` (header: Authorization = şifre)

## 2) Env

```
LAVALINK_HOST=127.0.0.1
LAVALINK_PORT=2333
LAVALINK_PASSWORD=youshallnotpass
```

Railway: Lavalink ayrı service → HOST = o servisin internal hostname.

## 3) Bağımlılık

```bash
npm install
```

`lavalink-client` package.json’da. Install yoksa ses çıkmaz (sadece kuyruk).

## 4) Discord

- Davet: **Connect**, **Speak**, **Use Voice Activity**
- Botu ses kanalına girebilecek şekilde ayarla
- Kullanıcı sen komutu kullanırken seste ol

## 5) Test

```
/musicstatus
/play sarki:never gonna give you up
/filter tip:Bass Boost
```

## Sınırlar

- Discord bitrate tavanı (stüdyo kalitesi yok)
- YouTube kaynağı Lavalink plugin/sürüme bağlı
- Tam reverb = ekstra plugin; bizde bass / 8d / nightcore / tremolo var

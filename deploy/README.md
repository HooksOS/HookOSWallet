# HookOS Wallet — VPS deploy artifacts

Version-controlled copies of everything the wallet owns on the shared HookOS VPS
(`ubuntu@15.204.8.186`). These files are the **source of truth**; the box is deployed *from*
them. Mirrors the **VPS deployment** + **Approval policy** sections of `../CLAUDE.md`.

> The box is shared (~11 compose projects + many nginx vhosts). Everything here is namespaced so it
> **never touches another project**. Deploys/redeploys are *major actions* — get explicit approval
> first (see `../CLAUDE.md`).

## What's deployed

| Artifact | Public URL | Host location |
| --- | --- | --- |
| `hookos-wallet-infura/` — isolated read-only Infura API (container) | `https://infura.hookoswallet.xyz` | `/home/ubuntu/hookos-wallet-infura/` |
| `hookoswallet-site/` — apex landing + universal-link files (static) | `https://hookoswallet.xyz` (+ `www`) | `/var/www/hookoswallet-site/` |

nginx vhosts live in `/etc/nginx/sites-available/` (symlinked into `sites-enabled/`); TLS via Let's
Encrypt (`certbot certonly --webroot` — **never `--nginx`** here, it once mis-attached our cert to the
shared `wildcard-hookos.conf`). Both `*.hookoswallet.xyz` and `*.hookos.fun` wildcard-DNS to the box.

## Isolation contract (never violate)

- Own compose project / container / image / network / **localhost-only** port (`127.0.0.1:18080`).
- No duplicate validators/relayer (key-holding singletons — duplicates risk double-sign/slash).
- Own `.env` (`chmod 600`, generated key, **public** RPCs + indexer) — never copy prod secrets.
- After `systemctl reload nginx`, wait a moment before verifying (old workers drain → brief reload race).
- Verify after every deploy: our endpoints healthy **and** the prod `hookos-infura` stack +
  `*.hookos.fun` catch-all cert + all other vhosts untouched.

## Redeploy

```bash
# Infura API (isolated container)
ssh ubuntu@15.204.8.186
cd /home/ubuntu/hookos-wallet-infura && docker compose -p hookos-wallet-infura up -d --build
curl -s http://127.0.0.1:18080/health      # -> {"ok":true}

# Apex site (static) — sync www/ then reload
sudo rsync -a deploy/hookoswallet-site/www/ /var/www/hookoswallet-site/
sudo nginx -t && sudo systemctl reload nginx
```

## Open TODOs (universal links)

- `hookoswallet-site/www/.well-known/assetlinks.json` — replace the placeholder with the **release
  keystore SHA-256** (`keytool -list -v -keystore <release.keystore> -alias <alias>`). Until then
  Android App Links won't auto-verify.
- `hookoswallet-site/www/.well-known/apple-app-site-association` — currently lists **both** Apple Team
  IDs (`L74NQAQB8H`, `2897MY7R2W`) for `com.hookos.wallet`; trim to whichever signs the release.

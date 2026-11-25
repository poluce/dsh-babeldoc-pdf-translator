import sys
import os
import httpx
import sqlite3
import time

BROWSER_UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
)

DEBUG = os.environ.get("BABELDOC_DEBUG") == "1"


def _warmup_cache_db():
    try:
        import pathlib
        p = str(pathlib.Path.home() / ".cache" / "babeldoc" / "cache.v1.db")
        for _ in range(12):
            try:
                c = sqlite3.connect(p, timeout=3)
                c.execute("PRAGMA busy_timeout=3000")
                c.execute("PRAGMA journal_mode=wal").fetchall()
                c.execute("PRAGMA busy_timeout=60000")
                c.close()
                if DEBUG:
                    print("BABELDOC-DEBUG cache warmup ok", file=sys.stderr)
                return
            except Exception:
                try:
                    c.close()
                except Exception:
                    pass
                time.sleep(0.4)
    except Exception:
        pass
    if DEBUG:
        print("BABELDOC-DEBUG cache warmup failed", file=sys.stderr)


_orig_client = httpx.Client.__init__


def _patched_client(self, *args, **kwargs):
    h = dict(kwargs.get("headers") or {})
    h.setdefault("User-Agent", BROWSER_UA)
    h.setdefault("Accept", "*/*")
    kwargs["headers"] = h
    if DEBUG:
        print("BABELDOC-DEBUG patched httpx.Client init", file=sys.stderr)
    _orig_client(self, *args, **kwargs)


httpx.Client.__init__ = _patched_client

_orig_async = httpx.AsyncClient.__init__


def _patched_async(self, *args, **kwargs):
    h = dict(kwargs.get("headers") or {})
    h.setdefault("User-Agent", BROWSER_UA)
    kwargs["headers"] = h
    if DEBUG:
        print("BABELDOC-DEBUG patched httpx.AsyncClient init", file=sys.stderr)
    _orig_async(self, *args, **kwargs)


httpx.AsyncClient.__init__ = _patched_async

try:
    from openai._base_client import BaseClient as _OAIBase

    _orig_default_headers = _OAIBase.default_headers

    def _patched_default_headers(self):
        h = dict(_orig_default_headers.fget(self))
        h["User-Agent"] = BROWSER_UA
        return h

    _OAIBase.default_headers = property(_patched_default_headers)

    try:
        from openai._base_client import AsyncBaseClient as _OAIAsync

        _orig_async_dh = _OAIAsync.default_headers

        def _patched_async_dh(self):
            h = dict(_orig_async_dh.fget(self))
            h["User-Agent"] = BROWSER_UA
            return h

        _OAIAsync.default_headers = property(_patched_async_dh)
    except Exception:
        pass

    if DEBUG:
        print("BABELDOC-DEBUG patched openai default_headers", file=sys.stderr)
except Exception as e:
    if DEBUG:
        print("BABELDOC-DEBUG openai patch failed:", repr(e), file=sys.stderr)

try:
    import peewee

    _orig_set_pragmas = peewee.SqliteDatabase._set_pragmas

    def _patched_set_pragmas(self, conn):
        try:
            conn.execute("PRAGMA busy_timeout=60000")
        except Exception:
            pass
        last_err = None
        for _ in range(10):
            try:
                _orig_set_pragmas(self, conn)
                last_err = None
                break
            except Exception as e:
                last_err = e
                time.sleep(0.3)
        if last_err is not None:
            raise last_err
        try:
            conn.execute("PRAGMA busy_timeout=60000")
        except Exception:
            pass
        return None

    peewee.SqliteDatabase._set_pragmas = _patched_set_pragmas
    if DEBUG:
        print("BABELDOC-DEBUG patched peewee busy_timeout+retry", file=sys.stderr)
except Exception as e:
    if DEBUG:
        print("BABELDOC-DEBUG peewee patch failed:", repr(e), file=sys.stderr)

_warmup_cache_db()

from babeldoc.main import cli

if __name__ == "__main__":
    sys.exit(cli())

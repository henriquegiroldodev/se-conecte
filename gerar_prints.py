from pathlib import Path
import sys
import threading
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT / '.capture-tools'))
from playwright.sync_api import sync_playwright
from PIL import Image
from pypdf import PdfReader

OUT = ROOT / 'prints'
OUT.mkdir(exist_ok=True)

class QuietHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)
    def log_message(self, *args):
        pass

server = ThreadingHTTPServer(('127.0.0.1', 0), QuietHandler)
threading.Thread(target=server.serve_forever, daemon=True).start()
url = f'http://127.0.0.1:{server.server_port}/index.html'
screens = [
    ('01-login', None),
    ('02-inicio', 'inicio'),
    ('03-aprender', 'aprender'),
    ('04-curso', 'curso/internet'),
    ('05-aula', 'aula/internet/4'),
    ('06-exercicio', 'exercicio/internet'),
    ('07-progresso', 'progresso'),
    ('08-passaporte-digital', 'passaporte'),
    ('09-oportunidades', 'oportunidades'),
    ('10-perfil', 'perfil'),
]
images = []
try:
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=r'C:\Program Files\Google\Chrome\Application\chrome.exe', headless=True)
        page = browser.new_page(viewport={'width': 1440, 'height': 1000}, device_scale_factor=1)
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(url, wait_until='networkidle')
        for name, route in screens:
            if route:
                if name == '02-inicio':
                    page.evaluate("localStorage.setItem('sc_onboarded', 'true')")
                    page.locator('#loginForm button').click()
                page.evaluate('(route) => location.hash = "#/" + route', route)
                page.wait_for_function("document.querySelector('#main h1') !== null")
                page.wait_for_timeout(350)
                assert page.locator('#main').inner_text().strip(), name
            page.evaluate('document.fonts.ready')
            path = OUT / f'{name}.png'
            page.screenshot(path=str(path), full_page=True, animations='disabled')
            images.append(Image.open(path).convert('RGB'))
            print(f'{name}: {images[-1].size}', flush=True)
        browser.close()
        if errors:
            raise RuntimeError(errors)
    pdf = OUT / 'Se-Conecte-10-telas.pdf'
    images[0].save(pdf, save_all=True, append_images=images[1:], resolution=144, title='Se Conecte - 10 telas', author='Se Conecte')
    assert len(PdfReader(pdf).pages) == 10
    print(f'PDF verificado: {pdf} ({pdf.stat().st_size:,} bytes)', flush=True)
finally:
    server.shutdown()

"""Runner opcional, somente biblioteca padrão. Requer PHP local e Chrome/Edge.

python tests/run-browser.py --base http://127.0.0.1:8000 --width 390
Usa um perfil temporário isolado e tempo real para testar também o Service Worker.
"""
import argparse
import base64
import json
import os
from pathlib import Path
import socket
import struct
import subprocess
import sys
import tempfile
import time
import urllib.request
from urllib.parse import urlencode, urlsplit


class DevTools:
    def __init__(self, address):
        url = urlsplit(address)
        self.connection = socket.create_connection((url.hostname, url.port), timeout=10)
        key = base64.b64encode(os.urandom(16)).decode()
        self.connection.sendall((f'GET {url.path} HTTP/1.1\r\nHost: {url.netloc}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n').encode())
        response = b''
        while not response.endswith(b'\r\n\r\n'):
            response += self.connection.recv(1)
        if response.split(b'\r\n', 1)[0].split()[1:2] != [b'101']:
            raise RuntimeError('Não foi possível conectar ao navegador.')
        self.sequence = 0

    def read(self, count):
        value = b''
        while len(value) < count:
            chunk = self.connection.recv(count - len(value))
            if not chunk:
                raise ConnectionError('Navegador encerrou a conexão.')
            value += chunk
        return value

    def send(self, content):
        data = json.dumps(content).encode()
        mask = os.urandom(4)
        length = len(data)
        header = bytes([0x81, 0x80 | length]) if length < 126 else bytes([0x81, 0x80 | 126]) + struct.pack('!H', length) if length < 65536 else bytes([0x81, 0x80 | 127]) + struct.pack('!Q', length)
        self.connection.sendall(header + mask + bytes(byte ^ mask[index % 4] for index, byte in enumerate(data)))

    def receive(self):
        header = self.read(2)
        length = header[1] & 127
        if length == 126:
            length = struct.unpack('!H', self.read(2))[0]
        elif length == 127:
            length = struct.unpack('!Q', self.read(8))[0]
        mask = self.read(4) if header[1] & 128 else None
        content = self.read(length)
        if mask:
            content = bytes(byte ^ mask[index % 4] for index, byte in enumerate(content))
        return json.loads(content)

    def call(self, method, params=None):
        self.sequence += 1
        self.send({'id': self.sequence, 'method': method, 'params': params or {}})
        while True:
            message = self.receive()
            if message.get('id') == self.sequence:
                if 'error' in message:
                    raise RuntimeError(message['error'])
                return message.get('result', {})

    def evaluate(self, expression):
        result = self.call('Runtime.evaluate', {'expression': expression, 'returnByValue': True})
        if 'exceptionDetails' in result:
            raise RuntimeError(result['exceptionDetails'])
        return result.get('result', {}).get('value')


def poll(action, accept, timeout=35):
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        try:
            value = action()
            if accept(value):
                return value
        except (OSError, ValueError):
            pass
        time.sleep(.1)
    raise TimeoutError('O navegador não concluiu a verificação no tempo esperado.')


def main():
    sys.stdout.reconfigure(encoding='utf-8')
    parser = argparse.ArgumentParser()
    parser.add_argument('--base', default='http://127.0.0.1:8000')
    parser.add_argument('--width', type=int, default=1440)
    parser.add_argument('--preview', choices=['course', 'easy', 'welcome'])
    parser.add_argument('--screenshot')
    parser.add_argument('--verbose', action='store_true')
    args = parser.parse_args()
    browser = next((path for path in [Path('C:/Program Files/Google/Chrome/Application/chrome.exe'), Path('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe')] if path.exists()), None)
    if not browser:
        raise RuntimeError('Chrome ou Edge não encontrado.')
    # Perfil único: não abre, altera ou apaga o perfil pessoal do usuário.
    profile = Path(tempfile.mkdtemp(prefix='se-conecte-test-'))
    process = subprocess.Popen([str(browser), '--headless', '--disable-gpu', '--no-first-run', '--remote-debugging-port=0', '--user-data-dir=' + str(profile), 'about:blank'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, creationflags=subprocess.CREATE_NO_WINDOW)
    client = None
    try:
        active_port = profile / 'DevToolsActivePort'
        port = poll(lambda: active_port.read_text().splitlines()[0], bool)
        tabs = json.load(urllib.request.urlopen(f'http://127.0.0.1:{port}/json/list', timeout=10))
        client = DevTools(next(tab['webSocketDebuggerUrl'] for tab in tabs if tab['type'] == 'page'))
        client.call('Page.enable')
        client.call('Emulation.setDeviceMetricsOverride', {'width': args.width, 'height': 1000, 'deviceScaleFactor': 1, 'mobile': False})
        query = {'width': args.width}
        if args.preview:
            query['preview'] = args.preview
        client.call('Page.navigate', {'url': args.base.rstrip('/') + '/tests/accessibility-safety.html?' + urlencode(query)})
        result = poll(lambda: client.evaluate("document.querySelector('#verification')?.textContent || ''"), lambda value: value.startswith(('PASS', 'FAIL')))
        print(result if args.verbose else result.splitlines()[0])
        if result.startswith('FAIL'):
            raise RuntimeError('Falhou a verificação de interface.')
        if args.screenshot:
            capture = client.call('Page.captureScreenshot', {'format': 'png'})
            Path(args.screenshot).write_bytes(base64.b64decode(capture['data']))
        # Verifica videoaulas, prática, progresso e retomada na interface real.
        client.evaluate("sessionStorage.setItem('sc_logged','1'); localStorage.setItem('sc_onboarded','true')")
        client.call('Page.navigate', {'url': args.base.rstrip('/') + '/index.html#/aula/informatica-basica/1'})
        poll(lambda: client.evaluate("!!document.querySelector('#completeVideoLesson')"), bool)
        assert client.evaluate("document.querySelectorAll('.video-frame iframe').length === 0"), 'Vídeo carregou antes do clique'
        client.evaluate("document.querySelector('[data-load-video]').click()")
        assert client.evaluate("document.querySelector('.video-frame iframe').src.includes('youtube-nocookie.com/embed/JdSTF0iYYhI')"), 'Player incorreto'
        client.evaluate("document.querySelector('[data-video-answer=\"0\"]').click()")
        assert client.evaluate("document.querySelector('#completeVideoLesson').disabled"), 'Resposta incorreta permitiu concluir'
        client.evaluate("document.querySelector('[data-video-answer=\"1\"]').click(); document.querySelector('#completeVideoLesson').click()")
        poll(lambda: client.evaluate('location.hash'), lambda value: value == '#/aula/informatica-basica/2')
        assert client.evaluate("JSON.parse(localStorage.getItem('sc_progress'))['informatica-basica'] === 50"), 'Progresso não foi salvo'
        client.evaluate("location.hash='#/aula/seguranca/2'")
        poll(lambda: client.evaluate("document.querySelector('#main h1')?.textContent"), lambda value: value == 'Criando senhas mais seguras')
        assert client.evaluate("document.querySelector('[data-load-video]').dataset.loadVideo === 'whSgBpNyr2c'"), 'Vídeo de segurança incorreto'
        assert client.evaluate("document.documentElement.scrollWidth <= innerWidth"), 'Videoaula excede a tela'
        print('PASS videoaulas: player sob demanda, resposta, conclusão, progresso e segurança.')
        client.evaluate("location.hash='#/perfil'")
        poll(lambda: client.evaluate("!!document.querySelector('#profileFullName')"), bool)
        client.evaluate("document.querySelector('#profileFullName').value='Maria de Souza'; document.querySelector('#profileForm').requestSubmit()")
        client.evaluate("location.hash='#/aula/informatica-basica/2'")
        poll(lambda: client.evaluate("!!document.querySelector('#completeVideoLesson')"), bool)
        client.evaluate("document.querySelector('[data-video-answer=\"0\"]').click(); document.querySelector('#completeVideoLesson').click()")
        poll(lambda: client.evaluate("document.querySelector('.certificate-name')?.textContent"), lambda value: value == 'Maria de Souza')
        assert client.evaluate("SCCertificates.sync(); JSON.parse(localStorage.getItem('sc_certificates_v1')).filter(x=>x.courseId==='informatica-basica').length === 1"), 'Certificado duplicado'
        client.call('Page.reload')
        poll(lambda: client.evaluate("document.querySelector('.certificate-name')?.textContent"), lambda value: value == 'Maria de Souza')
        assert client.evaluate("!!document.querySelector('#printCertificate')"), 'Impressão indisponível'
        assert client.evaluate("document.documentElement.scrollWidth <= innerWidth"), 'Certificado excede a tela'
        print('PASS certificados: emissão ao concluir, nome completo, sem duplicação e persistência após recarregar.')
        # Testa carregamento real offline em uma nova navegação, com todos os scripts do cache.
        client.evaluate("sessionStorage.setItem('sc_logged','1'); localStorage.setItem('sc_onboarded','true')")
        client.call('Network.enable')
        client.call('Network.emulateNetworkConditions', {'offline': True, 'latency': 0, 'downloadThroughput': 0, 'uploadThroughput': 0})
        client.call('Page.navigate', {'url': args.base.rstrip('/') + '/index.html#/inicio'})
        poll(lambda: client.evaluate("document.querySelector('#main')?.dataset.page || ''"), lambda value: value == 'inicio')
        client.evaluate("location.hash='#/aula/seguranca-digital/1'")
        poll(lambda: client.evaluate("document.querySelector('#safetyLessonTitle')?.textContent || ''"), lambda value: value == 'Segurança na internet')
        print('PASS PWA: Dashboard e aula Segurança Digital carregaram com a rede desativada.')
    finally:
        if client:
            try:
                client.call('Browser.close')
            except (OSError, ConnectionError, ValueError):
                pass
        try:
            process.wait(timeout=8)
        except subprocess.TimeoutExpired:
            process.terminate()


if __name__ == '__main__':
    main()

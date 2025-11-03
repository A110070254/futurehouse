from flask import Flask, jsonify, request
from flask_cors import CORS
import subprocess
import os

app = Flask(__name__)
CORS(app)  

# 遊戲路徑
EXE_PATH = r""

@app.route('/run', methods=['POST'])
def run_exe():
    try:
        if not os.path.exists(EXE_PATH):
            return jsonify({"ok": False, "error": "EXE 路徑不存在"}), 404
        
   
        subprocess.Popen([EXE_PATH], shell=False)
        return jsonify({"ok": True, "message": "程式已啟動"})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500


if __name__ == '__main__':

    app.run(host='127.0.0.1', port=5000)

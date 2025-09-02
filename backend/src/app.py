from flask import Flask
from flask_cors import CORS
from routes.process import process_bp
from dotenv import load_dotenv
import os
import chroma_setup
from routes.recognize import recognize_bp
from routes.delete import delete_bp


def create_app():
    app = Flask(__name__)
    
    # Enable CORS for all routes
    CORS(app, origins=["*"])
    
    # Load environment variables
    load_dotenv()
    
    # Register blueprints
    app.register_blueprint(process_bp)
    app.register_blueprint(recognize_bp)
    app.register_blueprint(delete_bp)
    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.getenv('FLASK_PORT', 5000))
    app.run(host='0.0.0.0', port=5000, debug=True)
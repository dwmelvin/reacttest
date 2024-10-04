from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/api", methods=["POST"])
def api():
    return {"response": "Hello from the server!"}

if __name__ == "__main__":
    app.run(debug=True)

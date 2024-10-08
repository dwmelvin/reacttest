from flask import Flask, request, Response, jsonify
from flask_cors import CORS
import WorkingRAG1  # Import WorkingRAG1 script

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route("/api", methods=["POST"])
def api():
    data = request.json
    user_input = data.get('input')
    history = data.get('history', [])

    def generate_response():
        if user_input:
            try:
                response_generator = WorkingRAG1.predict(user_input, history, None)
                for partial_response in response_generator:
                    yield f"data: {partial_response}\n\n"  # SSE requires 'data: ' prefix
            except Exception as e:
                yield f"data: An error occurred: {str(e)}\n\n"
        else:
            yield "data: No input provided.\n\n"

    return Response(generate_response(), content_type='text/event-stream')

# Root route to check if the server is running
@app.route("/", methods=["GET"])
def home():
    return "Flask server is running!", 200

if __name__ == "__main__":
    app.run(debug=True)

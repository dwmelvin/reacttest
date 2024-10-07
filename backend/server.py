from flask import Flask, request, jsonify
from flask_cors import CORS
import WorkingRAG1  # Import WorkingRAG1 script

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route("/api", methods=["POST"])  # Change the endpoint to '/api'
def api():
    data = request.json
    user_input = data.get('input')
    history = data.get('history', [])

    print(f"Received input: {user_input}")
    print(f"Received history: {history}")

    if user_input:
        try:
            response_generator = WorkingRAG1.predict(user_input, history, None)
            response = ""
            for partial_response in response_generator:
                response = partial_response
            print(f"Generated response: {response}")
        except Exception as e:
            print(f"Error while processing input: {e}")
            response = f"An error occurred while processing your request: {e}"
    else:
        response = "No input provided."

    print(f"Sending response: {response}")
    return jsonify({"response": response})

# Root route to check if the server is running
@app.route("/", methods=["GET"])
def home():
    return "Flask server is running!", 200

if __name__ == "__main__":
    app.run(debug=True)

from flask import Flask, request, jsonify
from flask_cors import CORS
import WorkingRAG1  # Import WorkingRAG1 script

app = Flask(__name__)
CORS(app)

# Assuming WorkingRAG1.py contains a function named `get_answer`
@app.route("/api", methods=["POST"])
def api():
    # Get the JSON data sent from the frontend
    data = request.json
    user_input = data.get('input')  # Extract the 'input' from the request

    # Log the received data for debugging
    print(f"Received input: {user_input}")

    if user_input:
        try:
            # Process the input using a function from WorkingRAG1.py
            response = WorkingRAG1.get_answer(user_input)  # Call the function in WorkingRAG1.py
        except Exception as e:
            # Log the error and set an error message
            print(f"Error while processing input: {e}")
            response = "An error occurred while processing your request."
    else:
        response = "No input provided."

    # Log the response for debugging
    print(f"Sending response: {response}")

    # Return the response as JSON
    return jsonify({"response": response})

# Root route to check if the server is running
@app.route("/", methods=["GET"])
def home():
    return "Flask server is running!", 200

if __name__ == "__main__":
    app.run(debug=True)

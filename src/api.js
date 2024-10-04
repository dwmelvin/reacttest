const response = await fetch("http://localhost:5000/api", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({ question: "" }),
});

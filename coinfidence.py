from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable frontend-backend communication

# Database setup
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///transactions.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Transaction Model
class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.String(10), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    description = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(50), nullable=False)

# Create the database
with app.app_context():
    db.create_all()

# API Route: Get all transactions
@app.route('/transactions', methods=['GET'])
def get_transactions():
    transactions = Transaction.query.all()
    return jsonify([
        {
            "id": t.id,
            "date": t.date,
            "amount": t.amount,
            "description": t.description,
            "category": t.category
        }
        for t in transactions
    ])

# API Route: Add a new transaction
@app.route('/add_transaction', methods=['POST'])
def add_transaction():
    data = request.json
    new_transaction = Transaction(
        date=data['date'],
        amount=data['amount'],
        description=data['description'],
        category=data['category']
    )
    db.session.add(new_transaction)
    db.session.commit()
    return jsonify({"message": "Transaction added successfully!"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

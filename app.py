from flask import Flask, request, jsonify, render_template, session
import random

app = Flask(__name__)
app.secret_key = 'supersecretkey'

MAX_LINES = 3
MAX_BET = 100
MIN_BET = 1

ROWS = 3
COLS = 3

symbol_count = {
    "A": 7,
    "B": 14,
    "C": 21,
    "D": 32
}

symbol_value = {
    "A": 15,
    "B": 12,
    "C": 9,
    "D": 6
}

def check_winnings(columns, lines, bet, values):
    winning_lines = []
    winnings = 0
    for line in range(lines):
        symbol = columns[0][line]
        for column in columns:
            symbol_to_check = column[line]
            if symbol != symbol_to_check:
                break
        else:
            winnings += values[symbol] * bet
            winning_lines.append(line + 1)
    return winnings, winning_lines

def get_slot_machine_spin(rows, cols, symbols):
    all_symbols = []
    for symbol, symbol_count in symbols.items():
        for _ in range(symbol_count):
            all_symbols.append(symbol)

    columns = []
    for _ in range(cols):
        column = []
        current_symbols = all_symbols[:]
        for _ in range(rows):
            value = random.choice(current_symbols)
            current_symbols.remove(value)
            column.append(value)

        columns.append(column)
    return columns

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/set_balance', methods=['POST'])
def set_balance():
    initial_balance = int(request.form['initial_balance'])
    session['balance'] = initial_balance
    return jsonify(balance=initial_balance)

@app.route('/spin', methods=['POST'])
def spin():
    if 'balance' not in session:
        return jsonify(error="Balance not set"), 400

    data = request.json
    lines = data['lines']
    bet = data['bet']
    total_bet = lines * bet

    balance = session['balance']
    if total_bet > balance:
        return jsonify(error="Insufficient balance"), 400

    slots = get_slot_machine_spin(ROWS, COLS, symbol_count)
    winnings, winning_lines = check_winnings(slots, lines, bet, symbol_value)
    net_gain = winnings - total_bet
    balance += net_gain
    session['balance'] = balance

    return jsonify(slots=slots, winnings=winnings, winning_lines=winning_lines, net_gain=net_gain, balance=balance)

@app.route('/final_balance', methods=['GET'])
def final_balance():
    if 'balance' not in session:
        return jsonify(balance=0)
    return jsonify(balance=session['balance'])

@app.route('/restart', methods=['POST'])
def restart():
    session.pop('balance', None)
    return jsonify(balance=0)

if __name__ == '__main__':
    app.run(debug=True)

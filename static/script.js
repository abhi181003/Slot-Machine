document.addEventListener("DOMContentLoaded", () => {
    const balanceForm = document.getElementById("balance-form");
    const initialBalanceInput = document.getElementById("initial-balance");
    const setBalanceButton = document.getElementById("set-balance-button");
    const gameDiv = document.getElementById("game");
    const balanceSpan = document.getElementById("balance");
    const linesInput = document.getElementById("lines");
    const betInput = document.getElementById("bet");
    const spinButton = document.getElementById("spin-button");
    const slotMachine = document.getElementById("slot-machine");
    const messageDiv = document.getElementById("message");
    const restartButton = document.getElementById("restart-button");
    const finalBalanceModal = document.getElementById("final-balance-modal");
    const finalBalanceSpan = document.getElementById("final-balance");
    const finalBalanceOkButton = document.getElementById("final-balance-ok-button");

    balanceForm.addEventListener("submit", event => {
        event.preventDefault();
        const formData = new FormData(balanceForm);
        fetch("/set_balance", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            balanceSpan.textContent = data.balance;
            gameDiv.style.display = "block";
            initialBalanceInput.disabled = true;
            setBalanceButton.disabled = true;
        });
    });

    spinButton.addEventListener("click", () => {
        const lines = parseInt(linesInput.value);
        const bet = parseInt(betInput.value);

        fetch("/spin", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ lines, bet })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                messageDiv.textContent = data.error;
                return;
            }

            const slots = data.slots;
            const winnings = data.winnings;
            const winningLines = data.winning_lines;
            const netGain = data.net_gain;

            slotMachine.innerHTML = '';
            for (let col of slots) {
                const colDiv = document.createElement("div");
                colDiv.className = "slot-column";
                for (let symbol of col) {
                    const symbolDiv = document.createElement("div");
                    symbolDiv.textContent = symbol;
                    colDiv.appendChild(symbolDiv);
                }
                slotMachine.appendChild(colDiv);
            }

            balanceSpan.textContent = data.balance;

            messageDiv.textContent = `You won $${winnings} on lines: ${winningLines.join(", ")}. Net gain: $${netGain}`;
        })
        .catch(error => {
            console.error("Error:", error);
        });
    });

    restartButton.addEventListener("click", () => {
        fetch("/final_balance")
        .then(response => response.json())
        .then(data => {
            finalBalanceSpan.textContent = data.balance;
            finalBalanceModal.style.display = "flex";
        });
    });

    finalBalanceOkButton.addEventListener("click", () => {
        finalBalanceModal.style.display = "none";
        fetch("/restart", { method: "POST" })
        .then(response => response.json())
        .then(data => {
            balanceSpan.textContent = data.balance;
            initialBalanceInput.disabled = false;
            setBalanceButton.disabled = false;
            gameDiv.style.display = "none";
            slotMachine.innerHTML = `
                <div class="slot-column"></div>
                <div class="slot-column"></div>
                <div class="slot-column"></div>
            `;
            messageDiv.textContent = '';
        });
    });
});

const symbols = ["X", "O"];
const size = 3;

//Permet de generer le tableau deroulant pour selectionner son symbole
function insertSymbolsChoices() {
    const select = document.getElementById("symbol-select");
    const titleTeam = document.getElementById("title-teams");
    titleTeam.textContent = "Choose your team, " + symbols[0] + " or " + symbols[1] + " ?";
    symbols.forEach((_, index) => {
        const option = document.createElement("option");
        option.value = symbols[index];
        option.textContent = symbols[index];
        select.appendChild(option);
    });
}
document.addEventListener("DOMContentLoaded", insertSymbolsChoices);


//Permet de creer la partie apres le 
function handlerFormSymbol(event) {
    event.preventDefault();
    const symbol = document.getElementById("symbol-select").value;
    document.getElementById("settings-game").setAttribute("hidden", "true");
    const game = new TicTacToe(symbol, size);
}






class TicTacToe {
    constructor(symbolPlayer, sizeBoard) {
        this.thereIsAWinner = false;
        this.isTurnOfPlayer = false;
        this.sizeBoard = sizeBoard;
        this.symbolPlayer = symbolPlayer;
        if (this.symbolPlayer == symbols[0]) {
            this.symbolBot = symbols[1];
        } else {
            this.symbolBot = symbols[0];
        }
        this.boardArray = new Array(sizeBoard * sizeBoard).fill(null);
        this.arrayCombiWin = this.createArrayCombiWinning();
        this.startGame();
    }

    //Retourne un tableau de tableaux des combinaisons gagnantes sur le plateau de jeu.
    createArrayCombiWinning() {
        let arrayCombi = [];

        //boucle combi verticales
        for (let i = 0; i < this.sizeBoard; i++) {
            let combiV = [];
            for (let j = 0; j < this.sizeBoard * this.sizeBoard; j += this.sizeBoard) {
                combiV.push(i + j);
            }
            arrayCombi.push(combiV);

        }

        //boucle combi horizontales
        for (let i = 0; i < this.sizeBoard * this.sizeBoard; i += this.sizeBoard) {
            let combiH = [];
            for (let j = 0; j < this.sizeBoard; j++) {
                combiH.push(i + j);
            }
            arrayCombi.push(combiH);
        }

        //diagonales HG->BD
        let combiDiagH = [];
        for (let i = 0; i < this.sizeBoard; i++) {
            combiDiagH.push(i * (this.sizeBoard + 1));
        }
        arrayCombi.push(combiDiagH);

        //diagonale BG->HD
        let combiDiagB = [];
        for (let i = 1; i <= this.sizeBoard; i++) {
            combiDiagB.push((i * this.sizeBoard) - i);
        }
        arrayCombi.push(combiDiagB);
        return arrayCombi;
    }

    //Permet de créer la tableau de jeu, de cacher les div de settings et donner la main au joueur ou au bot
    startGame() {
        document.getElementById("game").removeAttribute("hidden");
        const root = document.querySelector(":root");
        root.style.setProperty("--sizeTable", this.sizeBoard);
        const divGame = document.getElementById("divGame")
        const table = document.createElement("table");
        const tbody = document.createElement("tbody");
        let countCell = 0;
        for (let i = 0; i < this.sizeBoard; i++) {
            const row = document.createElement("tr");

            for (let j = 0; j < this.sizeBoard; j++) {
                const cell = document.createElement("td");
                const inCell = document.createElement("div");

                inCell.id = countCell;
                inCell.value = countCell;
                inCell.setAttribute("class", "content");
                inCell.addEventListener("click", this.movePlayer.bind(this));
                countCell++;
                cell.appendChild(inCell);
                row.appendChild(cell);
            }
            tbody.appendChild(row);

        }
        table.appendChild(tbody);
        table.setAttribute("border", 1);
        divGame.classList.add("table-container");
        divGame.appendChild(table);
        if (this.symbolPlayer == symbols[0]) {
            this.isTurnOfPlayer = true;
        } else {
            this.botPlay();
        }
    }


    //Permet au joueur de dessiner son symbol dans une case libre
    movePlayer(event) {
        if (this.isTurnOfPlayer == true) {
            this.isTurnOfPlayer = false;
            if (this.boardArray[event.target.id] == null) {
                event.target.textContent = this.symbolPlayer;
                this.boardArray[event.target.id] = this.symbolPlayer;
                this.checkWinner(this.symbolPlayer);
            }
            else {
                this.isTurnOfPlayer = true;
            }

        }
    }

    //Permet de faire jouer le bot en selectionnant une case vide aleatoirement.
    botPlay() {
        const mapElemIndexBoardArray = this.boardArray
            .map((value, index) => {
                if (value === null) {
                    return index;
                } else {
                    return null;
                }
            })
            .filter(index => index !== null);
        if (mapElemIndexBoardArray.length !== 0) {
            const randomPickedCellIndex = mapElemIndexBoardArray[Math.floor(Math.random() * mapElemIndexBoardArray.length)];
            const cell = document.getElementById(randomPickedCellIndex);
            cell.textContent = this.symbolBot;
            this.boardArray[randomPickedCellIndex] = this.symbolBot;
        }
        this.checkWinner(this.symbolBot);

    }

    //Verifie après chaque tour si il y a un gagnant parmis les combinaisons de victoire possible ou si egalite.
    checkWinner(lastPlayer) {
        if (this.boardArray.filter(value => value !== null).length >= (2 * this.sizeBoard - 1)) {
            this.arrayCombiWin.forEach((value) => {
                if (this.thereIsAWinner) return;
                const combi = value.map(index => this.boardArray[index]);
                if (combi.every(value => value == this.symbolBot) || combi.every(value => value == this.symbolPlayer)) {
                    this.thereIsAWinner = true;
                    this.endGame(this.boardArray[value[0]]);
                }
            });//check for a winner
        }
        if (!this.thereIsAWinner) { //check if it's a draw
            if (this.boardArray.filter(value => value == null).length == 0) {
                this.thereIsAWinner = true;
                this.endGame(null);
            }
            else { //Game not finish, continue to play. 
                if (lastPlayer == this.symbolPlayer) {
                    this.botPlay();

                } else {
                    this.isTurnOfPlayer = true;
                }
            }
        }

    }

    //Gere la fin de partie si un gagnant ou une egalite est donnee. Annonce le gagnant et les bouttons pour recommencer.
    endGame(winner) {
        const divEnd = document.getElementById("end-container");
        const announceWinner = document.createElement("p");
        announceWinner.id = "announce-winner";
        let message;
        if (winner == null) {
            message = "Draw ! Try again !";
        } else {
            message = winner + " wins the game ! ";
        }
        announceWinner.textContent = message;
        divEnd.appendChild(announceWinner);
        const btn_restart = document.createElement("button");
        btn_restart.id = "btn-restart";
        btn_restart.addEventListener("click", this.restartGame.bind(this));
        btn_restart.textContent = "Restart a game";
        divEnd.appendChild(btn_restart);
        const btn_settings = document.createElement("button");
        btn_settings.id = "btn-settings";
        btn_settings.addEventListener("click", this.goToSettings.bind(this));
        btn_settings.textContent = "Back to settings";
        divEnd.appendChild(btn_settings);
    }

    //Permet de relancer une nouvelle partie avec les memes parametres que la precedente.
    restartGame() {
        const divGame = document.getElementById("divGame");
        divGame.textContent = "";
        const divEnd = document.getElementById("end-container");
        divEnd.textContent = "";
        const game = new TicTacToe(this.symbolPlayer, this.sizeBoard);
    }

    //Permet de retourner au menu des parametres.
    goToSettings() {
        const game = document.getElementById("game");
        game.setAttribute("hidden", "true");
        const divGame = document.getElementById("divGame");
        divGame.textContent = "";
        const divEnd = document.getElementById("end-container");
        divEnd.textContent = "";
        document.getElementById("settings-game").removeAttribute("hidden");
    }

}
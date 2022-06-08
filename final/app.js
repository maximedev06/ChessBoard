
/*------------------ Variables ------------------*/

//get all the pieces of the chessboard
let pieces = document.querySelectorAll('.piece') 

//get all the coordonate of the chessboard
let allCoord = [0,1,2,3,4,5,6,7,10,11,12,13,14,15,16,17,20,21,22,23,24,25,26,27,30,31,32,33,34,35,36,37,40,41,42,43,44,45,46,47,50,51,52,53,54,55,56,57,60,61,62,63,64,65,66,67,70,71,72,73,74,75,76,77]

//to know if white or black should play (white == true, black == false)
let whoPlay = "white"  //not boolean because we can check directly .classList.contains(whoPlay) 

// Moovement of the pieces (pawn doesn't need it, and queen = bishop + rook)
let rookMovement = [1,10,-1,-10]
let bishopMovement = [9,11,-9,-11]
let knightMovement = [8,12,19,21,-8,-12,-19,-21]
let kingMovement = [1,9,10,11,-1,-9,-10,-11]

// The list of the différents boxs of the chessboard
let boxs = document.querySelectorAll('.box')

//The selected piece which will moove (unless if we decide to change it)
let pieceToMove = undefined//

//The variables below, the are used to manage a promoted pawn
let promotePawn = document.getElementById('promotePawn')
let promDialog = document.getElementById('promDialog')
let selectPiece = document.querySelector('input[name="test"]:checked')
let promoteChose = undefined
let confirmPromoteBtn = document.querySelector('#confirmPromoteBtn')
let boxPromote = undefined
/*------------------ Functions ------------------*/

/* See the available box for the pieces (rook,bishop,queen) 
        By adding à background color red of the boxes available for the selected piece    
*/
let colorBoxPossibleRBQ = function(coord,pieceMovement){
    for(let i = 0; i<pieceMovement.length;i++){
        let coordPossible = coord + pieceMovement[i]
        //console.log(coordPossible)
        while(allCoord.includes(coordPossible)){
            //console.log(coordPossible)     
            //obtain the next position possible of the piece
            let moovePossible = document.querySelector('#box'+coordPossible)
            let moovePossibleChild = moovePossible.children[0]
            // here we check if the box is empty, contain an ally or an ennemy piece
            if(moovePossibleChild === undefined){ //empty box
            }else if(moovePossibleChild.classList.contains(whoPlay)){ //ally piece
                break
            }else{  //ennemy piece
                moovePossible.classList.add('boxPossibleMove')
                break
            }
            moovePossible.classList.add('boxPossibleMove')
            coordPossible = coordPossible + pieceMovement[i] 
        }     
    }
}

/* See the available box for the pieces (knight, king) 
        By adding à background color red of the boxes available for the selected piece    
*/
let colorBoxPossibleKK = function(coord,pieceMovement){
    for(let i = 0; i<pieceMovement.length;i++){
        let coordPossible = coord + pieceMovement[i]
        let moovePossible = document.querySelector('#box'+coordPossible)
        
        //console.log(coordPossible)
        if(allCoord.includes(coordPossible)){
            let moovePossibleChild = moovePossible.children[0]
            if(moovePossibleChild === undefined || !moovePossibleChild.classList.contains(whoPlay)){
                 moovePossible.classList.add('boxPossibleMove')
            }
        }
    }
}

/* Here we will check if the king can do the castle (grand or small) 
* Possible if :
    - The king never mooved (already check if we go in this function)
    - The rook never mooved (done)
    - They is no pieces between the king and the rook
    - The king isn't in check, pass by a controlled box or ends in a check position
*/
let colorBoxPossibleCastle = function(coordK){
    let rooks = document.querySelectorAll('.rook.castle.'+whoPlay)  // the list of the rook(s) which have never mooved (and the good piece color btw)
    for(let i = 0; i<rooks.length;i++){
        let castlePossible = true //true if the rook if possible, false otherwise
        let boxR = rooks[i].parentNode
        let coordR = coordonatePiece(boxR)
        if(coordR < coordK){
            castlePossible = checkNoPieceBetwenKingRook(coordR,coordK,castlePossible)
            addClassListCastleKing(castlePossible,-1,coordK)
        } else {
            castlePossible = checkNoPieceBetwenKingRook(coordK,coordR,castlePossible)
            addClassListCastleKing(castlePossible,1,coordK)
        }
        //console.log(castlePossible)
    }
}

//function which add the classlists : .boxPossibleMove and .castleKing (on the box where the king will go if he want to castle)
let addClassListCastleKing = function(castlePossible,i,coord){
    if(castlePossible){
        coord = coord + i * 20
        document.querySelector('#box'+coord).classList.add('boxPossibleMove')
        document.querySelector('#box'+coord).classList.add('castleKing')
    }
}

// function which permite to check if they are piece(s) between the rook and the king
let checkNoPieceBetwenKingRook = function(coordMin,coordMax,castlePossible){
    coordMin += 10
    while(coordMin < coordMax && castlePossible === true){
        let boxTest = document.querySelector('#box'+coordMin)
        // here we check if the box is not empty, so we change the value of castlePossible at false
        if(boxTest.childElementCount == 1){ 
            //console.log("a piece is present between the rook and the king")
            castlePossible = false
        }
        coordMin += 10
    }
    
    return castlePossible
}

/* See the available box for the pawn 
        By adding à background color red of the boxes available for the selected piece    
*/
let colorBoxPossiblePawn = function(piece,coord){

    //This function will check if the pawn can moove from 1 boxes (val =1) or 2 boxes (val =2) in front of him
    let pawnMoveCacul = function(val){ 
        let coor = coord + val
        moovePossible = document.querySelector('#box'+coor)
        let moovePossibleChild = moovePossible.children[0]
        if(moovePossibleChild === undefined){
            moovePossible.classList.add('boxPossibleMove')
        } else {
            moove2boxes = false
        }        
    }
    //This function will check if the pawn can take an ennemy piece
    let pawnTakeEnnemyPiece = function(val){
        let coor = coord + val
        if(allCoord.includes(coor)){
            let takePiece = document.querySelector("#box"+coor)
            let takePieceChild = takePiece.children[0]
            if(takePieceChild !== undefined && !takePieceChild.classList.contains(whoPlay)){
                takePiece.classList.add('boxPossibleMove')
            }
        }
    }

    let moovePossible
    let moove2boxes = true 
    if(piece.classList.contains("white")){ //for white pawn
        pawnMoveCacul(1)
        if(coord%10 == 1 && moove2boxes === true){ //Here we check if the pawn can moove directly 2 boxs 
            pawnMoveCacul(2)
        }
        //now we will check if the pawn can take an ennemy piece (in diagonal)
        pawnTakeEnnemyPiece(11)
        pawnTakeEnnemyPiece(-9)

    } else { //for black pawn
        pawnMoveCacul(-1)
        if(coord%10 == 6 && moove2boxes === true){ //Here we check if the pawn can moove directly 2 boxs 
            pawnMoveCacul(-2)
        }
        //now we will check if the pawn can take an ennemy piece (in diagonal)
        pawnTakeEnnemyPiece(9)
        pawnTakeEnnemyPiece(-11)
    }
}

/* Function for delete the background color red of the boxs (the background color red 
corresponds to the available box of the prevoius selected pieces) */
let delColorBox = function(){
    if(document.querySelector('.boxPiece')){
        document.querySelector('.boxPiece').classList.remove('boxPiece')
    }
    if(document.querySelectorAll('.boxPossibleMove')){
        let removeColor = document.querySelectorAll('.boxPossibleMove')
        removeColor.forEach(function(remColor){
            remColor.classList.remove('boxPossibleMove')
        })
    }
    if(document.querySelector('.castleKing')){ //when the king can castle
        document.querySelector('.castleKing').classList.remove('castleKing')
    }
}

/* Function for realize the movement  the piece */
let mouvementPiece = function(box){
    box.appendChild(pieceToMove)
    delColorBox()
    if(whoPlay === "white"){
        whoPlay = "black"
    } else {
        whoPlay = "white"
    }
    if(pieceToMove.classList.contains('castle')){
        pieceToMove.classList.remove('castle')
    }
}

/* Function for realize the castle */
let makeCastle = function(coordActuelR,coordFinalR){
    let rook = document.querySelector('#box'+coordActuelR).children[0]
    let boxRookFinal = document.querySelector('#box'+coordFinalR)
    boxRookFinal.appendChild(rook)
}


// Obtain the coordonate in INT of the box
let coordonatePiece = function(boxP){
    return parseInt(boxP.id.replace('box',''),10)
}

/*------------------ AddEventListener ------------------*/

/* What happens when we click on a piece 
        - show the avalable possibles moovements BY ADDING the css style : .boxPossibleMove
        - show the selected piece BY ADDING the css style : .boxPiece
*/

pieces.forEach(function(piece){
    piece.addEventListener('click',function(e){
        //check if the piece corresponds to the person who has to play
        if(piece.classList.contains(whoPlay)){

            /* DELETE the colored boxes of the previous selected piece 
                by DELETING the CSS style : .boxPossibleMove and .boxPiece*/
            delColorBox()

            pieceToMove = this

            // recovers the coordonate of the selected piece
            let box = piece.parentNode
            let coord = coordonatePiece(box) /* parseInt(box.id.replace('box',''),10)  */
            
            //Color in red the available boxes for this piece
            box.classList.add('boxPiece')

            //here we will call the function with the coordinate of the piece and his movements
            if(piece.classList.contains('rook')){
                colorBoxPossibleRBQ(coord,rookMovement)
            } else if(piece.classList.contains('knight')){
                colorBoxPossibleKK(coord,knightMovement)
            } else if(piece.classList.contains('bishop')){
                colorBoxPossibleRBQ(coord,bishopMovement)
            } else if(piece.classList.contains('queen')){ // = bishop + rook movement
                colorBoxPossibleRBQ(coord,rookMovement)
                colorBoxPossibleRBQ(coord,bishopMovement)
            } else if(piece.classList.contains('king')){
                colorBoxPossibleKK(coord,kingMovement)
                if(piece.classList.contains('castle')){
                    colorBoxPossibleCastle(coord)
                }
            } else if(piece.classList.contains('pawn')){
                colorBoxPossiblePawn(piece,coord)
            }
        }
    })
})


//travel management of the piece

boxs.forEach(function(box){
    box.addEventListener('click',function(e){
        if(pieceToMove !== undefined && box.classList.contains('boxPossibleMove')){
            if(box.childElementCount === 1){
                box.children[0].remove()
            } 
            //the coordonate or the box that we choose
            let coord = parseInt(box.id.replace('box',''),10)
            

            //Here we check if we need to promote a pawn in (queen, rook, bishop, knight)
            if(pieceToMove.classList.contains("pawn") && coord%10 ===7 || pieceToMove.classList.contains("pawn") && coord%10 ===0){
                boxPromote = box
                promDialog.showModal()
                promoteChose = document.querySelector('input[name="promote"]:checked').value
            } 
            //Here we check if we are going to make castle
            else if(box.classList.contains("castleKing")){ 
                if(Math.trunc(coord/10) === 2){
                    makeCastle(coord - 20,coord + 10)  
                } else {
                    makeCastle(coord + 10,coord - 10)
                }
                mouvementPiece(this)
            } else { //Here we call the function in order to realize the mouvement of the piece
                mouvementPiece(this)
            }
        }   
    })
})

//here we will add an action Listener when we choose the promoted piece
confirmPromoteBtn.addEventListener('click',function(e){
    promoteChose = document.querySelector('input[name="promote"]:checked').value
    console.log(promoteChose)
    pieceToMove.classList.remove('pawn')
    pieceToMove.classList.add(promoteChose)
    pieceToMove.innerText = promoteChose
    mouvementPiece(boxPromote)
})







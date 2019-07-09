function setPosition(pX, pY, switchVar) {
    let chX = pX;
    let chY = pY;

    switch (switchVar) {

        case 0:
            chX = pX - 200;
            chY = pY;
            break;
        case 1:
            chX = pX - 200;
            chY -= 100;
            break;
        case 2:
            chX = pX - 50;
            chY = pY - 150;
            break;
        case 3:
            chX = pX + 100;
            chY = pY - 150;
            break;
        case 4:
            chX = pX + 200;
            chY = pY - 80;
            break;
        case 5:
            chX = pX + 250;
            chY = pY;
            break;
        case 6:
            chX = pX + 250;
            chY = pY + 100;
            break;
        case 7:
            chX = pX + 100;
            chY = pY + 150;
            break;
        case 8:
            chX = pX - 50;
            chY = pY + 150;
            break;
        case 9:
            chX = pX - 200;
            chY = pY + 150;
            break;
        default:
            chX = pX + 100;
            chY = pY + 100;
            break;
    }

    return [chX, chY];

}


function setPositionBig(pX, pY, switchVar) {
    let chX = pX;
    let chY = pY;

    switch (switchVar) {

        case 0:
            chX = pX - 200;
            chY = pY + 250;
            break;
        case 1:
            chX = pX - 200;
            chY = pY - 200;
            break;
        case 2:
            chX = pX - 150;
            chY = pY - 250;
            break;
        case 3:
            chX = pX + 100;
            chY = pY - 250;
            break;
        case 4:
            chX = pX + 350;
            chY = pY - 250;
            break;
        case 5:
            chX = pX + 350;
            chY = pY - 100;
            break;
        case 6:
            chX = pX + 250;
            chY = pY + 100;
            break;
        case 7:
            chX = pX + 50;
            chY = pY + 250;
            break;
        case 8:
            chX = pX - 200;
            chY = pY + 150;
            break;
        case 9:
            chX = pX - 200;
            chY = pY + 150;
            break;
        default:
            chX = pX + 100;
            chY = pY + 100;
            break;
    }

    return [chX, chY];
}

function setLDPosition(pX, pY, switchVar){
    let chX = pX;
    let chY = pY;
    console.log("switchVar ---" + switchVar);
    console.log("pX  " + pX + "  pY  " + pY);
    switch (switchVar) {

        case 0:
            chX = pX + 300;
            chY = pY + 300;
            break;
        case 1:
            chX = pX + 400;
            chY = pY + 50;
            break;
        case 2:
            chX = pX + 350;
            chY = pY - 200;
            break;
        case 3:
            chX = pX + 450;
            chY = pY + 300;
            break;
        case 4:
            chX = pX + 350;
            chY = pY - 250;
            break;
        case 5:
            chX = pX + 350;
            chY = pY - 100;
            break;
        case 6:
            chX = pX + 250;
            chY = pY + 100;
            break;
        case 7:
            chX = pX + 100;
            chY = pY + 150;
            break;
        case 8:
            chX = pX - 200;
            chY = pY + 150;
            break;
        case 9:
            chX = pX - 200;
            chY = pY + 150;
            break;
        default:
            chX = pX + 100;
            chY = pY + 100;
            break;
    }

    return [chX, chY];

}
function setLDPositionBig(pX, pY, switchVar) {
    let chX = pX;
    let chY = pY;
    console.log("switchVar ---" + switchVar);
    console.log("pX  " + pX + "  pY  " + pY);
    switch (switchVar) {
        case 0:
            chX = pX - 200;
            chY = pY;
            break;
        case 1:
            chX = pX - 200;
            chY = pY - 200;
            break;
        case 2:
            chX = pX - 50;
            chY = pY + 300;
            break;
        case 3:
            chX = pX + 100;
            chY = pY - 250;
            break;
        case 4:
            chX = pX + 350;
            chY = pY - 250;
            break;
        case 5:
            chX = pX + 350;
            chY = pY - 100;
            break;
        case 6:
            chX = pX + 250;
            chY = pY + 100;
            break;
        case 7:
            chX = pX + 200;
            chY = pY + 400;
            break;
        case 8:
            chX = pX - 200;
            chY = pY + 150;
            break;
        case 9:
            chX = pX - 200;
            chY = pY + 150;
            break;
        default:
            chX = pX + 100;
            chY = pY + 100;
            break;
    }

    return [chX, chY];
}


function setPositionVars(pX, pY, j) {
    let chX = pX;
    let chY = pY;
    if (j === 0){
        chX = 0;
        chY = pY;
    }
    else if (j%6 === 0){
        chX = 0;
        chY = chY + 100;
    }else {
        chX = chX + 250;
        chY = pY;
    }
    return [chX, chY];
}

function setPositionPBig(pX, pY, j) {
    let chX = pX;
    let chY = pY;
    switch (j) {
        case 0:
        case 1:
        case 2:
        case 3:
            chX = pX - 250;
            chY = pY + (j * 100);
            break;
        case 4:
            chX = pX - 250;
            chY = pY - (j * 50);
            break;
        case 5:
            chX = pX;
            chY = pY - (j * 50);
            break;
        case 6:
            chX = pX + 200;
            chY = pY - 200;
            break;
        case 7:
            chX = pX + 400;
            chY = pY;
            break;
        case 8:
            chX = pX + 400;
            chY = pY + 200;
            break;
        case 9:
            chX = pX + 300;
            chY = pY + 300;
            break;
        case 10:
            chX = pX + 400;
            chY = pY + 400;
            break;

    }

    return [chX, chY];
}


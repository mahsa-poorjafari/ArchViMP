
function createLine(x1,y1,x2,y2,lineId) {
    let distance = Math.sqrt(((x1-x2)*(x1-x2))+((y1-y2)*(y1-y2)));
    console.log(distance);
    let xMid = (x1+x2)/2;
    console.log('left'+xMid);
    let yMid = (y1+y2)/2;
    console.log('top'+yMid);
    let radian = Math.atan2(y1-y2, x1-x2);
    let degree = (radian*180)/Math.PI;
    let line = document.getElementById(lineId);
    line.style.width= distance.toString()+"px";
    line.style.top = yMid.toString()+"px";
    line.style.left = (xMid - (distance/2)).toString()+"px";
    line.style.transform = "rotate("+degree+"deg)";
}


function nodeStyle(graph, nodeId) {
    let style = new Object();
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_IMAGE;
    style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
    style[mxConstants.STYLE_WHITE_SPACE] = 'wrap';
    style[mxConstants.STYLE_FONTCOLOR] = '#000000';
    style[mxConstants.STYLE_STROKECOLOR] = '#000000';
    style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
    style[mxConstants.STYLE_IMAGE] = '/static/media/Notations/'+ nodeId + '.png';
    graph.getStylesheet().putCellStyle(nodeId, style);
};



function configEdgeStyle(graph,edgeColor) {
    let eStyle = graph.getStylesheet().getDefaultEdgeStyle();
    eStyle['strokeColor'] = edgeColor;
    eStyle['fontColor'] = '#000000';
    eStyle['fontStyle'] = '0';
    eStyle['fontStyle'] = '0';
    eStyle['startSize'] = '8';
    eStyle['endSize'] = '20';
    eStyle['verticalAlign'] = 'top';
}

function setNodeSize(nodeText, nodeIdStyle){
    let nodeStyle = {}; // New object
    let nodeIdText = null;
    let Width = null;
    let Height = null;
    if (nodeText.length > 20){
        nodeIdText = nodeIdStyle + '_big';
        Width = 235 ;
        Height = 125;
    }else {
        nodeIdText = nodeIdStyle;
        Width = 120 ;
        Height = 70;
    }
    nodeStyle['nodeIdText'] = nodeIdText;
    nodeStyle['Width'] = Width;
    nodeStyle['Height'] = Height;

    return nodeStyle;
}

function drawChild(graph, parent, pNode, childList, endArrowShape, endArrowFill ){
    let nodeSize = {};
    let pX = pNode['geometry']['x'];
    let pY = pNode['geometry']['y'];
    let chX = pX;
    let chY = pY;
    for (let j = 0; j < childList.length; j++) {
        let Text = childList[j].innerHTML;
        nodeSize = {};
        nodeSize = setNodeSize(Text, 'variable' );
        let nodeId = 'var_' + j;
        nodeStyle(graph, nodeSize['nodeIdText']);
        switch (j) {
            case 0:
                chX = pX - 200;
                chY = pY;
                break;
            case 1:
                chY -= 100;
                break;
            case 2:
                chX = pX - 50;
                chY = pY - 150;
                break;
            case 3:
                chX = pX + 100;
                break;
            case 4:
                chX = pX + 250;
                chY = pY - 100;
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
        let chNode = graph.insertVertex(parent, nodeId, Text, chX, chY, nodeSize['Width'], nodeSize['Height'], nodeSize['nodeIdText']);
        graph.insertEdge(parent, null, null, chNode, pNode, 'dashed=0;endArrow='+endArrowShape+';sourcePerimeterSpacing=0;startFill=0;endFill='+endArrowFill+';');

    }

}

let activeLi = document.getElementsByClassName("action_list");

activeLi.onmouseover = function(){
    activeLi.classList.remove("hovered");
    this.classList.add("hovered");
};
let nodeList = [];
let edgeList = [];

let structList = document.getElementsByClassName('shared_struct');
// console.log(structList);
for (let i = 0; i < structList.length; i++) {
    let vars = structList[i].children;
    for (let j=0;j < vars.length; j++){
        console.log(vars[j]);

        let structName = vars[j].innerHTML;
        let structId = structName + "_child";
        let structChildList = document.getElementById(structId).getElementsByTagName("lo");
        console.log(structChildList);
        let xp = 200;
        let yp = 175;
        let sP = {data: {id: structName, type: 'round-rectangle'}, position: { x: xp+100, y: yp+200 } };
        nodeList.push(sP);
        for (let k = 0; k < structChildList.length; k++) {
          let strcutChild = structChildList[k].innerHTML;
          let sCh = {data: {id: strcutChild, type: 'ellipse'}};
          nodeList.push(sCh);
          let edgeId = 'ch'+k+'_p'+j ;
          let e = {data: {id: edgeId, source: strcutChild, target: structName}};
          edgeList.push(e);
        }
    }
}


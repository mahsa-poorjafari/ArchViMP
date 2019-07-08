
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
    style[mxConstants.STYLE_IMAGE] = '/static/media/Notations/'+ nodeId + '.png';
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_IMAGE;
    style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
    style[mxConstants.STYLE_WHITE_SPACE] = 'wrap';
    style[mxConstants.STYLE_FONTCOLOR] = '#000000';
    style[mxConstants.FONT_BOLD] = 1;
    style[mxConstants.STYLE_FONTSTYLE] = mxConstants.FONT_BOLD;
    style[mxConstants.STYLE_FONTSIZE] = 12;
    style[mxConstants.STYLE_STROKECOLOR] = '#000000';
    style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
    console.table(style);
    graph.getStylesheet().putCellStyle(nodeId, style);
}



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
        if(nodeIdStyle.search(/_R/)){
            Width = 300 ;
            Height = 150;
        }else{
            Width = 235 ;
            Height = 125;
        }
    }else if (nodeIdStyle === 'LogicalComp' || nodeIdStyle.search(/_R/)){
        nodeIdText = nodeIdStyle;
        Width = 150 ;
        Height = 100;
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

function drawChildLD(graph, parent, pNode, element, endArrowShape, endArrowFill, nthChild){

    let pX = 1000;
    let pY = 200;

    // console.log(targetName);
    if (pNode !== null){
        pX = pNode['geometry']['x'];
        pY = pNode['geometry']['y'];
    }
    let Text = element.innerHTML;
    // console.log("count " + count);
    let values = [];
    if (Text.length > 20){

        values = setLDPositionBig(pX, pY, nthChild);
    }else{
        values = setLDPosition(pX, pY, nthChild);
    }
    let chX = values[0];
    let chY = values[1];

    let nodeSize = setNodeSize(Text, 'logicalData');
    nodeStyle(graph, nodeSize['nodeIdText']);
    let chNode = graph.insertVertex(parent, Text, Text, chX, chY, nodeSize['Width'], nodeSize['Height'], nodeSize['nodeIdText']);
    chNode.target = pNode;
    graph.insertEdge(parent, null, null, chNode, pNode, 'dashed=0;endArrow=' + endArrowShape + ';sourcePerimeterSpacing=0;startFill=0;endFill=' + endArrowFill + ';');


}

function drawLcForLd(graph, parent, ldNode, childList) {
    let nodeSize = {};
    let chX = 600;
    let chY = 50;
    for (let j=0; j< childList.length; j++){
        let nodeId = 'LD_L2' + j;
        let Text = childList[j].innerHTML;
        nodeSize = setNodeSize(Text, 'LogicalComp');
        nodeStyle(graph, 'LogicalComp');
        let lcNode = graph.insertVertex(parent, nodeId, Text, chX, chY, nodeSize['Width'], nodeSize['Height'], nodeSize['nodeIdText']);
        lcNode.source = ldNode;
        graph.insertEdge(parent, null, null, ldNode, lcNode , 'dashed=0;endArrow=classic;sourcePerimeterSpacing=0;startFill=0;endFill=1;');
        chY += 200;
    }
}

function drawChildThrOP(graph, parent, pNode, childList){
    let nodeSize = {};
    let pX = 50;
    let pY = 50;
    let chX = pX;
    let chY = pY;
    if (pNode !== null){
        pX = pNode['geometry']['x'];
        pY = pNode['geometry']['y'];
    }else{
        chX = pX;
        chY = pY;
    }
    chX = pX - 500;
    chY = pY;

    let nodes = {};
    let lastLCY = null;
    let mxCell = graph.getChildVertices(graph.getDefaultParent());
    mxCell.forEach(function(node) {
        if (node['style'] !== 'LogicalComp') {
            let dKey = node['value'];
            let dValue = node;
            nodes[dKey] = dValue;
        }else{
            lastLCY = node['geometry']['y'];
        }
    });


    for (let j=0; j< childList.length; j++){
        let nodeId = 'thr_in_' + j;
        let Text = childList[j].firstElementChild.innerHTML;

        let elementType = childList[j].getElementsByClassName('list_level2')[0].getElementsByTagName('li')[3].innerHTML;

        elementType = elementType.replace(/ /g,'') + "_R";

        nodeSize = setNodeSize(Text, elementType );
        let nodValues = Object.keys(nodes);
        nodeStyle(graph, nodeSize['nodeIdText']);
        let chNode = null;

        if (chY >= 2000){
            chX = pX + 400;
            chY = pY;
        }else{
            chY += 200;
        }

        if( nodeSize['nodeIdText'] === 'variable'){
            chX += 50;
        }else if ( nodeSize['nodeIdText'] === 'logicalData'){
            chX += 200;
        }

        if ( !nodValues.includes(Text)){
            chNode = graph.insertVertex(parent, nodeId, Text, chX, chY, nodeSize['Width'], nodeSize['Height'], nodeSize['nodeIdText']);
            chNode.target = pNode;
        }else{
            chNode = nodes[Text];
        }
        graph.insertEdge(parent, null, null, chNode, pNode, 'dashed=0;endArrow=classic;sourcePerimeterSpacing=0;startFill=0;endFill=1;');


    }

}

function drawChild(graph, parent, pNode, childList, endArrowShape, endArrowFill, nodeIdStyle ){
    let nodeSize = {};
    let pX = 50;
    let pY = 2000;
    let chX = null;
    let chY = null;
    if (pNode !== null){
        pX = pNode['geometry']['x'];
        pY = pNode['geometry']['y'];
    }else{
        chX = pX;
        chY = pY;
    }
    // let chX = pX;
    // let chY = pY;
    for (let j = 0; j < childList.length; j++) {
        let Text = childList[j].innerHTML;
        nodeSize = {};

        nodeSize = setNodeSize(Text, nodeIdStyle );
        // console.log(nodeSize['nodeIdText']);
        let nodeId = 'var_' + j;
        nodeStyle(graph, nodeSize['nodeIdText']);
        let values = [];
        if (pNode !== null){
            if (Text.length > 20){
                values = setPositionBig(pX, pY, j);
            }else{
                values = setPosition(pX, pY, j);
            }
            chX = values[0];
            chY = values[1];
        }else{
            values = setPositionVars(chX, chY, j);
            chX = values[0];
            chY = values[1];
        }
        let chNode = graph.insertVertex(parent, nodeId, Text, chX, chY, nodeSize['Width'], nodeSize['Height'], nodeSize['nodeIdText']);
        chNode.target = pNode;
        graph.insertEdge(parent, null, null, chNode, pNode, 'dashed=0;endArrow=' + endArrowShape + ';sourcePerimeterSpacing=0;startFill=0;endFill=' + endArrowFill + ';');

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



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
    mxGraph.prototype.cellsEditable = false;
    if(nodeId === "LogicalCompInactive"){
        style[mxConstants.HIGHLIGHT_OPACITY] = 50;
    }
    style[mxConstants.STYLE_IMAGE] = '/static/media/Notations/'+ nodeId + '.png';
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_IMAGE;
    style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
    style[mxConstants.STYLE_WHITE_SPACE] = 'wrap';
    style[mxConstants.STYLE_FONTCOLOR] = '#000000';
    style[mxConstants.VERTEX_SELECTION_COLOR] = '#337ab7';
    style[mxConstants.VERTEX_SELECTION_DASHED] = false;
    style[mxConstants.STYLE_STROKECOLOR] = '#000000';
    style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;

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

function drawLcForLd(graph, parent, ldNode, childList, logicalCompY, op, ulrParam) {
    let nodeSize = {};
    let chX = 600;
    let chY = logicalCompY;
    for (let j=0; j< childList.length; j++){
        let nodeId = 'LD_L2' + op + '_' + j;
        let Text = childList[j].innerHTML;
        nodeSize = setNodeSize(Text, 'LogicalComp');
        nodeStyle(graph, 'LogicalComp');
        // console.log("============== " + Text+ " - " + chY + "   j= ", j);
        let lcNode = graph.insertVertex(parent, nodeId, Text, chX, chY, nodeSize['Width'], nodeSize['Height'], nodeSize['nodeIdText']);
        lcNode.source = ldNode;
        // console.table(lcNode);
        graph.addListener(mxEvent.DOUBLE_CLICK, function(sender, evt){
            let cell = evt.getProperty('cell');
            if (cell['style'] === "LogicalComp" || cell['style'] === "LogicalComp_big"){
                window.location = "http://127.0.0.1:8000/logical_comp?b=" + ulrParam[0] + (ulrParam[1] ? "&FileName="+ulrParam[1] : "");
            }
            evt.consume();
        });
        graph.insertEdge(parent, null, null, ldNode, lcNode , 'dashed=0;endArrow=classic;sourcePerimeterSpacing=0;startFill=0;endFill=1;');
        chY += 200;

    }
}

function drawChildThrOP(graph, parent, pNode, childList){
    let nodeSize = {};
    let pX = 50;
    let pY = 50;
    let chX = null;
    let chY = null;
    if (pNode !== null){
        pX = pNode['geometry']['x'];
        pY = pNode['geometry']['y'];
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
        let Text = childList[j].getElementsByClassName('key')[0].innerHTML;

        let elementType = childList[j].getElementsByClassName('value')[0].innerHTML;

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

function drawChild(graph, parent, pNode, childList, endArrowShape, endArrowFill, nodeIdStyle){
    let nodeSize = {};
    let pX = 50;
    let pY = 50;
    let chX = null;
    let chY = null;
    if (pNode !== null) {
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
        // console.log(vars[j]);

        let structName = vars[j].innerHTML;
        let structId = structName + "_child";
        let structChildList = document.getElementById(structId).getElementsByTagName("lo");
        // console.log(structChildList);
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

function get_url_benchmark() {
    let url_string = window.location.href;
    let url = new URL(url_string);
    let benchmarkName = url.searchParams.get("b");
    return benchmarkName

}
function get_url_fileName() {
    let url_string = window.location.href;
    let url = new URL(url_string);
    let FileName = url.searchParams.get("FileName");
    return FileName
}

function get_lc_name() {
    let url_string = window.location.href;
    let url = new URL(url_string);
    let lcName = url.searchParams.get("lc");
    return lcName
}

function drawTdForLd(graph, parent, pNode, childList, op, ulrParam) {
    let nodeSize = {};
    let pX = 50;
    let pY = 2000;
    let chX = null;
    let chY = null;
    let bX = null;
    let bY = null;
    let mxCell = null;
    let Text = "";
    let nodeType = "";
    let gName = "";
    if (pNode !== null){
        pX = pNode['geometry']['x'];
        pY = pNode['geometry']['y'];
    }else{
        chX = pX;
        chY = pY;
    }
    let pNodeText = pNode['value'];
    for (let j = 0; j < childList.length; j++) {

        let Text = childList[j].getElementsByClassName('key')[0].innerHTML;

        // grouping the child if their are more than 10
        //let eText = childList[j].getElementsByClassName('key')[0].innerHTML;
        // if (eText === "group_over10_var" || eText === "group_over10_ld"){
        //     // let valJson = JSON.parse(childList[j].getElementsByClassName('value')[0].innerHTML);
        //     let elemtVal = String(childList[j].getElementsByClassName('value')[0].innerHTML);
        //     let toJson = elemtVal.replace(/'/g, '"');
        //     let valJson = JSON.parse(toJson);
        //     let keys = Object.keys(valJson);
        //     keys.forEach(function (k) {
        //         if (k !== "child_list") gName = k;
        //     });
        //     Text = gName;
        //     nodeType = valJson[String(gName)];
        // }else{
            //Text = eText;
            // nodeType = childList[j].getElementsByClassName('value')[0].innerHTML;
        //}
        nodeType = childList[j].getElementsByClassName('value')[0].innerHTML;
        let nodeIdStyle = nodeType.replace(/ /g,'');
        nodeSize = setNodeSize(Text, nodeIdStyle);

        let nodeId = 'var_'+ op +'_' + j;
        nodeStyle(graph,  nodeSize['nodeIdText']);
        let values = [];

        // set the right position based on the previous node
        mxCell =  graph.getChildVertices(graph.getDefaultParent());

        let graph_child_num = mxCell.length;
        if (graph_child_num === 1){
            // means it is the first child
            if (Text.length > 20) {
                values[0] = pX;
                values[1] = pY - 200;
            } else {
                values[0] = pX + 50;
                values[1] = pY - 300;
            }

        }else{

            let indx = graph_child_num-1;
            let PreviousNodeVal = mxCell[indx]['value'];
            bX = (PreviousNodeVal.length > 20) ? mxCell[indx]['geometry']['x'] + 50: mxCell[indx]['geometry']['x'];
            bY = (PreviousNodeVal.length > 20) ? mxCell[indx]['geometry']['y'] + 100 : mxCell[indx]['geometry']['y'];

            if (Text.length > 20) {
                values = setPositionLDL2Big(bX, bY, indx);
            }else {
                values = setPositionLDL2(bX, bY, indx);
            }
        }
        chX = values[0];
        chY = values[1];

        // console.log(Text + " => " + chX +" - "+ chY + " " + j);
        if (Text !== ""){
            let chNode = graph.insertVertex(parent, nodeId, Text, chX, chY, nodeSize['Width'], nodeSize['Height'],  nodeSize['nodeIdText']);
            chNode.target = pNode;
            graph.addListener(mxEvent.DOUBLE_CLICK, function(sender, evt){
                    let cell = evt.getProperty('cell');
                    if (cell['style'] === "logicalData" || cell['style'] === "logicalData_big"){
                        window.location = "http://127.0.0.1:8000/Logical_Data_L1?b=" + ulrParam[0] + (ulrParam[1] ? "&FileName="+ulrParam[1] : "");
                    }
                    evt.consume();
                });
            graph.insertEdge(parent, null, null, chNode, pNode, 'dashed=0;endArrow=diamondThin;sourcePerimeterSpacing=0;startFill=0;endFill=1;');
        }

    }
}

function scrollToTop(scrollDuration) {
    var scrollStep = -window.scrollY / (scrollDuration / 15),
        scrollInterval = setInterval(function(){
        if ( window.scrollY !== 0 ) {
            window.scrollBy( 0, scrollStep );
        }
        else clearInterval(scrollInterval);
    },15);
}

function connect_to_related_LC(graph, parent, inputGroup, X, Y, op) {
    let nodeSize = {};
    // get the existing element in the Graph
    let mxCells = graph.getChildVertices(graph.getDefaultParent());
    console.table(mxCells);
    for (let inputNode of inputGroup){
        let inG = inputNode.firstElementChild.innerHTML;
        nodeSize = setNodeSize(inG, 'logicalData');
        nodeStyle(graph,  nodeSize['nodeIdText']);
        let ldInNode = graph.insertVertex(parent, null, inG, X, Y, nodeSize['Width'], nodeSize['Height'], nodeSize['nodeIdText']);
        Y += 300;
        let ldInLc = inputNode.getElementsByClassName("list_level1")[0].getElementsByClassName("logical_components")[0].getElementsByClassName("list_level2")[0].getElementsByClassName("li-list_level2");
        let ldLcList = [];
        for (let lc of ldInLc){
            ldLcList.push(lc.innerHTML.replace(/ /g,''));
        }
        console.log(ldLcList);
        // connect_to_related_LC(mxCells, ldLcList, graph, ldInNode);
        for (let node of mxCells){
            // console.log(node['value']);
            // console.log(ldLcList.includes(node['value']));
            if(node['style'] === "LogicalComp" && ldLcList.includes(node['value'])){
                switch (op) {
                    case "Input":
                        graph.insertEdge(parent, null, null, ldInNode, node, 'dashed=0;endArrow=classic;sourcePerimeterSpacing=0;startFill=0;endFill=1;');
                        break;
                    case "Process":
                        graph.insertEdge(parent, null, null, node, ldInNode, 'dashed=0;endArrow=classic;startArrow=classic;sourcePerimeterSpacing=0;startFill=1;endFill=1;');
                        break;
                    case "Output":
                        graph.insertEdge(parent, null, null, node, ldInNode, 'dashed=0;endArrow=classic;sourcePerimeterSpacing=0;startFill=0;endFill=1;');
                        break;
                }


            }

        }
    }


}
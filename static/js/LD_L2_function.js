document.addEventListener('DOMContentLoaded', function() {
    if (!mxClient.isBrowserSupported()) {
        // Displays an error message if the browser is not supported.
        mxUtils.error('Browser is not supported!', 200, false);
    }
    document.getElementById('tab03').style.display = 'block';
    let ldL2GraphContainer = document.getElementById('logical_data_l2_function_diagram');
    let ldL1GraphContainer = document.getElementById('logical_data_l1_function_diagram');
    let circularGraphContainer = document.getElementById('function_circular_diagram');

    let ldName = get_node_name();
    let benchmarkName = get_url_benchmark();
    let fileName = get_url_fileName();
    let ulrParam = [benchmarkName];
    ulrParam.push((benchmarkName === "UPLOADED" && fileName) ? fileName : null);
    logicalDataL2Function(ldL2GraphContainer, ulrParam, ldName);
    logicalDataL1Function(ldL1GraphContainer, ulrParam, ldName);
    circularLogicalDataFunction(circularGraphContainer, ulrParam, ldName);
});
function logicalDataL2Function(container, ulrParam, ldName) {
    // Disables the built-in context menu
    mxEvent.disableContextMenu(container);
    // Creates the graph inside the given container
    var graph = new mxGraph(container);
    //graph.setEnabled(false);
    // graph.getStylesheet().getDefaultEdgeStyle();
    // Enables rubberband selection
    new mxRubberband(graph);
    var parent = graph.getDefaultParent();
    graph.keepEdgesInBackground = true;
    // Adds cells to the model in a single step
    graph.getModel().beginUpdate();
    configEdgeStyle(graph, "#000000");
    try {
        let lcX = 700;
        let lcY = 200;
        let funX = 50;
        let funY = 100;
        let styleIdNode = null;
        let strokeColor = null;
        let nodeSize = {};
        let functionContainer = document.getElementById('function_circular_textual').getElementsByClassName('li-list_level0');
        for (let elm of functionContainer) {
            let fun_name = elm.getElementsByClassName('func_name')[0].innerHTML;
            if (ldName !== null && ldName !== fun_name) {
                styleIdNode = "LogicalDataInactive";
                strokeColor = "strokeColor=#ccc;";
            } else {
                styleIdNode = "logicalData";
                strokeColor = "strokeColor=#000000;";
            }
            nodeStyle(graph, styleIdNode);
            nodeSize = setNodeSize(fun_name, styleIdNode );
            let funNode = graph.insertVertex(parent, null, fun_name, funX, funY, nodeSize['Width'], nodeSize['Height'], nodeSize['nodeIdText']);
            funY += 200;
        }
    }finally{
        // Updates the display
        graph.getModel().endUpdate();
    }
}
function logicalDataL1Function(container, ulrParam, ldName) {
    // Disables the built-in context menu
    mxEvent.disableContextMenu(container);
    // Creates the graph inside the given container
    var graph = new mxGraph(container);
    //graph.setEnabled(false);
    // graph.getStylesheet().getDefaultEdgeStyle();
    // Enables rubberband selection
    new mxRubberband(graph);
    var parent = graph.getDefaultParent();
    graph.keepEdgesInBackground = true;
    // Adds cells to the model in a single step
    graph.getModel().beginUpdate();
    configEdgeStyle(graph, "#000000");
    try {
        let varX = 50;
        let varY = 100;
        let funX = 700;
        let funY = 100;
        let styleIdNode = null;
        let strokeColor = null;
        let nodeSize = {};
        let variableContainer = document.getElementById('all_var_accessed');
        let variableList = variableContainer.getElementsByClassName("li-list_level1");
        for (let vElement of variableList){
            let elementText = vElement.innerHTML;
            let varText = elementText.includes(".")? elementText.split(".")[0] : elementText;
            let varType = elementText.includes(".")? "logicalData" : "variable";
            nodeStyle(graph, varType);
            // console.log(varText);
            nodeSize = setNodeSize(varText, varType );
            // console.table(nodeSize);
            graph.insertVertex(parent, null, varText, varX, varY, nodeSize['Width'], nodeSize['Height'], nodeSize['nodeIdText']);
            varY += 200;
        }
        let mxCells = graph.getChildVertices(graph.getDefaultParent());
        let functionContainer = document.getElementById('function_circular_textual').getElementsByClassName('li-list_level0');

        let fun_name = null;
        for (let elm of functionContainer){
            fun_name = elm.getElementsByClassName('func_name')[0].innerHTML;
            let funVarElements = elm.getElementsByClassName('list_level1')[0].getElementsByClassName('li-list_level1');
            let funVarList = [];
            for (let varName of funVarElements){
                let varNameTyped = varName.firstElementChild.innerHTML.replace(/ /g,'');
                funVarList.push(varNameTyped.includes('.')? varNameTyped.split(".")[0]: varNameTyped);
            }
            if (ldName !== null && ldName !== fun_name) {
                styleIdNode = "LogicalDataInactive";
                strokeColor = "strokeColor=#ccc;";
            } else {
                styleIdNode = "logicalData";
                strokeColor = "strokeColor=#000000;";
            }
            nodeStyle(graph, styleIdNode);
            nodeSize = setNodeSize(fun_name, styleIdNode );
            let funNode = graph.insertVertex(parent, null, fun_name, funX, funY, nodeSize['Width'], nodeSize['Height'], nodeSize['nodeIdText']);
            funY += 200;
            mxCells.forEach(function (node){
                if(funVarList.includes(node['value'])){
                    graph.insertEdge(parent, null, null, node, funNode, 'dashed=0;endArrow=diamondThin;sourcePerimeterSpacing=0;endFill=1;'+ strokeColor);
                    node.source = funNode;
                    funNode.source = node;
                }
            });
        }
    }finally{
        // Updates the display
        graph.getModel().endUpdate();
    }
}

function circularLogicalDataFunction(container, ulrParam, ldName) {
    if (!mxClient.isBrowserSupported()) {
        // Displays an error message if the browser is not supported.
        mxUtils.error('Browser is not supported!', 200, false);
    } else {
        // Disables the built-in context menu
        mxEvent.disableContextMenu(container);

        // Creates the graph inside the given container
        var graph = new mxGraph(container);
        //graph.setEnabled(false);
        // graph.getStylesheet().getDefaultEdgeStyle();
        // Enables rubberband selection
        new mxRubberband(graph);
        var parent = graph.getDefaultParent();
        graph.keepEdgesInBackground = true;
        // Adds cells to the model in a single step
        graph.getModel().beginUpdate();
        configEdgeStyle(graph, "#000000");
        try {
            let stX = null;
            let stY = null;
            let styleIdNode = null;
            let nodeSize = {};
            let strokeColor = null;
            let ldL2List = document.getElementById("function_circular_textual").getElementsByClassName("li-list_level0");
            for (let i=0; i < ldL2List.length; i++){
                let ldtext = ldL2List[i].firstElementChild.innerHTML.replace(/ /g,'');
                let varList = ldL2List[i].getElementsByClassName("list_level1")[0].getElementsByClassName("li-list_level1");
                let stId = 'ldL2_' + i;
                if (ldName !== null && ldName !== ldtext){
                    styleIdNode = "LogicalDataInactive";
                    strokeColor = "#ccc";
                }else{
                    styleIdNode = "logicalData";
                    strokeColor = "#000000";
                }
                // console.table([thrFunc, lcName, styleIdNode]);
                nodeStyle(graph, styleIdNode);
                nodeSize = setNodeSize(ldtext, styleIdNode );
                if (i === 0){
                        stX = 200;
                        stY = 300;
                }else if (i%2 === 0) {
                    stX = 200;
                    stY += 500;
                }else if (i !== 0 && varList.length <= 4){
                    stX += 600;
                }else{
                    stY += 400;
                    stX = 200;
                }
                let stNode = graph.insertVertex(parent, stId, ldtext, stX, stY, nodeSize['Width'], nodeSize['Height'], nodeSize['nodeIdText']);
                // console.log("___________  " + ldtext);
                drawTdForLd(graph, parent, stNode, varList, null, ulrParam, strokeColor);
                // drawChild(graph, parent, stNode, varList, 'diamondThin', '1', 0, 'variable');
            }

        }finally{
            // Updates the display
            graph.getModel().endUpdate();

        }
    }
    
}
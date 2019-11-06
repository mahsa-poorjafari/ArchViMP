document.addEventListener('DOMContentLoaded', function() {

    let graphContainerL2 = document.getElementById('logical_data_l2_decision_diagram');
    let graphContainerL1 = document.getElementById('logical_data_l1_decision_diagram');
    let ldL2List = document.getElementById("logical_data_l2_decision_textual").getElementsByClassName("list_level0")[0].getElementsByClassName("li-list_level0");
    let clientWidth = document.getElementById('content').clientWidth;
    let ldName = get_node_name();
    if (ldName !== null){
        ldName = ldName.split('START')[0] + '\nSTART' + ldName.split('START')[1];
        console.log(ldName);
        document.getElementById('tab03').style.display = 'block';
        document.getElementById('tab01').style.display = 'none';
        document.getElementById('for_tab01').classList.remove("is-active");
        document.getElementById('for_tab03').classList.add("is-active");
    }
    logicalDataL2Decision(graphContainerL2, ldL2List, clientWidth, ldName);
    logicalDataL1Decision(graphContainerL1, ldL2List, clientWidth, ldName);
});
function logicalDataL2Decision(container, ldL2List, clientWidth, ldName) {
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
        graph.keepEdgesInBackground = false;
        // Adds cells to the model in a single step
        graph.getModel().beginUpdate();
        configEdgeStyle(graph, "#000000");
        try {
            let lDecX = 0;
            let lDefY = 0;
            let lcX = clientWidth/2-150;
            let lDecX2 = clientWidth-450;
            let lcY = 200;
            let styleIdNode = null;
            let strokeColor = null;
            let nodeSize = {};

            let lcList = document.getElementById("logical_data_l2_decision_textual").getElementsByClassName("lc_list_log_des")[0].getElementsByClassName("lc_li");
            let lcDict = {};
            let lcName = null;
            for (let lc of lcList){
                let thread_ids = [];
                let threads = lc.getElementsByClassName('threads');
                for (let thr of threads){
                    thread_ids.push(thr.innerHTML);
                }
                lcName = lc.getElementsByClassName('lc_name')[0].innerHTML;
                lcDict[lcName] = thread_ids;
                // Draw all exsiting Logical Component at once  BEGIN
                // console.log(lcName);
                nodeSize = setNodeSize(lcName, 'LogicalComp');
                nodeStyle(graph, nodeSize['nodeIdText']);
                graph.insertVertex(parent, lcName, lcName, lcX, lcY, nodeSize['Width'], nodeSize['Height'], nodeSize['nodeIdText']);
                lcY += 250;
                // END
            }
            let lcListObj = Object.entries(lcDict);
            let logCompNode = null;
            //console.table(lcDict);
            let mxCells = graph.getChildVertices(graph.getDefaultParent());
            for (let i=0; i < ldL2List.length; i++) {
                let lDecText = ldL2List[i].firstElementChild.innerHTML.replace(/ /g, '');
                let varsList = ldL2List[i].getElementsByClassName("list_level1")[0].getElementsByClassName('variable_list')[0].getElementsByClassName('Var_op_list');
                let thread_list = ldL2List[i].getElementsByClassName("list_level1")[0].getElementsByClassName("thread_list")[0].getElementsByClassName('value');
                let Logical_component_list = ldL2List[i].getElementsByClassName("list_level1")[0].getElementsByClassName("Logical_component_list")[0].getElementsByClassName('value');
                //console.log(lDecText);
                //console.log(varsList);
                if (lDecText === "technical_data"){
                    let rawVarName = varsList[0].getElementsByClassName('key')[0].innerHTML;
                    let VarOpType = varsList[0].getElementsByClassName('value')[0].innerHTML;
                    let variableName =  (rawVarName.includes("."))? rawVarName.split(".")[0] : rawVarName;
                    let nodeType =  (rawVarName.includes("."))? 'logicalData' : 'variable';
                    let edgeStyle = null;
                    switch (VarOpType) {
                        case "STORE":
                            nodeType += '_W';
                            edgeStyle = 'dashed=0;endArrow=classic;sourcePerimeterSpacing=0;endFill=1;endSize=8;';
                            break;
                        case "LOAD":
                            nodeType += '_R';
                            edgeStyle = 'dashed=0;startArrow=classic;sourcePerimeterSpacing=0;startFill=1;startSize=8;';
                            break;
                        case "PROCESS":
                            nodeType += '_P';
                            edgeStyle = 'dashed=0;endArrow=classic;startArrow=classic;sourcePerimeterSpacing=0;startFill=1;endFill=1;endSize=8;startSize=10;';
                            break;
                    }
                    nodeSize = setNodeSize(variableName, nodeType);
                    nodeStyle(graph, nodeType);
                    console.log(nodeType);
                    let varNode = graph.insertVertex(parent, null, variableName, lDecX, 0, nodeSize['Width'], nodeSize['Height'], nodeType);

                    for (let lcForLd of Logical_component_list) {
                        mxCells.forEach(function (logComp) {
                            if (logComp['value'] === lcForLd.innerHTML) {
                                logCompNode = logComp;
                                graph.insertEdge(parent, null, null, logComp, varNode, edgeStyle);
                                logComp.source = varNode;
                                varNode.source = logComp;
                            }
                        });
                    }

                }
                else if (varsList.length > 0 && lDecText !== 'technical_data') {
                    let lDecId = 'ldL2_Dec' + i;
                    if (ldName !== null && ldName !== lDecText) {
                        styleIdNode = "LogicalDataInactive";
                        strokeColor = "strokeColor=#ccc;";
                    } else {
                        // if (varsList.length === 0){
                        //  styleIdNode = "variable";
                        // }else{
                        styleIdNode = "logicalData";
                        // }
                        strokeColor = "strokeColor=#000000;";
                    }
                    nodeSize = setNodeSize(lDecText, styleIdNode);
                    nodeStyle(graph, nodeSize['nodeIdText']);
                    //console.table(lDecText + ' === ' + lDecX + ' === ===' + lDefY);
                    lDecX = (i + 1) % 2 === 0 ? lDecX2 : 10;
                    lDefY = (i + 1) % 2 === 0 ? lDefY : lDefY += 200;
                    let stNode = graph.insertVertex(parent, lDecId, lDecText, lDecX, lDefY, nodeSize['Width'] + 80, nodeSize['Height'] + 80, nodeSize['nodeIdText']);

                    for (let lcForLd of Logical_component_list) {
                        mxCells.forEach(function (logComp) {
                            if (logComp['value'] === lcForLd.innerHTML) {
                                logCompNode = logComp;
                                graph.insertEdge(parent, null, null, logComp, stNode, 'dashed=0;endArrow=oval;startArrow=oval;sourcePerimeterSpacing=0;startFill=1;endFill=1;endSize=10;startSize=10;' + strokeColor);
                                logComp.source = stNode;
                                stNode.source = logComp;
                            }
                        });
                    }
                }
                // Draw threads that run this Logical Decision


                let lcText = [];
                //console.log(thread_list);
                for (let element of thread_list){
                    let thrId = element.innerHTML;
                    //console.log('thrId   -  ' + thrId);
                    lcListObj.forEach(function (item) {
                        if (item[1].includes(thrId)){
                            if (lcText.length < 1 || !lcText.includes(item[0])) {
                                lcText.push(item[0]);
                            }
                        }
                    });
                }
            }
            let ldUlrPath = "http://127.0.0.1:8000/logical_decision_L2";
            let lcUlrPath = "http://127.0.0.1:8000/logical_comp";
            ldLcGraphDoubleClickEvent(graph, ldUlrPath, lcUlrPath);
        }finally{
            // Updates the display
            graph.getModel().endUpdate();
        }
    }
}

function logicalDataL1Decision(container, ldL2List, clientWidth, ldName) {
    // Disables the built-in context menu
    mxEvent.disableContextMenu(container);
    // Creates the graph inside the given container
    var graph = new mxGraph(container);
    //graph.setEnabled(false);
    // graph.getStylesheet().getDefaultEdgeStyle();
    // Enables rubberband selection
    new mxRubberband(graph);
    var parent = graph.getDefaultParent();
    graph.keepEdgesInBackground = false;
    // Adds cells to the model in a single step
    graph.getModel().beginUpdate();
    configEdgeStyle(graph, "#000000");
    try {
        let varX = 20;
        let varY = 0;
        // let lDecX = 700;
        let lDefY = 50;
        let lDecX = clientWidth/2-200;
        let varX2 = clientWidth-300;
        let varText = null;
        let nodeSize = null;
        let styleOfNode = null;
        let sharedVar = null;
        let allSharedVars = document.getElementById("logical_data_l2_decision_textual").getElementsByClassName("var_list_log_des")[0].getElementsByClassName("var_li");

        for (let i=0; i < allSharedVars.length; i++){
            let varElement = allSharedVars[i];
            sharedVar = varElement.getElementsByClassName('lc_name')[0];
            varText = sharedVar.innerHTML.includes(".")? sharedVar.innerHTML.split(".")[0] : sharedVar.innerHTML ;
            styleOfNode = sharedVar.innerHTML.includes(".")? "logicalData" : "variable" ;
            nodeSize = setNodeSize(varText, styleOfNode);
            nodeStyle(graph, nodeSize['nodeIdText']);
            // to Draw Variable element
            varX = (i+1)%2 === 0 ? varX2 : 50;
            varY = (i+1)%2 === 0 ? varY : varY += 150;
            graph.insertVertex(parent, varText, varText, varX, varY, nodeSize['Width'], nodeSize['Height'], nodeSize['nodeIdText']);


        }
        //console.log(thread_list);
        let mxCells = graph.getChildVertices(graph.getDefaultParent());
        let styleIdNode = null;
        let strokeColor = null;
        for (let i=0; i < ldL2List.length; i++) {
            let logDesVarList = [];
            let lDecText = ldL2List[i].firstElementChild.innerHTML.replace(/ /g, '');
            let varList = ldL2List[i].getElementsByClassName("list_level1")[0].getElementsByClassName("variable_list")[0].getElementsByClassName('Var_op_list');

            for (let logDesVar of varList){
                let varName = logDesVar.getElementsByClassName('key')[0].innerHTML.includes(".") ? logDesVar.innerHTML.split(".")[0] : logDesVar.innerHTML;
                let VarOpType = logDesVar.getElementsByClassName('value')[0].innerHTML;
                if (!logDesVarList.includes(varName)){
                    logDesVarList.push([varName, VarOpType]);
                }
            };
            //console.log(lDecText);
            //console.log(logDesVarList);
            let lDecId = 'ldL2_Dec' + i;
            if (ldName !== null && ldName !== lDecText) {
                styleIdNode = "LogicalDataInactive";
                strokeColor = "strokeColor=#ccc;";
            } else {
                styleIdNode = "logicalData";
                strokeColor = "strokeColor=#000000;";
            }
            // console.log(styleIdNode);
            if (varList.length > 0 && lDecText !== 'technical_data'){
                nodeSize = setNodeSize(lDecText, styleIdNode);
                nodeStyle(graph, nodeSize['nodeIdText']);
                let stNode = graph.insertVertex(parent, lDecId, lDecText, lDecX, lDefY, nodeSize['Width']+80, nodeSize['Height']+80, nodeSize['nodeIdText']);
                lDefY += 200;
                let edgeStyle = null;


                for (let item of logDesVarList){
                    switch (item[1]) {
                        case "STORE":
                            edgeStyle = 'dashed=0;startArrow=classic;sourcePerimeterSpacing=0;startFill=1;startSize=8;endFill=0;endSize=0;';
                            break;
                        case "LOAD":
                            edgeStyle = 'dashed=0;endArrow=classic;sourcePerimeterSpacing=0;startFill=0;startSize=0;endFill=1;endSize=8;';
                            break;
                        case "PROCESS":
                            edgeStyle = 'dashed=0;endArrow=classic;startArrow=classic;sourcePerimeterSpacing=0;startFill=1;endFill=1;endSize=8;startSize=10;';
                            break;
                    }
                    let edgeVal = (ldName !== null && ldName !== lDecText) ? null : item[1];

                    mxCells.forEach(function (node) {
                        if ( item[0].includes(node['value']) ){
                            graph.insertEdge(parent, null, edgeVal, node, stNode, edgeStyle + strokeColor);
                        }
                    });
                }
            }
        }
        let tdUlrPath = "http://127.0.0.1:8000/Logical_Data_L1";
        let ldUlrPath = "http://127.0.0.1:8000/logical_decision_L2";
        ldTdGraphDoubleClickEvent(graph, tdUlrPath, ldUlrPath);

    }finally{
        // Updates the display
        graph.getModel().endUpdate();
    }
}
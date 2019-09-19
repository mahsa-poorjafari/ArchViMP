document.addEventListener('DOMContentLoaded', function() {

    let graphContainerL2 = document.getElementById('logical_data_l2_decision_diagram');
    let graphContainerL1 = document.getElementById('logical_data_l1_decision_diagram');
    let ldL2List = document.getElementById("logical_data_l2_decision_textual").getElementsByClassName("list_level0")[0].getElementsByClassName("li-list_level0");
    let clientWidth = document.getElementById('content').clientWidth;
    let ldName = get_node_name();
    if (ldName !== null){
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
                let lcNode = graph.insertVertex(parent, lcName, lcName, lcX, lcY, nodeSize['Width'], nodeSize['Height'], nodeSize['nodeIdText']);
                lcY += 250;
                // END
            }
            let lcListObj = Object.entries(lcDict);
            //console.table(lcDict);
            let mxCells = graph.getChildVertices(graph.getDefaultParent());
            for (let i=0; i < ldL2List.length; i++) {
                let lDecText = ldL2List[i].firstElementChild.innerHTML.replace(/ /g, '');
                let thread_list = ldL2List[i].getElementsByClassName("list_level1")[0].getElementsByClassName("thread_list")[0].getElementsByClassName('value');
                let Logical_component_list = ldL2List[i].getElementsByClassName("list_level1")[0].getElementsByClassName("Logical_component_list")[0].getElementsByClassName('value');
                // console.log(lDecText);
                // console.log(Logical_component_list);
                let lDecId = 'ldL2_Dec' + i;
                if (ldName !== null && ldName !== lDecText) {
                    styleIdNode = "LogicalDataInactive";
                    strokeColor = "strokeColor=#ccc;";
                } else {
                    styleIdNode = "logicalData";
                    strokeColor = "strokeColor=#000000;";
                }
                nodeSize = setNodeSize(lDecText, styleIdNode);
                nodeStyle(graph, nodeSize['nodeIdText']);
                //console.table(lDecText + ' === ' + lDecX + ' === ===' + lDefY);
                lDecX = (i+1)%2 === 0 ? lDecX2 : 10;
                lDefY = (i+1)%2 === 0 ? lDefY : lDefY += 200;
                let stNode = graph.insertVertex(parent, lDecId, lDecText, lDecX, lDefY, nodeSize['Width']+50, nodeSize['Height']+50, nodeSize['nodeIdText']);
                let logCompNode = null;
                for (let lcForLd of Logical_component_list){
                    mxCells.forEach(function (logComp){
                        if (logComp['value'] === lcForLd.innerHTML){
                            logCompNode = logComp;
                            graph.insertEdge(parent, null, null, logComp, stNode, 'dashed=0;endArrow=classic;startArrow=classic;sourcePerimeterSpacing=0;startFill=1;endFill=1;endSize=7;startSize=10;' + strokeColor);
                            logComp.source = stNode;
                            stNode.source = logComp;
                        }
                    });
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
            let varList = ldL2List[i].getElementsByClassName("list_level1")[0].getElementsByClassName("variable_list")[0].getElementsByClassName('value');

            for (let logDesVar of varList){
                let varName = logDesVar.innerHTML.includes(".") ? logDesVar.innerHTML.split(".")[0] : logDesVar.innerHTML ;
                if (!logDesVarList.includes(varName)){
                    logDesVarList.push(varName);
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
            nodeSize = setNodeSize(lDecText, styleIdNode);
            nodeStyle(graph, nodeSize['nodeIdText']);
            let stNode = graph.insertVertex(parent, lDecId, lDecText, lDecX, lDefY, nodeSize['Width']+50, nodeSize['Height']+50, nodeSize['nodeIdText']);
            lDefY += 200;
            mxCells.forEach(function (node) {
                if ( logDesVarList.includes(node['value']) ){
                    graph.insertEdge(parent, null, null, node, stNode, 'dashed=0;endArrow=diamondThin;sourcePerimeterSpacing=0;endFill=1;'+ strokeColor);
                    node.source = stNode;
                    stNode.source = node;
                }
            });
        }
        let tdUlrPath = "http://127.0.0.1:8000/Logical_Data_L1";
        let ldUlrPath = "http://127.0.0.1:8000/logical_decision_L2";
        ldTdGraphDoubleClickEvent(graph, tdUlrPath, ldUlrPath);

    }finally{
        // Updates the display
        graph.getModel().endUpdate();
    }
}
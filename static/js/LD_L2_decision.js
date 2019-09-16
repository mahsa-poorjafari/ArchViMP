document.addEventListener('DOMContentLoaded', function() {
    let graphContainerL2 = document.getElementById('logical_data_l2_decision_diagram');
    let graphContainerL1 = document.getElementById('logical_data_l1_decision_diagram');
    let ldL2List = document.getElementById("logical_data_l2_decision_textual").getElementsByClassName("list_level0")[0].getElementsByClassName("li-list_level0");
    logicalDataL2Decision(graphContainerL2, ldL2List);
    logicalDataL1Decision(graphContainerL1, ldL2List);
});
function logicalDataL2Decision(container, ldL2List) {
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
            let lDecX = 50;
            let lDefY = 50;
            let lcX = 900;
            let lcY = 200;
            let styleIdNode = null;
            let nodeSize = {};
            let ldName = get_node_name();
            let benchmarkName = get_url_benchmark();
            let fileName = get_url_fileName();
            let ulrParam = [benchmarkName];
            ulrParam.push((benchmarkName === "UPLOADED" && fileName) ? fileName : null);

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
                } else {
                    styleIdNode = "logicalData";
                }
                nodeSize = setNodeSize(lDecText, styleIdNode);
                nodeStyle(graph, nodeSize['nodeIdText']);
                //console.table(lDecText + ' === ' + lDecX + ' === ===' + lDefY);
                let stNode = graph.insertVertex(parent, lDecId, lDecText, lDecX, lDefY, nodeSize['Width']+50, nodeSize['Height']+50, nodeSize['nodeIdText']);
                let logCompNode = null;
                for (let lcForLd of Logical_component_list){
                    mxCells.forEach(function (logComp){
                        if (logComp['value'] === lcForLd.innerHTML){
                            logCompNode = logComp;
                            graph.insertEdge(parent, null, null, logComp, stNode, 'dashed=0;endArrow=classic;startArrow=classic;sourcePerimeterSpacing=0;startFill=1;endFill=1;endSize=7;startSize=10;');
                            logComp.source = stNode;
                            stNode.source = logComp;
                        }
                    });
                }
                // Draw threads that run this Logical Decision

                lDefY += 200;
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
                //console.log(lcText);
                // lcText.forEach(function (lc) {
                //     nodeSize = setNodeSize(lc, 'LogicalComp');
                //     nodeStyle(graph, nodeSize['nodeIdText']);
                //     //console.log(lc + ' --- ' +lcX + '  ---  ' + lcY);
                //     let lcNode = graph.insertVertex(parent, null, lc, lcX, lcY, nodeSize['Width'], nodeSize['Height'], nodeSize['nodeIdText']);
                //     lcY += 100;
                //     graph.insertEdge(parent, null, null, lcNode, stNode, 'dashed=0;endArrow=classic;startArrow=classic;sourcePerimeterSpacing=0;startFill=1;endFill=1;endSize=7;startSize=10;');
                //     lcNode.source = stNode;
                //     stNode.source = lcNode;
                // });

                // Draw Variables that have been accessed within this Logical Decision
                // let variableList = [];
                // for (let v of varList){
                //     variableList.push(v.innerHTML);
                // }
                // variableList.forEach(function (vVal) {
                //     let varText = vVal.includes('.') ? vVal.split(".")[0] : vVal;
                //     let nodeStyleVar = vVal.includes('.') ? 'logicalData' : 'variable';
                //     nodeSize = setNodeSize(varText, nodeStyleVar);
                //     nodeStyle(graph, nodeSize['nodeIdText']);
                //     // let varNode = graph.insertVertex(parent, null, varText, varX, varY, nodeSize['Width'], nodeSize['Height'], nodeSize['nodeIdText']);
                //     varY += 100;
                //
                //     //graph.insertEdge(parent, null, null, varNode, stNode, 'dashed=0;endArrow=diamondThin;sourcePerimeterSpacing=0;endFill=1;');
                //     //varNode.target = stNode;
                //     //stNode.source = varNode;
                // })
            }
            graph.addListener(mxEvent.DOUBLE_CLICK, function(sender, evt){
                let cell = evt.getProperty('cell');
                if (cell['style'].includes("logicalData")){
                    let cellValue = cell['value'].replace(/ /g,'');
                    //window.location = "http://127.0.0.1:8000/Logical_Data_L1?node="+cellValue+"&b=" + ulrParam[0] + (ulrParam[1] ? "&FileName="+ulrParam[1] : "");
                    document.getElementsByClassName('diagram_container').style.display = 'none';
                    document.getElementById('logical_data_l1_decision_diagram').style.display = 'block';
                }
                else if (cell['style'].includes("LogicalComp")){
                    let cellValue = cell['value'].replace(/ /g,'');
                    window.location = "http://127.0.0.1:8000/logical_comp?node="+cellValue+"&b=" + ulrParam[0] + (ulrParam[1] ? "&FileName="+ulrParam[1] : "");
                }
                evt.consume();
            });
        }finally{
            // Updates the display
            graph.getModel().endUpdate();
        }
    }
}
function LogDesGroupMembers(memberName) {

}
function logicalDataL1Decision(container, ldL2List) {
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
        let varY = 70;
        let lDecX = 700;
        let lDefY = 50;
        let varText = null;
        let lcText = [];
        let nodeSize = null;
        let styleOfNode = null;
        let sharedVar = null;
        let allSharedVars = document.getElementById("logical_data_l2_decision_textual").getElementsByClassName("var_list_log_des")[0].getElementsByClassName("var_li");
        let mxCells = null;

        for (let varElement of allSharedVars){
            sharedVar = varElement.getElementsByClassName('lc_name')[0];
            varText = sharedVar.innerHTML.includes(".")? sharedVar.innerHTML.split(".")[0] : sharedVar.innerHTML ;
            styleOfNode = sharedVar.innerHTML.includes(".")? "logicalData" : "variable" ;
            nodeSize = setNodeSize(varText, styleOfNode);
            nodeStyle(graph, nodeSize['nodeIdText']);
            // to Draw Variable element
            graph.insertVertex(parent, varText, varText, varX, varY, nodeSize['Width'], nodeSize['Height'], nodeSize['nodeIdText']);
            varY += 200;

        }
        //console.log(thread_list);
        mxCells = graph.getChildVertices(graph.getDefaultParent());

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
            console.log(lDecText);
            console.log(logDesVarList);
            let lDecId = 'ldL2_Dec' + i;

            nodeSize = setNodeSize(lDecText, 'logicalData');
            nodeStyle(graph, nodeSize['nodeIdText']);
            let stNode = graph.insertVertex(parent, lDecId, lDecText, lDecX, lDefY, nodeSize['Width']+50, nodeSize['Height']+50, nodeSize['nodeIdText']);
            lDefY += 200;
            mxCells.forEach(function (node) {
                if ( logDesVarList.includes(node['value']) ){
                    graph.insertEdge(parent, null, null, node, stNode, 'dashed=0;endArrow=diamondThin;sourcePerimeterSpacing=0;endFill=1;');
                    node.source = stNode;
                    stNode.source = node;
                }
            });
        }
        graph.addListener(mxEvent.DOUBLE_CLICK, function(sender, evt){
            let cell = evt.getProperty('cell');
            if (cell['style'].includes("logicalData")){
                let cellValue = cell['value'].replace(/ /g,'');
                window.location = "http://127.0.0.1:8000/Logical_Data_L1?node="+cellValue+"&b=" + ulrParam[0] + (ulrParam[1] ? "&FileName="+ulrParam[1] : "");
            }
            else if (cell['style'].includes("LogicalComp")){
                let cellValue = cell['value'].replace(/ /g,'');
                window.location = "http://127.0.0.1:8000/logical_comp?node="+cellValue+"&b=" + ulrParam[0] + (ulrParam[1] ? "&FileName="+ulrParam[1] : "");
            }
            evt.consume();
        });

    }finally{
        // Updates the display
        graph.getModel().endUpdate();
    }
}
document.addEventListener('DOMContentLoaded', function() {
    let graphContainer = document.getElementById('logical_data_l2_decision_diagram');
    logicalDataL2Decision(graphContainer);
});
function logicalDataL2Decision(container) {
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
            let ldL2List = document.getElementById("logical_data_l2_decision_textual").getElementsByClassName("list_level0")[0].getElementsByClassName("li-list_level0");
            let lcList = document.getElementById("logical_data_l2_decision_textual").getElementsByClassName("logical_components")[0].getElementsByClassName("lc_li");
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
                console.log(lcName);
                nodeSize = setNodeSize(lcName, 'LogicalComp');
                nodeStyle(graph, nodeSize['nodeIdText']);
                let lcNode = graph.insertVertex(parent, lcName, lcName, lcX, lcY, nodeSize['Width'], nodeSize['Height'], nodeSize['nodeIdText']);
                lcY += 200;
                // END
            }
            let lcListObj = Object.entries(lcDict);
            //console.table(lcDict);
            let mxCells = graph.getChildVertices(graph.getDefaultParent());
            for (let i=0; i < ldL2List.length; i++) {
                let lDecText = ldL2List[i].firstElementChild.innerHTML.replace(/ /g, '');
                let varList = ldL2List[i].getElementsByClassName("list_level1")[0].getElementsByClassName("variable_list")[0].getElementsByClassName('value');
                let thread_list = ldL2List[i].getElementsByClassName("list_level1")[0].getElementsByClassName("thread_list")[0].getElementsByClassName('value');
                let Logical_component_list = ldL2List[i].getElementsByClassName("list_level1")[0].getElementsByClassName("Logical_component_list")[0].getElementsByClassName('value');
                console.log(lDecText);
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
                        console.log(lcForLd);
                        console.log(logComp['value']);
                        if (logComp['value'] === lcForLd.innerHTML){
                            logCompNode = logComp;
                            graph.insertEdge(parent, null, null, logComp, stNode, 'dashed=0;endArrow=classic;startArrow=classic;sourcePerimeterSpacing=0;startFill=1;endFill=1;endSize=7;startSize=10;');
                            logComp.source = stNode;
                            stNode.source = logComp;
                        }

                    });
                }

                // Draw threads that run this Logical Decision
                let lcX = lDecX + 500;
                let lcY = lDefY - 50;
                let varX = 100;
                let varY = lDefY + 50;
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
                let variableList = [];
                for (let v of varList){
                    variableList.push(v.innerHTML);
                }
                variableList.forEach(function (vVal) {
                    let varText = vVal.includes('.') ? vVal.split(".")[0] : vVal;
                    let nodeStyleVar = vVal.includes('.') ? 'logicalData' : 'variable';
                    nodeSize = setNodeSize(varText, nodeStyleVar);
                    nodeStyle(graph, nodeSize['nodeIdText']);
                    // let varNode = graph.insertVertex(parent, null, varText, varX, varY, nodeSize['Width'], nodeSize['Height'], nodeSize['nodeIdText']);
                    varY += 100;
                    graph.addListener(mxEvent.DOUBLE_CLICK, function(sender, evt){
                        let cell = evt.getProperty('cell');
                        if (cell['style'].includes("logicalData") && cell['target'] !== null){
                            let cellValue = cell['value'].replace(/ /g,'');
                            window.location = "http://127.0.0.1:8000/Logical_Data_L1?node="+cellValue+"&b=" + ulrParam[0] + (ulrParam[1] ? "&FileName="+ulrParam[1] : "");
                        }
                        else if (cell['style'].includes("LogicalComp")){
                            let cellValue = cell['value'].replace(/ /g,'');
                            window.location = "http://127.0.0.1:8000/logical_comp?node="+cellValue+"&b=" + ulrParam[0] + (ulrParam[1] ? "&FileName="+ulrParam[1] : "");
                        }
                        evt.consume();
                    });
                    //graph.insertEdge(parent, null, null, varNode, stNode, 'dashed=0;endArrow=diamondThin;sourcePerimeterSpacing=0;endFill=1;');
                    //varNode.target = stNode;
                    //stNode.source = varNode;
                })
            }
        }finally{
            // Updates the display
            graph.getModel().endUpdate();
        }
    }
}

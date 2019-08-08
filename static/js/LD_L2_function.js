document.addEventListener('DOMContentLoaded', function() {
    let graphContainer = document.getElementById('logical_data_l2_function_diagram');
    logicalDataL2Function(graphContainer);
});


function logicalDataL2Function(container) {
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
            let ldName = get_node_name();
            let benchmarkName = get_url_benchmark();
            let fileName = get_url_fileName();
            let ulrParam = [benchmarkName];
            ulrParam.push((benchmarkName === "UPLOADED" && fileName) ? fileName : null);
            let ldL2List = document.getElementById("logical_data_l2_function_textual").getElementsByClassName("list_level0")[0].getElementsByClassName("li-list_level0");
            for (let i=0; i < ldL2List.length; i++){
                let ldtext = ldL2List[i].firstElementChild.innerHTML.replace(/ /g,'');
                let varList = ldL2List[i].getElementsByClassName("list_level1")[0].getElementsByClassName("li-list_level1");
                let stId = 'ldL2_' + i;
                if (ldName !== null && ldName !== ldtext){
                    styleIdNode = "LogicalDataInactive";
                }else{
                    styleIdNode = "logicalData";
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
                console.log("___________  " + ldtext);
                drawTdForLd(graph, parent, stNode, varList, null, ulrParam);
                // drawChild(graph, parent, stNode, varList, 'diamondThin', '1', 0, 'variable');
            }

        }finally{
            // Updates the display
            graph.getModel().endUpdate();

        }
    }
    
}
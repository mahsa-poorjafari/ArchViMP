document.addEventListener('DOMContentLoaded', function() {
    let graphContainer = document.getElementById('logical_comp_diagram');
    main(graphContainer);
});
function main(container) {
    // Checks if the browser is supported
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

        try {
            let threadList = document.getElementById("logical_comp_textual").getElementsByClassName("list_level0")[0].getElementsByClassName('li-list_level0');
            nodeStyle(graph, 'LogicalComp');
            configEdgeStyle(graph, "#000000");
            let fW = 50;
            let fH = 100;
            let tW = 20;
            let tH = 300;
            let thrNode = null;
            let styleIdNode = "LogicalComp";
            let lcName = get_node_name();
            for (let i=0; i<threadList.length; i++){
                let thrId = 'thr' + i;
                let thrText = threadList[i].getElementsByTagName("span")[0].innerHTML;
                let thrFunc = threadList[i].getElementsByClassName('li-list_level1')[0].innerHTML.replace(/[\n\r ]/g, "");

                if (thrText.includes("_")){
                    thrText = thrText.replace(/_/g, "\n");
                    styleIdNode = "mainThread";
                    tW += 150;
                }else {
                    styleIdNode = "thread";

                }
                nodeStyle(graph, styleIdNode);
                thrNode = graph.insertVertex(parent, thrId, thrText, tW, tH, 120, 80, styleIdNode);
                tW += 150;
                let funcId = "func_" + i;
                if (lcName !== null && lcName !== thrFunc){
                    styleIdNode = "LogicalCompInactive";
                }else{
                    styleIdNode = "LogicalComp";
                }
                // console.table([thrFunc, lcName, styleIdNode]);
                nodeStyle(graph, styleIdNode);
                let funcNode = graph.insertVertex(parent, funcId, thrFunc, fW, fH, 120, 80, styleIdNode);

                fW += 150;
                thrNode.target = funcNode;
                graph.insertEdge(parent, null, null, thrNode, funcNode, 'dashed=0;' +
                            'endArrow=diamondThin;sourcePerimeterSpacing=0;startFill=0;endFill=0;');
            }

        }
        finally {
            //console.table( graph.getChildVertices(graph.getDefaultParent()));
            graph.getModel().endUpdate();

        }
    }
}
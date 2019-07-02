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

        // Adds cells to the model in a single step
        graph.getModel().beginUpdate();


        try {

            let threadList = document.getElementById("logical_comp_textual").getElementsByClassName("threads")[0].getElementsByTagName("li");
            nodeStyle(graph, 'LogicalComp');
            configEdgeStyle(graph, "#000000");
            let fW = 50;
            let fH = 100;
            let tW = 20;
            let tH = 300;
            let thrNode = null;
            // addThreadNodes(graph, parent, threadList, 20, 300);
            // var thrCells = graph.getChildVertices(graph.getDefaultParent());
            // console.table( graph.getChildVertices(graph.getDefaultParent()));
            for (let i=0; i<threadList.length; i++){
                let thrId = 'thr' + i;
                let thrText = threadList[i].getElementsByTagName("span")[0].innerHTML;
                if (thrText.includes("_")){
                    thrText = thrText.replace(/_/g, "\n");
                    nodeStyle(graph, "mainThread");
                    thrNode = graph.insertVertex(parent, thrId, thrText, tW, tH, 120, 80, 'mainThread');
                    tW += 150;
                }else {
                    nodeStyle(graph, "thread");
                    thrNode = graph.insertVertex(parent, thrId, thrText, tW, tH, 120, 80, 'thread');
                    tW += 150;
                }
                let funcId = "func_" + i;
                let thrFunc = threadList[i].getElementsByTagName('lo')[0].innerHTML;
                let funcNode = graph.insertVertex(parent, funcId, thrFunc, fW, fH, 120, 80, 'LogicalComp');
                fW += 150;
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
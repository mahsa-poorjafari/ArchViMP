document.addEventListener('DOMContentLoaded', function() {
    let graphContainer = document.getElementById('logical_comp_diagram');
    let clientWidth = document.getElementById('content').clientWidth;
    let lcName = get_node_name();
    main(graphContainer, clientWidth, lcName);
});
function main(container, clientWidth, lcName) {
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
            nodeStyle(graph, 'LogicalComp');
            configEdgeStyle(graph, "#000000");
            let fX = 20;
            let fX2 = clientWidth-450;
            let fY = 70;
            // let tX = 500;
            let tX = clientWidth/2-200;
            let tY = 0;
            let styleIdNode = "LogicalComp";
            let logCompList = [];
            // let thrFunc = threadList[i].getElementsByClassName('li-list_level1')[0].innerHTML.replace(/[\n\r ]/g, "");
            let threads = document.getElementsByClassName('thread_id_list')[0].getElementsByClassName('thread_id');
            let logicalComponentList = document.getElementById("logical_comp_textual").getElementsByClassName("lc_for_threads")[0].getElementsByClassName('li-list_level0');
            for (let thr of threads){
                let thrText = thr.innerHTML.replace(/ /g, '');
                if (thrText.includes("_")) {
                    thrText = thrText.replace(/_/g, "\n");
                    styleIdNode = "mainThread";
                } else {
                    styleIdNode = "thread";
                }
                nodeStyle(graph, styleIdNode);
                graph.insertVertex(parent, null, thrText, tX, tY, 120, 80, styleIdNode);
                tY += 150;
            }
            let mxCells = graph.getChildVertices(graph.getDefaultParent());
            for (let i=0; i<logicalComponentList.length; i++) {
                let logComp = logicalComponentList[i];
                let lcId = 'LC' + i;
                let lcText = logComp.getElementsByClassName("log_comp_name")[0].innerHTML.replace(/[\n\r ]/g, "");
                let lcThrElements = logComp.getElementsByClassName('thread_id');
                let lcThrList = [];
                for (let thr of lcThrElements){
                    lcThrList.push(thr.innerHTML.replace(/ /g, ''));
                }
                if (lcName !== null && lcName !== lcText) {
                    styleIdNode = "LogicalCompInactive";
                } else {
                    styleIdNode = "LogicalComp";
                }
                nodeStyle(graph, styleIdNode);
                fX = (i+1)%2 === 0 ? fX2 : 50;
                fY = (i+1)%2 === 0 ? fY : fY += 150;
                //console.log(lcText);
                //console.log(lcThrList);

                let lcNode = graph.insertVertex(parent, lcId, lcText, fX, fY, 120, 80, styleIdNode);
                // fY += 150;
                mxCells.forEach(function (node) {
                    let nodeValue = node['value'].includes("\n")? node['value'].split("\n")[1] : node['value'];
                    console.log(nodeValue);
                    if ((node['style'] === 'thread' || node['style'] === 'mainThread') && lcThrList.includes(nodeValue)){
                        graph.insertEdge(parent, null, null, node, lcNode, 'dashed=0;' +
                            'endArrow=diamondThin;sourcePerimeterSpacing=0;startFill=0;endFill=0;');
                        node.target = lcNode;
                        lcNode.source = node;
                    }
                });

            }

        }finally {
            //console.table( graph.getChildVertices(graph.getDefaultParent()));
            graph.getModel().endUpdate();

        }
    }
}
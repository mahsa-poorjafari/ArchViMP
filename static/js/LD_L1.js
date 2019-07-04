document.addEventListener('DOMContentLoaded', function() {
    let graphContainer = document.getElementById('logical_data_l1_diagram');
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
            // let varH = 500;
            // let varW = 20;
            let stX = null;
            let stY = null;

            configEdgeStyle(graph, "#000000");

            let structList = document.getElementById("logical_data_l1_textual").getElementsByClassName("shared_struct")[0].getElementsByTagName("li");
            // console.table(structList);
            let stNode = null;
            let nodeSize = {};
            for (let i = 0; i < structList.length; i++) {

                let stText = structList[i].getElementsByTagName("span")[0].innerHTML;
                let stVarList = structList[i].getElementsByTagName("lo");
                // console.log(structText);
                nodeSize = setNodeSize(stText, 'logicalData' );

                if (stText !== "variables") {
                    let stId = 'st' + i;
                    nodeStyle(graph, nodeSize['nodeIdText']);
                    if (i === 0 || i === 1){
                        stX = 200;
                        stY = 200;
                    }
                    else if (i !== 0 && structList.length <= 4){
                        stX += 500;
                    }
                    else if (i !== 0 && structList.length > 4 && (i-1)%2 === 0){
                        stX += 700;
                    }else{
                        stY += 400;
                        stX = 200;
                    }
                    // stX += 200;
                    stNode = graph.insertVertex(parent, stId, stText, stX, stY, nodeSize['Width'], nodeSize['Height'], nodeSize['nodeIdText']);
                    drawChild(graph, parent, stNode, stVarList, 'diamondThin', '1', 'variable');

                }else{
                    //varW = 20;

                    drawChild(graph, parent, null, stVarList, 'diamondThin', '1', 'variable');
                }


            }
            // console.table( graph.getChildVertices(graph.getDefaultParent()));

        }

        finally
        {
            // Updates the display
            graph.getModel().endUpdate();
        }

    }

}

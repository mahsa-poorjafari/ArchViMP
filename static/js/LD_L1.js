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

            let structList = document.getElementById("logical_data_l1_textual").getElementsByClassName("list_level0")[0].getElementsByTagName("li");
            // console.log("Before Sort--------------------------------");
            // console.log(structList);
            // structList = Array.prototype.slice.call(structList);
            // structList.sort(function(a, b){
            //     return a.textContent.localeCompare(b.textContent);
            // });
            // console.log("AFter Sort-------------------------------");
            // console.log(structList);
            let stNode = null;
            let nodeSize = {};
            for (let i = 0; i < structList.length; i++) {

                let stText = structList[i].getElementsByTagName("span")[0].innerHTML;
                let stVarList = structList[i].getElementsByTagName("lo");

                nodeSize = setNodeSize(stText, 'logicalData' );

                if (stText !== "variables") {
                    let stId = 'st' + i;
                    nodeStyle(graph, nodeSize['nodeIdText']);
                    if (i === 0 || i === 1){
                        stX = 200;
                        stY = 300;
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
                    stNode = graph.insertVertex(parent, stId, stText, stX, stY, nodeSize['Width'], nodeSize['Height'], nodeSize['nodeIdText']);
                    drawChild(graph, parent, stNode, stVarList, 'diamondThin', '1', 'variable');

                }else{
                    let mxCells = graph.getChildVertices(graph.getDefaultParent());
                    let parentList = [];
                    mxCells.forEach(function (node) {
                        (node.target === null) ? parentList.push(node) : "";
                    });
                    let lastNode = parentList[parentList.length-1];
                    let lastNodePosition = lastNode['geometry']['y'] + 300;

                    let lastChild = structList.length;
                    let varList = structList[lastChild-1].getElementsByClassName('thr_op')[0].getElementsByTagName('lo');
                    stX = 0;
                    stY = lastNodePosition;
                    // drawChild(graph, parent, null, stVarList, 'diamondThin', '1', 'variable');
                    for (let j = 0; j < varList.length; j++) {
                        let Text = varList[j].innerHTML;
                        nodeSize = {};
                        nodeSize = setNodeSize(Text, "variable" );
                        let nodeId = 'var_' + j;
                        nodeStyle(graph, nodeSize['nodeIdText']);
                        graph.insertVertex(parent, nodeId, Text, stX, stY, nodeSize['Width'], nodeSize['Height'], nodeSize['nodeIdText']);
                        if (j%7 === 0) {
                            stY += 200;
                            stX = 0;
                        }else{
                            stX += 200;
                        }
                    }
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
